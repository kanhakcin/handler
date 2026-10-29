// Handler Study Site - study progress, quizzes, search, and exam tools
const SUBJECTS = [
  { id: 'portugues', name: 'Português' },
  { id: 'matematica', name: 'Matemática' },
  { id: 'fisica', name: 'Física' },
  { id: 'biologia', name: 'Biologia' },
  { id: 'quimica', name: 'Química' }
];
const PROGRESS_KEY = 'handlerProgress';
const SCORES_KEY = 'handlerBestScores';
const EXPLANATIONS = {
  biologia: [
    'Células eucarióticas têm núcleo delimitado por membrana. Procarióticas não têm núcleo organizado, embora possuam material genético e membrana plasmática.',
    'No DNA, adenina emparelha com timina (A-T), enquanto citosina emparelha com guanina (C-G).',
    'A energia flui pelo ecossistema e parte se dissipa como calor a cada transferência entre níveis tróficos.',
    'Nas células vegetais, a fotossíntese ocorre nos cloroplastos, que contêm clorofila e outras estruturas necessárias ao processo.',
    'A meiose reduz à metade o número de cromossomos e geralmente origina quatro células; a mitose mantém o número cromossômico.'
  ],
  fisica: [
    'A velocidade média escalar é a distância dividida pelo tempo: 200 m ÷ 10 s = 20 m/s.',
    'Pela segunda lei de Newton, a = F/m = 12 N ÷ 3 kg = 4 m/s².',
    'O som é uma onda mecânica, portanto precisa de partículas de um meio material para transmitir a perturbação.',
    'Como força e deslocamento têm a mesma direção, W = F·d = 10 N × 3 m = 30 J.',
    'A pressão hidrostática depende da profundidade: p = p₀ + ρgh. Aumentando h, a pressão aumenta.'
  ],
  matematica: [
    'Somando 6 aos dois lados de 3x − 6 = 0 e dividindo por 3, obtemos x = 2.',
    'A área é A = πr². Para r = 2, A ≈ 3,14 × 2² = 12,56 unidades².',
    'Seno é cateto oposto dividido pela hipotenusa: 3/5 = 0,6.',
    '15% = 0,15; então 0,15 × 200 = 30.',
    'A razão da PA é 3. O quarto termo é 2 + 3 × 3 = 11.'
  ],
  portugues: [
    'A tese é a posição principal que o autor defende; os argumentos são usados para sustentá-la.',
    '“As pesquisadoras” é quem pratica a ação de apresentar, portanto é o sujeito da oração.',
    'Uma inferência adequada combina informações do texto e do contexto e precisa ser justificada por pistas presentes na leitura.',
    'A expressão inicial “Depois da aula” está deslocada e pode ser separada por vírgula. Não se separa o sujeito do verbo nem o verbo de seu complemento.',
    'Gênero e linguagem dependem da finalidade do texto, do público e da situação de comunicação.'
  ],
  quimica: [
    'O número atômico Z indica o número de prótons. Em um átomo neutro, prótons e elétrons são iguais; portanto, Z = 8 significa 8 elétrons.',
    'Íons Na⁺ e Cl⁻, de cargas opostas, se atraem eletrostaticamente e formam uma rede cristalina iônica.',
    'Os coeficientes da equação balanceada mostram a proporção molar: 1 mol de CH₄ reage com 2 mol de O₂.',
    'A tabela periódica moderna organiza os elementos em ordem crescente de número atômico.',
    'A concentração comum é C = m/V = 10 g ÷ 2 L = 5 g/L.'
  ]
};

