/* ============================================================
   Приглашение на день рождения — логика страницы.
   Все данные — в объекте CONFIG из файла config.js
   (он в .gitignore; шаблон — config.example.js).
   ============================================================ */

// config.js не подключён / не создан — показываем подсказку и останавливаемся
if (typeof CONFIG === 'undefined') {
  document.body.innerHTML =
    '<p style="font-family:sans-serif;text-align:center;padding:60px 20px">' +
    'Не найден <b>config.js</b>. Скопируй <b>config.example.js</b> в <b>config.js</b> ' +
    'и заполни своими данными.</p>';
  throw new Error('CONFIG is not defined: создай config.js из config.example.js');
}

/* Цвета шариков и конфетти — из палитры сайта */
const PALETTE = ['#ffd93d', '#ff9a3d', '#4ecdc4', '#ff6b6b', '#ff8e8e', '#7be0d8'];

/* Уважаем prefers-reduced-motion: отключаем «тяжёлые» анимации */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   Утилиты
   ------------------------------------------------------------ */

/** Склонение русских существительных: plural(5, ['день','дня','дней']) → 'дней' */
function plural(n, forms) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

/** Случайное число в диапазоне [min, max) */
function rand(min, max) {
  return min + Math.random() * (max - min);
}

/** Случайный элемент массива */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ------------------------------------------------------------
   Рендер данных из CONFIG в DOM
   ------------------------------------------------------------ */

function renderContent() {
  // Hero
  document.getElementById('childName').textContent = CONFIG.childName;
  document.getElementById('childAge').textContent =
    `${CONFIG.age} ${plural(CONFIG.age, ['год', 'года', 'лет'])}`;
  document.getElementById('partyDate').textContent =
    `${CONFIG.dateDisplay} · ${CONFIG.timeDisplay}`;

  // Где и когда
  document.getElementById('whereDateTime').textContent =
    `${CONFIG.dateDisplay}, ${CONFIG.timeDisplay}`;
  document.getElementById('address').textContent = CONFIG.address;
  document.getElementById('mapIframe').src = CONFIG.mapIframeSrc;
  document.getElementById('mapLink').href = CONFIG.mapLink;

  // Программа — таймлайн
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = CONFIG.program.map((item) => `
    <li class="timeline__item">
      <span class="timeline__icon" aria-hidden="true">${item.icon}</span>
      <div>
        <div class="timeline__time">${item.time}</div>
        <div class="timeline__title">${item.title}</div>
        <div class="timeline__text">${item.text}</div>
      </div>
    </li>
  `).join('');

  // Что взять с собой
  const bringList = document.getElementById('bringList');
  bringList.innerHTML = CONFIG.bringList.map((item) => `
    <li class="bring__item">
      <span class="bring__icon" aria-hidden="true">${item.icon}</span>
      <span>${item.text}</span>
    </li>
  `).join('');

  // Фото (секция закомментирована в index.html — код сработает, если её вернуть)
  const photo = document.getElementById('childPhoto');
  if (photo) {
    photo.src = CONFIG.photoSrc;
    photo.alt = CONFIG.photoAlt;
    document.getElementById('photoCaption').textContent = CONFIG.photoCaption;
  }

  // Идеи для подарков
  document.getElementById('giftsText').textContent = CONFIG.gifts.text;
  document.getElementById('wishlistLink').href = CONFIG.gifts.wishlistUrl;
  document.getElementById('wishlistBtnText').textContent = CONFIG.gifts.buttonText;

  // Контакты
  const contactsList = document.getElementById('contactsList');
  contactsList.innerHTML = CONFIG.contacts.map((c) => `
    <li>
      <a class="contacts__item" href="tel:${c.phone.replace(/[^+\d]/g, '')}">
        <span class="contacts__who">${c.name}<small>${c.role}</small></span>
        <span class="contacts__phone">${c.phone}</span>
      </a>
    </li>
  `).join('');

  // Сердечки в футере
  document.getElementById('footerHearts').innerHTML =
    ['❤️', '🧡', '💛', '💙', '❤️'].map((h) => `<span class="footer__heart">${h}</span>`).join('');
}

/* ------------------------------------------------------------
   Обратный отсчёт до праздника
   ------------------------------------------------------------ */

