/**
 * IS YOUR LOVE TRUE? - INTERACTIVE PRANK ENGINE
 * Complete logic for gender-based dynamic responses, runaway evasive buttons,
 * canvas heart particles, and celebratory popups.
 */

// Global State
const state = {
  yourName: '',
  partnerName: '',
  gender: '', // 'male' or 'female'
  dodgeCount: 0,
  isPrankActive: false
};

// DOM Elements
const formScreen = document.getElementById('form-screen');
const questionScreen = document.getElementById('question-screen');
const loveForm = document.getElementById('love-form');
const yourNameInput = document.getElementById('your-name');
const partnerNameInput = document.getElementById('partner-name');
const genderMaleCard = document.getElementById('gender-male-card');
const genderFemaleCard = document.getElementById('gender-female-card');
const genderError = document.getElementById('gender-error');

const badgeYourName = document.getElementById('badge-your-name');
const badgePartnerName = document.getElementById('badge-partner-name');
const dynamicQuestionText = document.getElementById('dynamic-question-text');
const evasiveTaunt = document.getElementById('evasive-taunt');
const prankCounterText = document.getElementById('prank-counter-text');
const dodgeCountSpan = document.getElementById('dodge-count');

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const buttonPlayground = document.getElementById('button-playground');

const resultModal = document.getElementById('result-modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');
const modalScoreValue = document.getElementById('modal-score-value');
const modalDecorIcon = document.getElementById('modal-decor-icon');
const btnRestart = document.getElementById('btn-restart');
const btnShare = document.getElementById('btn-share');

/* ==========================================================
   1. FLOATING HEARTS BACKGROUND CANVAS ANIMATION
   ========================================================== */
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');
let hearts = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class HeartParticle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
    this.size = Math.random() * 14 + 10;
    this.speedY = Math.random() * 1.5 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.03;
    this.hue = Math.random() > 0.5 ? 340 : 280; // Pink or Purple
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
    if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
    ctx.beginPath();
    const topCurveHeight = this.size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Left heart lobe
    ctx.bezierCurveTo(
      -this.size / 2, -this.size / 2,
      -this.size, topCurveHeight / 3,
      0, this.size
    );
    // Right heart lobe
    ctx.bezierCurveTo(
      this.size, topCurveHeight / 3,
      this.size / 2, -this.size / 2,
      0, topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function initHearts() {
  hearts = [];
  const heartCount = Math.min(Math.floor(window.innerWidth / 30), 45);
  for (let i = 0; i < heartCount; i++) {
    hearts.push(new HeartParticle());
  }
}
initHearts();

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach(heart => {
    heart.update();
    heart.draw();
  });
  requestAnimationFrame(animateHearts);
}
animateHearts();

/* ==========================================================
   2. FORM HANDLING & NAVIGATION
   ========================================================== */

// Auto clear error when gender radio is selected
document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener('change', () => {
    genderError.style.display = 'none';
  });
});

loveForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const yourName = yourNameInput.value.trim();
  const partnerName = partnerNameInput.value.trim();
  const genderChecked = document.querySelector('input[name="gender"]:checked');

  if (!genderChecked) {
    genderError.style.display = 'block';
    genderError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  state.yourName = yourName || 'You';
  state.partnerName = partnerName || 'Partner';
  state.gender = genderChecked.value.toLowerCase(); // 'male' or 'female'
  state.dodgeCount = 0;

  // Transition to Question Screen
  setupQuestionScreen();
});

/* ==========================================================
   3. QUESTION SCREEN CONFIGURATION (PRANK LOGIC)
   ========================================================== */

function setupQuestionScreen() {
  formScreen.classList.remove('active-step');
  questionScreen.classList.add('active-step');
  state.isPrankActive = true;

  // Reset Runaway button state
  resetEvasiveButton(btnYes);
  resetEvasiveButton(btnNo);

  badgeYourName.textContent = state.yourName;
  badgePartnerName.textContent = state.partnerName;
  prankCounterText.classList.add('hidden');
  dodgeCountSpan.textContent = '0';

  if (state.gender === 'female') {
    // FEMALE FLOW:
    // Question: "Do you love him?"
    // "No" is CLICKABLE -> shows "OOOOOOO Sad, Your love is fake"
    // "Yes" is RUNAWAY / EVASIVE -> moves randomly
    dynamicQuestionText.textContent = `Do you love him? (${state.partnerName})`;
    evasiveTaunt.textContent = "Be 100% honest! Select your answer below 💖";

    // Setup No as Clickable Result Trigger
    btnNo.onclick = () => showResultModal('fake');

    // Setup Yes as Evasive Runaway Button
    makeEvasive(btnYes);
    btnYes.onclick = (e) => {
      e.preventDefault();
      teleportButton(btnYes);
    };
  } else {
    // MALE FLOW:
    // Question: "Do you love her?"
    // "Yes" is CLICKABLE -> shows "Yeeeeeee, Your love is true"
    // "No" is RUNAWAY / EVASIVE -> moves randomly
    dynamicQuestionText.textContent = `Do you love her? (${state.partnerName})`;
    evasiveTaunt.textContent = "Be 100% honest! Select your answer below 💖";

    // Setup Yes as Clickable Result Trigger
    btnYes.onclick = () => showResultModal('true');

    // Setup No as Evasive Runaway Button
    makeEvasive(btnNo);
    btnNo.onclick = (e) => {
      e.preventDefault();
      teleportButton(btnNo);
    };
  }
}