function readStore(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Não foi possível ler os dados salvos em ${key}.`, error);
    return {};
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSubjectId() {
  const path = location.pathname.toLowerCase();
  const match = SUBJECTS.find(subject => path.endsWith(`/${subject.id}.html`));
  return match ? match.id : null;
}

function initTheme() {
  const toggle = document.querySelector('.mode-toggle');
  if (!toggle) return;
  document.body.classList.toggle('dark-mode', localStorage.getItem('darkMode') === 'true');
  toggle.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', String(enabled));
  });
}

function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('a, button')) return;
      location.href = `subjects/${card.dataset.subject}.html`;
    });
  });
}

function initLessons() {
  const subjectId = getSubjectId();
  if (!subjectId) return;
  const progress = readStore(PROGRESS_KEY);
  const completed = new Set(progress[subjectId] || []);
  const progressSummary = document.createElement('div');
  progressSummary.className = 'lesson-progress';
  progressSummary.setAttribute('aria-live', 'polite');
  const progressBar = document.createElement('progress');
  const progressLabel = document.createElement('span');
  progressSummary.append(progressBar, progressLabel);
  document.querySelector('.subject-nav')?.append(progressSummary);

  document.querySelectorAll('.lesson-card').forEach((card, index) => {
    const lessonId = `lesson-${index + 1}`;
    card.id = lessonId;
    const title = card.querySelector('h3')?.textContent.trim() || `Aula ${index + 1}`;
    const completeButton = document.createElement('button');
    completeButton.type = 'button';
    completeButton.className = 'lesson-complete';
    completeButton.textContent = completed.has(lessonId) ? 'Concluída' : 'Marcar como concluída';
    completeButton.setAttribute('aria-pressed', String(completed.has(lessonId)));
    card.append(completeButton);

    completeButton.addEventListener('click', () => {
      const isComplete = !completed.has(lessonId);
      if (isComplete) completed.add(lessonId);
      else completed.delete(lessonId);
      progress[subjectId] = [...completed];
      writeStore(PROGRESS_KEY, progress);
      completeButton.textContent = isComplete ? 'Concluída' : 'Marcar como concluída';
      completeButton.setAttribute('aria-pressed', String(isComplete));
      card.classList.toggle('is-complete', isComplete);
      updateCurrentProgress(progressSummary, completed.size, document.querySelectorAll('.lesson-card').length);
      updateSubjectProgress();
    });
    card.classList.toggle('is-complete', completed.has(lessonId));

    card.addEventListener('click', event => {
      if (event.target.closest('button, input, a')) return;
      const content = card.querySelector('.lesson-content');
      if (!content) return;
      content.classList.toggle('is-collapsed');
    });
  });
  updateCurrentProgress(progressSummary, completed.size, document.querySelectorAll('.lesson-card').length);

  if (location.hash.startsWith('#lesson-')) {
    const target = document.querySelector(location.hash);
    if (target) {
      const content = target.querySelector('.lesson-content');
      if (content) content.classList.remove('is-collapsed');
      requestAnimationFrame(() => target.scrollIntoView());
    }
  }
}

function updateCurrentProgress(container, done, total) {
  const progress = container.querySelector('progress');
  const label = container.querySelector('span');
  progress.max = total;
  progress.value = done;
  label.textContent = `${done} de ${total} aulas concluídas`;
}

function updateSubjectProgress() {
  const progress = readStore(PROGRESS_KEY);
  document.querySelectorAll('.subject-card[data-subject]').forEach(card => {
    const subjectId = card.dataset.subject;
    const total = Number(card.dataset.lessonCount || 0);
    const done = (progress[subjectId] || []).length;
    const status = card.querySelector('.subject-progress');
    if (!status || !total) return;
    status.textContent = `${done} de ${total} aulas concluídas`;
    const bar = status.querySelector('progress');
    if (bar) {
      bar.max = total;
      bar.value = done;
    }
  });
}

function initQuizzes() {
  const subjectId = getSubjectId();
  const savedScores = readStore(SCORES_KEY);

  document.querySelectorAll('.quiz').forEach(quiz => {
    const questions = [...quiz.querySelectorAll('.quiz-question')];
    const scoreEl = quiz.querySelector('#quiz-score');
    if (!questions.length) return;
    questions.forEach((question, index) => {
      const feedback = document.createElement('p');
      feedback.className = 'quiz-feedback';
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      question.append(feedback);

      question.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
          const correct = input.value === 'correct';
          const correctLabel = [...question.querySelectorAll('label')]
            .find(label => label.querySelector('input')?.value === 'correct');
          const explanation = EXPLANATIONS[subjectId]?.[index] || '';
          feedback.textContent = correct
            ? `Correta. ${explanation}`
            : `Incorreta. A resposta certa é “${correctLabel?.textContent.trim()}”. ${explanation}`;
          feedback.classList.toggle('is-correct', correct);
          feedback.classList.toggle('is-incorrect', !correct);

          question.querySelectorAll('label').forEach(label => {
            label.classList.remove('is-correct', 'is-incorrect');
          });
          correctLabel?.classList.add('is-correct');
          if (!correct) input.closest('label')?.classList.add('is-incorrect');

          const answers = questions
            .map(item => item.querySelector('input[type="radio"]:checked'))
            .filter(Boolean);
          const correctCount = answers.filter(answer => answer.value === 'correct').length;
          scoreEl.textContent = `Progresso: ${answers.length}/${questions.length}`;
          scoreEl.classList.remove('quiz-score--success', 'quiz-score--review');

          if (answers.length === questions.length) {
            const percent = Math.round((correctCount / questions.length) * 100);
            scoreEl.textContent = `Resultado: ${correctCount}/${questions.length} (${percent}%). ${
              correctCount === questions.length
                ? 'Todas as respostas estão corretas.'
                : 'Revise as respostas incorretas e tente novamente.'
            }`;
            scoreEl.classList.add(
              correctCount === questions.length ? 'quiz-score--success' : 'quiz-score--review'
            );
            if (subjectId) {
              const bestScores = readStore(SCORES_KEY);
              bestScores[subjectId] = Math.max(bestScores[subjectId] || 0, correctCount);
              writeStore(SCORES_KEY, bestScores);
              showBestScore(quiz, bestScores[subjectId], questions.length);
            }
          }
        });
      });
    });

    if (subjectId && savedScores[subjectId] !== undefined) {
      showBestScore(quiz, savedScores[subjectId], questions.length);
    }
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'quiz-reset';
    reset.textContent = 'Refazer quiz';
    quiz.append(reset);
    reset.addEventListener('click', () => {
      quiz.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
      quiz.querySelectorAll('.quiz-feedback').forEach(feedback => {
        feedback.textContent = '';
        feedback.classList.remove('is-correct', 'is-incorrect');
      });
      quiz.querySelectorAll('label').forEach(label => {
        label.classList.remove('is-correct', 'is-incorrect');
      });
      scoreEl.textContent = 'Escolha uma alternativa para começar.';
      scoreEl.classList.remove('quiz-score--success', 'quiz-score--review');
    });
  });
}

function showBestScore(quiz, score, total) {
  let best = quiz.querySelector('.quiz-best');
  if (!best) {
    best = document.createElement('p');
    best.className = 'quiz-best';
    quiz.insertBefore(best, quiz.querySelector('#quiz-score'));
  }
  best.textContent = `Melhor resultado salvo: ${score}/${total}`;
}

async function loadSubjectPages() {
  const pages = await Promise.all(SUBJECTS.map(async subject => {
    const url = `subjects/${subject.id}.html`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Não foi possível carregar ${url}: ${response.status}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const lessons = [...doc.querySelectorAll('.lesson-card')].map((lesson, index) => ({
      id: `lesson-${index + 1}`,
      title: lesson.querySelector('h3')?.textContent.trim() || `Aula ${index + 1}`,
      text: lesson.textContent.replace(/\s+/g, ' ').trim()
    }));
    const questions = [...doc.querySelectorAll('.quiz-question')].map(question => ({
      subject: subject.name,
      prompt: question.querySelector('p')?.textContent.trim() || '',
      choices: [...question.querySelectorAll('label')].map(label => ({
        text: label.textContent.trim(),
        correct: label.querySelector('input')?.value === 'correct'
      }))
    })).filter(question => question.prompt && question.choices.length > 1 &&
      question.choices.some(choice => choice.correct));
    return { ...subject, lessons, questions };
  }));
  return pages;
}

function initSubjectSearch(pages) {
  const input = document.querySelector('#content-search');
  const filter = document.querySelector('#subject-filter');
  const results = document.querySelector('#search-results');
  if (!input || !filter || !results) return;

  const render = () => {
    const term = input.value.trim().toLocaleLowerCase('pt-BR');
    const selected = filter.value;
    const matches = pages.flatMap(subject => subject.lessons
      .filter(lesson => (!selected || selected === subject.id) &&
        (!term || `${subject.name} ${lesson.title} ${lesson.text}`.toLocaleLowerCase('pt-BR').includes(term)))
      .map(lesson => ({ ...lesson, subject })))
      .slice(0, 12);
    results.replaceChildren();
    if (!term && !selected) {
      results.hidden = true;
      return;
    }
    results.hidden = false;
    if (!matches.length) {
      results.textContent = 'Nenhuma aula encontrada.';
      return;
    }
    matches.forEach(match => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = `subjects/${match.subject.id}.html#${match.id}`;
      const title = document.createElement('strong');
      title.textContent = match.title;
      const subjectName = document.createElement('span');
      subjectName.textContent = match.subject.name;
      link.append(title, subjectName);
      results.append(link);
    });
  };
  input.addEventListener('input', render);
  filter.addEventListener('change', render);
}

