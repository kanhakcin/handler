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
    let score = 0;
    let answered = 0;
    const scoreEl = quiz.querySelector('#quiz-score');

    questions.forEach(q => {
      const inputs = q.querySelectorAll('input[type="radio"]');
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          answered++;
          if (input.value === 'correct') score++;
          if (scoreEl) {
            scoreEl.textContent = `Progresso: ${answered}/${questions.length}`;
            if (answered === questions.length) {
              const percent = Math.round((score / questions.length) * 100);
              scoreEl.innerHTML = `<strong>Nota: ${score}/${questions.length} (${percent}%)</strong>`;
              scoreEl.style.color = percent >= 70 ? '#10b981' : '#ef4444';
              scoreEl.style.fontSize = '1.2rem';
              scoreEl.style.background = 'rgba(16,185,129,0.1)';
              scoreEl.style.padding = '0.5rem 1rem';
              scoreEl.style.borderRadius = '25px';
              scoreEl.style.display = 'inline-block';
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
