// Handler Study Site - JavaScript for interactivity

// Dark/Light mode toggle
const toggle = document.querySelector('.mode-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // Load saved theme
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^=\"#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Subject cards clickable
document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', () => {
    const subject = card.dataset.subject;
    window.location.href = `subjects/${subject}.html`;
  });
});

// Improved lesson toggle (event delegation)
document.addEventListener('click', (e) => {
  if (e.target.closest('.lesson-card')) {
    const card = e.target.closest('.lesson-card');
    const content = card.querySelector('.lesson-content');
    if (content) {
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
      content.style.opacity = content.style.display === 'block' ? '1' : '0';
      content.style.transition = 'opacity 0.3s ease';
    }
  }
});

// Universal Quiz functionality - auto init all quizzes on page
function initQuizzes() {
  const quizzes = document.querySelectorAll('.quiz');
  quizzes.forEach(quiz => {
    const questions = quiz.querySelectorAll('.quiz-question');
    const scoreEl = quiz.querySelector('#quiz-score');

    questions.forEach(q => {
      const feedback = document.createElement('p');
      feedback.className = 'quiz-feedback';
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      q.append(feedback);

      const inputs = q.querySelectorAll('input[type="radio"]');
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          const isCorrect = input.value === 'correct';
          feedback.textContent = isCorrect
            ? 'Resposta correta.'
            : 'Resposta incorreta. Tente outra alternativa.';
          feedback.classList.toggle('is-correct', isCorrect);
          feedback.classList.toggle('is-incorrect', !isCorrect);

          q.querySelectorAll('label').forEach(label => {
            label.classList.remove('is-correct', 'is-incorrect');
          });
          input.closest('label')?.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');

          const selectedAnswers = [...questions]
            .map(question => question.querySelector('input[type="radio"]:checked'))
            .filter(Boolean);
          const answered = selectedAnswers.length;
          const score = selectedAnswers.filter(answer => answer.value === 'correct').length;

          if (scoreEl) {
            scoreEl.textContent = `Progresso: ${answered}/${questions.length}`;
            scoreEl.classList.remove('quiz-score--success', 'quiz-score--review');
            if (answered === questions.length) {
              const percent = Math.round((score / questions.length) * 100);
              scoreEl.textContent = `Resultado: ${score}/${questions.length} (${percent}%). ${
                score === questions.length
                  ? 'Todas as respostas estão corretas.'
                  : 'Revise as respostas incorretas e tente novamente.'
              }`;
              scoreEl.classList.add(
                score === questions.length ? 'quiz-score--success' : 'quiz-score--review'
              );
            }
          }
        });
      });
    });
  });
}

// Progress saving (localStorage)
function saveProgress(subject, lesson) {
  const progress = JSON.parse(localStorage.getItem('handlerProgress') || '{}');
  progress[subject] = progress[subject] || [];
  if (!progress[subject].includes(lesson)) {
    progress[subject].push(lesson);
    localStorage.setItem('handlerProgress', JSON.stringify(progress));
  }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initQuizzes();
});