function initExam(pages) {
  const startButton = document.querySelector('#start-exam');
  const exam = document.querySelector('#mock-exam');
  if (!startButton || !exam) return;

  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    try {
      startExamRun(pages, exam, startButton);
    } catch (error) {
      console.error('Não foi possível iniciar o simulado.', error);
      const message = document.createElement('p');
      message.className = 'exam-result quiz-score--review';
      message.textContent = 'Não foi possível carregar as questões. Verifique a conexão e tente novamente.';
      exam.replaceChildren(message);
      exam.hidden = false;
      startButton.disabled = false;
    }
  });
}

function startExamRun(pages, exam, startButton) {
  const questionPool = pages.flatMap(subject => subject.questions);
  for (let index = questionPool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questionPool[index], questionPool[swapIndex]] = [questionPool[swapIndex], questionPool[index]];
  }
  const selected = questionPool.slice(0, 10);
  if (selected.length < 10) throw new Error('O simulado precisa de pelo menos 10 questões.');
  renderExam(selected, exam, startButton);
}

function initQuickGame(pages) {
  const startButton = document.querySelector('#start-game');
  const game = document.querySelector('#quick-game');
  const bestLabel = document.querySelector('#game-best');
  if (!startButton || !game || !bestLabel) return;

  const bestScores = readStore(SCORES_KEY);
  bestLabel.textContent = `Seu recorde: ${bestScores.quickGame || 0} pontos`;

  startButton.addEventListener('click', () => {
    const questions = pages.flatMap(subject => subject.questions);
    if (!questions.length) {
      console.error('Não há perguntas disponíveis para o desafio relâmpago.');
      game.textContent = 'Não foi possível carregar as perguntas. Tente novamente mais tarde.';
      game.hidden = false;
      return;
    }

    startButton.disabled = true;
    startButton.hidden = true;
    game.hidden = false;
    startQuickGame(questions, game, startButton, bestLabel);
  });
}