/* ==========================================================
   4. EVASIVE RUNAWAY BUTTON PHYSICS
   ========================================================== */

const taunts = [
  "Nice try! 😜",
  "Too slow! 🏃💨",
  "Can't touch this! 🎶",
  "You know you can't click it! 😂",
  "Destiny cannot be altered! ✨",
  "Almost got it! Haha 😆",
  "Nope! Try again! 💃"
];

function resetEvasiveButton(btn) {
  btn.classList.remove('evasive-runaway');
  btn.style.left = '';
  btn.style.top = '';
  btn.onmouseenter = null;
  btn.ontouchstart = null;
  btn.onpointerdown = null;
  btn.onclick = null;
}

function makeEvasive(btn) {
  btn.classList.remove('evasive-runaway');

  const triggerEvade = (e) => {
    if (!state.isPrankActive) return;
    e.preventDefault();
    teleportButton(btn);
  };

  btn.addEventListener('mouseenter', triggerEvade);
  btn.addEventListener('touchstart', triggerEvade, { passive: false });
  btn.addEventListener('pointerdown', triggerEvade);
}

function teleportButton(btn) {
  if (!btn.classList.contains('evasive-runaway')) {
    btn.classList.add('evasive-runaway');
  }

  state.dodgeCount++;
  dodgeCountSpan.textContent = state.dodgeCount;
  prankCounterText.classList.remove('hidden');

  // Random Taunt
  const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
  evasiveTaunt.textContent = `${randomTaunt} (Attempts: ${state.dodgeCount})`;

  const btnWidth = btn.offsetWidth || 120;
  const btnHeight = btn.offsetHeight || 50;
  const padding = 20;

  // Safe viewport range
  const maxX = window.innerWidth - btnWidth - padding;
  const maxY = window.innerHeight - btnHeight - padding;

  const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
  const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

  btn.style.left = `${randomX}px`;
  btn.style.top = `${randomY}px`;
}

/* ==========================================================
   5. RESULT POPUP MODAL & CELEBRATION
   ========================================================== */

function showResultModal(type) {
  state.isPrankActive = false;

  if (type === 'true') {
    // True Love Celebration
    modalDecorIcon.textContent = '💖';
    modalTitle.textContent = 'Yeeeeeee, Your love is true!';
    modalTitle.style.color = '#10b981';
    modalMsg.innerHTML = `Congratulations <strong>${escapeHtml(state.yourName)}</strong> & <strong>${escapeHtml(state.partnerName)}</strong>! The universe has verified that your love is 100% genuine and everlasting! ✨💍`;
    modalScoreValue.textContent = '100% Match! 💕';
    modalScoreValue.style.color = '#10b981';

    // Trigger Confetti Explosion
    fireConfetti();
  } else {
    // Fake Love Drama
    modalDecorIcon.textContent = '💔';
    modalTitle.textContent = 'OOOOOOO Sad, Your love is fake.';
    modalTitle.style.color = '#ef4444';
    modalMsg.innerHTML = `Oh no! <strong>${escapeHtml(state.yourName)}</strong>, the cosmic love radar reported 0% compatibility with <strong>${escapeHtml(state.partnerName)}</strong>... Don't cry, it was probably a glitch! 😭💔`;
    modalScoreValue.textContent = '0.0% Fake 📉';
    modalScoreValue.style.color = '#ef4444';
  }

  resultModal.classList.add('show');
}

function fireConfetti() {
  if (typeof confetti === 'function') {
    // Multi-shot confetti celebration
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }
}

/* ==========================================================
   6. RESET & SOCIAL SHARE ACTIONS
   ========================================================== */

btnRestart.addEventListener('click', () => {
  resultModal.classList.remove('show');
  questionScreen.classList.remove('active-step');
  formScreen.classList.add('active-step');

  // Reset form
  loveForm.reset();
  resetEvasiveButton(btnYes);
  resetEvasiveButton(btnNo);
  state.dodgeCount = 0;
  state.isPrankActive = false;
  evasiveTaunt.textContent = "Be 100% honest! The machine detects your true feelings...";
});

btnShare.addEventListener('click', () => {
  const pageUrl = window.location.href;
  const shareText = `💕 Check out 'Is Your Love True?' love calculator prank! Try it with your partner here: ${pageUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, '_blank');
});

// Helper to escape HTML tags in user names
function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