function startCountdown() {
  const target = new Date(CONFIG.partyDateISO).getTime();

  const el = {
    days: document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    minutes: document.getElementById('cdMinutes'),
    seconds: document.getElementById('cdSeconds'),
    daysLabel: document.getElementById('cdDaysLabel'),
    hoursLabel: document.getElementById('cdHoursLabel'),
    minutesLabel: document.getElementById('cdMinutesLabel'),
    secondsLabel: document.getElementById('cdSecondsLabel'),
    grid: document.getElementById('countdownGrid'),
    done: document.getElementById('countdownDone'),
  };

  function tick() {
    const diff = target - Date.now();

    // Дата наступила — прячем цифры, показываем поздравление
    if (diff <= 0) {
      el.grid.hidden = true;
      el.done.hidden = false;
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const minutes = Math.floor(diff / 60000) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    el.days.textContent = days;
    el.hours.textContent = String(hours).padStart(2, '0');
    el.minutes.textContent = String(minutes).padStart(2, '0');
    el.seconds.textContent = String(seconds).padStart(2, '0');

    // Правильные окончания: 1 день, 2 дня, 5 дней
    el.daysLabel.textContent = plural(days, ['день', 'дня', 'дней']);
    el.hoursLabel.textContent = plural(hours, ['час', 'часа', 'часов']);
    el.minutesLabel.textContent = plural(minutes, ['минута', 'минуты', 'минут']);
    el.secondsLabel.textContent = plural(seconds, ['секунда', 'секунды', 'секунд']);
  }

  tick(); // сразу, без секундной задержки
  const timer = setInterval(tick, 1000);
}

/* ------------------------------------------------------------
   Воздушные шарики в hero (SVG, генерируются в JS)
   ------------------------------------------------------------ */

function createBalloons() {
  const container = document.getElementById('balloons');
  const COUNT = 9;

  for (let i = 0; i < COUNT; i += 1) {
    const color = pick(PALETTE);
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.innerHTML = `
      <svg viewBox="0 0 60 100" width="60" height="100">
        <ellipse cx="30" cy="30" rx="26" ry="30" fill="${color}"/>
        <ellipse cx="22" cy="20" rx="8" ry="10" fill="rgba(255,255,255,0.35)"/>
        <polygon points="30,60 25,68 35,68" fill="${color}"/>
        <path d="M30 68 q7 12 -3 30" stroke="rgba(74,63,53,0.4)" stroke-width="1.5" fill="none"/>
      </svg>`;

    // Случайная позиция и размер
    balloon.style.left = `${rand(2, 90)}%`;
    balloon.style.top = `${rand(5, 75)}%`;
    const scale = rand(0.55, 1.15);
    balloon.style.transform = `scale(${scale})`;
    balloon.style.opacity = rand(0.55, 0.9);
    container.appendChild(balloon);

    if (!REDUCED_MOTION) {
      // Парение: вверх-вниз + лёгкое покачивание в стороны
      gsap.to(balloon, {
        y: `-=${rand(20, 45)}`,
        duration: rand(2.2, 4),
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: rand(0, 1.5),
      });
      gsap.to(balloon, {
        x: `+=${rand(8, 22)}`,
        rotation: rand(-6, 6),
        duration: rand(3, 5),
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: rand(0, 1.5),
      });
    }
  }
}

/* ------------------------------------------------------------
   Конфетти при загрузке страницы
   ------------------------------------------------------------ */

function launchConfetti() {
  if (REDUCED_MOTION) return;

  const container = document.getElementById('confetti');
  const COUNT = 90;

  for (let i = 0; i < COUNT; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';

    const size = rand(6, 12);
    piece.style.width = `${size}px`;
    piece.style.height = `${size * rand(0.6, 1.4)}px`;
    piece.style.background = pick(PALETTE);
    // Разные формы: кружки, квадратики, «ленточки»
    piece.style.borderRadius = pick(['50%', '2px', '2px']);

    const startX = rand(0, window.innerWidth);
    piece.style.left = `${startX}px`;
    container.appendChild(piece);

    // Падение с вращением и сносом в сторону
    gsap.fromTo(piece,
      { y: -30, rotation: 0, opacity: 1 },
      {
        y: window.innerHeight + 40,
        x: `+=${rand(-120, 120)}`,
        rotation: rand(360, 1080),
        duration: rand(2.5, 5),
        delay: rand(0, 1.2),
        ease: 'power1.in',
        onComplete: () => piece.remove(), // убираем из DOM после падения
      });
  }
}

/* ------------------------------------------------------------
   Оверлей карты: страница скроллится поверх iframe,
   карта активируется по клику и «отпускается» при уходе курсора
   ------------------------------------------------------------ */

function initMapOverlay() {
  const overlay = document.getElementById('mapOverlay');
  const map = document.querySelector('.where__map');
  if (!overlay || !map) return;

  // Клик/тап по оверлею — прячем его, карта становится активной
  overlay.addEventListener('click', () => {
    overlay.classList.add('is-hidden');
  });

  // Уводим курсор с карты — возвращаем оверлей, скролл снова страничный
  map.addEventListener('mouseleave', () => {
    overlay.classList.remove('is-hidden');
  });

  // На тач-устройствах: тап вне карты возвращает оверлей
  document.addEventListener('touchstart', (e) => {
    if (!map.contains(e.target)) {
      overlay.classList.remove('is-hidden');
    }
  }, { passive: true });
}

/* ------------------------------------------------------------
   GSAP-анимации: появление hero, секций при скролле, фото, сердечки
   ------------------------------------------------------------ */

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  if (REDUCED_MOTION) return; // контент виден и без анимаций

  // Появление элементов hero друг за другом
  gsap.from('[data-anim="hero"]', {
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.18,
    ease: 'power2.out',
    delay: 0.2,
  });

  // Плавное появление секций при скролле
  gsap.utils.toArray('.reveal').forEach((section) => {
    gsap.from(section, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
      },
    });
  });

  // Покачивание фото-рамки (секция сейчас закомментирована в index.html)
  const photoFrame = document.getElementById('photoFrame');
  if (photoFrame) {
    gsap.to(photoFrame, {
      rotation: 3.5,
      duration: 2.6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      transformOrigin: '50% 15%',
    });
  }

  // Пульсация сердечек в футере
  gsap.to('.footer__heart', {
    scale: 1.25,
    duration: 0.7,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    stagger: 0.15,
  });
}

/* ------------------------------------------------------------
   Старт
   ------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  renderContent();
  startCountdown();
  createBalloons();
  initMapOverlay();
  initAnimations();
  launchConfetti();
});