function startQuickGame(questionPool, game, startButton, bestLabel) {
  const questions = [...questionPool];
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
  }

  let score = 0;
  let streak = 0;
  let questionIndex = 0;
  let remaining = 60;
  let locked = false;
  let finished = false;
  let advanceTimeout;

  const heading = document.createElement('h2');
  heading.textContent = 'Desafio relâmpago';
  const hud = document.createElement('div');
  hud.className = 'game-hud';
  const timer = document.createElement('p');
  timer.className = 'game-timer';
  timer.setAttribute('role', 'timer');
  const scoreLabel = document.createElement('p');
  scoreLabel.className = 'game-score';
  const streakLabel = document.createElement('p');
  streakLabel.className = 'game-streak';
  hud.append(timer, scoreLabel, streakLabel);

  const subjectLabel = document.createElement('p');
  subjectLabel.className = 'game-subject';
  const prompt = document.createElement('h3');
  prompt.className = 'game-prompt';
  const choices = document.createElement('div');
  choices.className = 'game-choices';
  const feedback = document.createElement('p');
  feedback.className = 'game-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  game.replaceChildren(heading, hud, subjectLabel, prompt, choices, feedback);

  const renderHud = () => {
    timer.textContent = `Tempo: ${remaining}s`;
    scoreLabel.textContent = `Pontos: ${score}`;
    streakLabel.textContent = streak > 1 ? `Sequência: ${streak} acertos` : 'Acerte em sequência para ganhar bônus!';
  };

  const showQuestion = () => {
    if (finished) return;
    if (questionIndex >= questions.length) {
      for (let index = questions.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
      }
      questionIndex = 0;
    }
    const question = questions[questionIndex];
    questionIndex += 1;
    locked = false;
    feedback.textContent = '';
    feedback.classList.remove('is-correct', 'is-incorrect');
    subjectLabel.textContent = question.subject;
    prompt.textContent = question.prompt;
    choices.replaceChildren();

    question.choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-choice';
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        if (locked || finished) return;
        locked = true;
        choices.querySelectorAll('button').forEach(option => { option.disabled = true; });
        if (choice.correct) {
          streak += 1;
          const points = 10 + Math.min(streak - 1, 4);
          score += points;
          feedback.textContent = `Correto! +${points} pontos${streak > 1 ? ` · ${streak} acertos seguidos!` : ''}`;
          feedback.classList.add('is-correct');
          feedback.classList.remove('is-incorrect');
        } else {
          const correctChoice = question.choices.find(option => option.correct);
          streak = 0;
          feedback.textContent = `Quase! A resposta era: ${correctChoice?.text || 'veja o conteúdo da disciplina'}.`;
          feedback.classList.add('is-incorrect');
          feedback.classList.remove('is-correct');
        }
        renderHud();
        advanceTimeout = setTimeout(showQuestion, 800);
      });
      choices.append(button);
    });
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    clearTimeout(advanceTimeout);
    const scores = readStore(SCORES_KEY);
    const previousBest = scores.quickGame || 0;
    scores.quickGame = Math.max(previousBest, score);
    writeStore(SCORES_KEY, scores);
    bestLabel.textContent = `Seu recorde: ${scores.quickGame} pontos`;
    const result = document.createElement('p');
    result.className = 'game-result';
    result.textContent = score > previousBest
      ? `Fim de jogo! Você fez ${score} pontos e bateu seu recorde!`
      : `Fim de jogo! Você fez ${score} pontos. Seu recorde é ${scores.quickGame}.`;
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'btn game-replay';
    replay.textContent = 'Jogar novamente';
    replay.addEventListener('click', () => startButton.click());
    game.replaceChildren(heading, result, replay);
    startButton.disabled = false;
    startButton.hidden = false;
    startButton.textContent = 'Jogar novamente';
  };

  const updateTimer = () => {
    remaining = Math.max(0, Math.ceil((startedAt + 60000 - Date.now()) / 1000));
    renderHud();
    if (remaining === 0) finish();
  };
  const startedAt = Date.now();
  const timerId = setInterval(updateTimer, 250);
  renderHud();
  showQuestion();
}

function renderExam(questions, exam, startButton) {
  let seconds = 600;
  const form = document.createElement('form');
  form.className = 'exam-form';
  const heading = document.createElement('h2');
  heading.textContent = 'Simulado geral';
  const timer = document.createElement('p');
  timer.className = 'exam-timer';
  timer.setAttribute('role', 'timer');
  const questionList = document.createElement('div');

  const updateTimer = () => {
    const minutes = Math.floor(seconds / 60);
    const remainder = String(seconds % 60).padStart(2, '0');
    timer.textContent = `Tempo restante: ${minutes}:${remainder}`;
    if (seconds <= 0) {
      clearInterval(intervalId);
      finishExam(form, questions, exam);
    }
    seconds -= 1;
  };
  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);

  questions.forEach((question, index) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = `${index + 1}. ${question.prompt}`;
    const subjectLabel = document.createElement('small');
    subjectLabel.className = 'exam-subject';
    subjectLabel.textContent = question.subject;
    fieldset.append(legend, subjectLabel);
    question.choices.forEach((choice, choiceIndex) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `exam-q${index}`;
      radio.value = String(choiceIndex);
      radio.required = true;
      label.append(radio, document.createTextNode(` ${choice.text}`));
      fieldset.append(label);
    });
    questionList.append(fieldset);
  });

  const submit = document.createElement('button');
  submit.className = 'btn exam-submit';
  submit.type = 'submit';
  submit.textContent = 'Finalizar simulado';
  form.append(heading, timer, questionList, submit);
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearInterval(intervalId);
    finishExam(form, questions, exam);
  });
  exam.replaceChildren(form);
  exam.hidden = false;
  startButton.hidden = true;
  startButton.disabled = false;
}

function finishExam(form, questions, exam) {
  if (form.dataset.finished) return;
  form.dataset.finished = 'true';
  form.querySelectorAll('input').forEach(input => { input.disabled = true; });
  const score = questions.reduce((total, question, index) => {
    const selected = form.querySelector(`input[name="exam-q${index}"]:checked`);
    return total + (selected && question.choices[Number(selected.value)]?.correct ? 1 : 0);
  }, 0);
  const percent = Math.round((score / questions.length) * 100);
  const best = readStore(SCORES_KEY);
  best.mockExam = Math.max(best.mockExam || 0, score);
  writeStore(SCORES_KEY, best);
  const result = document.createElement('p');
  result.className = 'exam-result';
  result.textContent = `Simulado finalizado: ${score}/${questions.length} (${percent}%). Melhor nota: ${best.mockExam}/${questions.length}.`;
  form.append(result);
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'quiz-reset';
  again.textContent = 'Fazer outro simulado';
  again.addEventListener('click', () => {
    exam.hidden = true;
    document.querySelector('#start-exam').hidden = false;
    exam.replaceChildren();
  });
  form.append(again);
}

async function initHome() {
  if (!document.querySelector('#content-search')) return;
  try {
    const pages = await loadSubjectPages();
    const progress = readStore(PROGRESS_KEY);
    const pageMap = new Map(pages.map(subject => [subject.id, subject]));
    document.querySelectorAll('.subject-card[data-subject]').forEach(card => {
      const subject = pageMap.get(card.dataset.subject);
      if (!subject) return;
      card.dataset.lessonCount = String(subject.lessons.length);
      const status = document.createElement('div');
      status.className = 'subject-progress';
      const bar = document.createElement('progress');
      bar.max = subject.lessons.length;
      bar.value = (progress[subject.id] || []).length;
      status.append(bar, document.createTextNode(''));
      card.append(status);
    });
    updateSubjectProgress();
    initSubjectSearch(pages);
    initExam(pages);
    initQuickGame(pages);
  } catch (error) {
    console.error('Não foi possível inicializar busca, progresso e simulado.', error);
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    const script = document.querySelector('script[src*="script.js"]');
    const serviceWorkerUrl = script ? new URL('../service-worker.js', script.src) : null;
    if (!serviceWorkerUrl) {
      console.error('Não foi possível localizar o script para registrar o modo offline.');
      return;
    }
    navigator.serviceWorker.register(serviceWorkerUrl)
      .catch(error => console.error('Não foi possível registrar o modo offline.', error));
  }

  const installButton = document.querySelector('#install-app');
  if (!installButton) return;
  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    installButton.hidden = true;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initLessons();
  initQuizzes();
  initHome();
  registerServiceWorker();
  document.querySelector('.content-search')?.addEventListener('submit', event => event.preventDefault());
});
