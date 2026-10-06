import { useEffect, useRef, useState } from 'react';
import './App.css';
const BASE = import.meta.env.BASE_URL;

/* ═══════════════════════════════════════════════════════════════
   ТВОИ НАСТРОЙКИ — меняй только то, что здесь
   ═══════════════════════════════════════════════════════════════ */

// Дата рождения (месяц считается с нуля: 9 = октябрь).
// Поправь год и время, если нужно: new Date(год, месяц, день, час, минута)
const BIRTH_DATE = new Date(2001, 9, 11, 0, 0);

// ГАЛЕРЕЯ: картинки лежат в папке public/memes/
// Просто положи туда файлы с такими именами или поменяй имя в file.
// caption — подпись, которая появится на обороте.
const GALLERY = [
  { file: 'meme1.jpg', caption: 'Просто хорошее настроение.' },
  { file: 'meme2.jpg', caption: 'Мне показалось, это про тебя.' },
  { file: 'meme3.jpg', caption: 'Так выглядит спокойный вечер.' },
  { file: 'meme4.jpg', caption: 'Маленькая радость.' },
  { file: 'meme5.jpg', caption: 'Для хорошего дня.' },
  { file: 'meme6.jpg', caption: 'Потому что можно.' },
];

// ЛИЧНАЯ СТРАНИЦА: впиши сюда свои настоящие слова.
// Лучше всего — конкретика: случай, фраза, привычка, за что ты его ценишь.
const PERSONAL_TEXT = [
  'Я долго думала, что написать здесь, чтобы это прозвучало и не слишком громко, и не слишком формально.',
  'Поэтому скажу просто: мне приятно с тобой разговаривать. Рядом с тобой легко и интересно, а это бывает не так часто.',
  'Хмм ты наверное читаешь и думаешь,что я реально странная. Поверь самой не горжусь я бы подруге давно уже сказала что ты ред флаг ,но есть в тебе что то из-за чего хочется тебе писать .',
  'а насчет сайта скажи интересно ,давно хотела попробовать ты первый)',
];

/* ═══════════════════════════════════════════════════════════════ */

// мягкая «шампань-розовая» палитра — смотрится дорого на тёмном небе
const FIREWORK_COLORS = [
  '#ffe3b0',
  '#ffb7a5',
  '#ffd166',
  '#f7a8c4',
  '#b9dcff',
  '#fff4de',
  '#ffc98b',
];

const WISHES = [
  'Чтобы ты наконец завёл кота.',
  'Чтобы все планы получались с первого раза.',
  'Чтобы смог куда то полететь отдохнуть.',
  'Чтобы рядом всегда были те, кому ничего не надо объяснять.',
  'Чтобы смог снова когото полюбить.',
  'Чтобы понедельники начинались в 12:00.',
  'Чтобы приятные неожиданности случались чаще, чем неприятные.',
  'Билет на Марс, видимо, тоже желаю.',
  'Чтобы любимые песни играли ровно в нужный момент.',
  'Чтобы ты смог дорисовать картину.',
  'Чтобы рядом был человек, с которым легко.',
];

const ACHIEVEMENTS = [
  {
    icon: '25',
    title: 'Дожить до 25',
    text: 'Опыт: бесценный. Спина: пока держится.',
  },
  {
    icon: '★',
    title: 'Пережить новости, бензин и политику',
    text: 'Не каждому это удаётся. Тебе удалось.',
  },
  {
    icon: '♪',
    title: 'Иметь хороший музыкальный вкус',
    text: 'Sting и Эминем в одном плейлисте. Уважение. Правда, я бы ещё добавила «Три дня дождя».',
  },
  {
    icon: '☺',
    title: 'Быть человеком, с которым легко',
    text: 'Рядом с тобой спокойно и интересно. Это редкое качество.',
  },
  {
    icon: '✓',
    title: 'Дочитать поздравление до конца',
    text: 'Ещё не всё, но ты уже на финишной прямой.',
  },
];

const FORECAST = [
  { label: 'НАСТРОЕНИЕ', value: 96, accent: true },
  { label: 'УДАЧА', value: 88 },
  { label: 'ПОВОДЫ ДЛЯ СМЕХА', value: 100, accent: true },
  { label: 'ЗДОРОВЬЕ', value: 92 },
  { label: 'БЕНЗИН НА ЗАПРАВКАХ', value: 41 },
];

/* САЛЮТЫ — неспешные, с мягким свечением и длинными следами.
   Если tap = true, по тапу на экран запускается ракета. */

function Fireworks({ tap = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let scale = 1;
    let nextLaunch = 0;
    let nextBarrage = 0;
    let animationId = 0;
    let lastTap = 0;

    const rockets = [];
    const sparks = [];
    const flashes = [];

    const pick = () =>
      FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      // на телефоне салют меньше, на большом экране крупнее
      scale = Math.min(Math.max(Math.min(width, height) / 520, 0.6), 1.25);

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const add = (x, y, vx, vy, color, options = {}) => {
      sparks.push({
        x,
        y,
        px: x,
        py: y,
        vx,
        vy,
        color,
        life: 1,
        decay: options.decay ?? 0.012,
        size: options.size ?? 1.6,
        gravity: options.gravity ?? 0.03,
        friction: options.friction ?? 0.965,
        twinkle: options.twinkle ?? false,
        glitter: options.glitter ?? false,
        glow: options.glow ?? true,
      });
    };

    // «Пион» — мягкий шар, чуть двухцветный
    const burstPeony = (x, y) => {
      const main = pick();
      const accent = pick();
      const count = 90;

      for (let index = 0; index < count; index += 1) {
        const angle =
          (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.12;
        const speed = (4.4 + Math.random() * 2.6) * scale;

        add(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          index % 5 === 0 ? accent : main,
          {
            decay: 0.011 + Math.random() * 0.006,
            size: 1.5,
            twinkle: Math.random() > 0.6,
          }
        );
      }
    };

    // «Хризантема» — тонкие длинные лучи
    const burstChrysanthemum = (x, y) => {
      const main = pick();
      const count = 64;

      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count;
        const speed = (5.6 + Math.random() * 1.4) * scale;

        add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, main, {
          decay: 0.008,
          size: 1.6,
          friction: 0.972,
          gravity: 0.034,
        });
      }
    };

    // «Ива» — золотой дождь, красиво стекает вниз
    const burstWillow = (x, y) => {
      const count = 70;

      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (2.5 + Math.random() * 3.5) * scale;

        add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffcf8a', {
          decay: 0.0065,
          size: 1.4,
          friction: 0.976,
          gravity: 0.045,
          glitter: true,
        });
      }
    };

    // «Кольцо» — двойное, нежное
    const burstRing = (x, y) => {
      const outer = pick();
      const inner = pick();
      const count = 56;

      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count;
        const speed = 5.2 * scale;

        add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, outer, {
          decay: 0.012,
          size: 1.7,
          friction: 0.968,
          gravity: 0.02,
        });

        if (index % 2 === 0) {
          add(
            x,
            y,
            Math.cos(angle) * speed * 0.52,
            Math.sin(angle) * speed * 0.52,
            inner,
            { decay: 0.014, size: 1.4, friction: 0.968, gravity: 0.02 }
          );
        }
      }
    };

    const explode = (x, y) => {
      const types = [
        burstPeony,
        burstPeony,
        burstChrysanthemum,
        burstWillow,
        burstRing,
      ];

      types[Math.floor(Math.random() * types.length)](x, y);

      flashes.push({ x, y, color: pick(), life: 1 });

      // жемчужные искорки в центре
      for (let index = 0; index < 8; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.1;

        add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#fff4de', {
          decay: 0.04,
          size: 2,
          gravity: 0,
        });
      }
    };

    const launch = (wait = 0) => {
      const x = width * (0.14 + Math.random() * 0.72);

      rockets.push({
        x,
        y: height + 10,
        px: x,
        py: height + 10,
        targetY: height * (0.14 + Math.random() * 0.3),
        speed: (7.5 + Math.random() * 2) * Math.max(scale, 0.8),
        drift: (Math.random() - 0.5) * 0.5,
        wait,
      });
    };

    // ракета ровно в точку, куда тапнули
    const launchAt = (x, y) => {
      rockets.push({
        x,
        y: height + 10,
        px: x,
        py: height + 10,
        targetY: Math.max(y, height * 0.08),
        speed: 10 * Math.max(scale, 0.85),
        drift: 0,
        wait: 0,
      });
    };

    const handleTap = (event) => {
      if (event.target.closest && event.target.closest('button')) {
        return;
      }

      const now = Date.now();

      if (now - lastTap < 140) {
        return;
      }

      lastTap = now;

      const rect = canvas.getBoundingClientRect();

      launchAt(event.clientX - rect.left, event.clientY - rect.top);
    };

    const tick = (time) => {
      // плавное затухание создаёт длинные мягкие следы
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
      ctx.fillRect(0, 0, width, height);

      // свечение складывается — как настоящий огонь
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      if (time >= nextLaunch) {
        launch();
        nextLaunch = time + 800 + Math.random() * 900;
      }

      if (time >= nextBarrage) {
        if (nextBarrage !== 0) {
          launch(0);
          launch(16);
          launch(32);
        }

        nextBarrage = time + 10000 + Math.random() * 3000;
      }

      // вспышки света
      for (let index = flashes.length - 1; index >= 0; index -= 1) {
        const flash = flashes[index];

        flash.life -= 0.05;

        if (flash.life <= 0) {
          flashes.splice(index, 1);
          continue;
        }

        const radius = 110 * scale * (1.15 - flash.life * 0.4);
        const gradient = ctx.createRadialGradient(
          flash.x,
          flash.y,
          0,
          flash.x,
          flash.y,
          radius
        );

        gradient.addColorStop(0, flash.color);
        gradient.addColorStop(1, `${flash.color}00`);

        ctx.globalAlpha = flash.life * 0.32;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ракеты
      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];

        if (rocket.wait > 0) {
          rocket.wait -= 1;
          continue;
        }

        rocket.px = rocket.x;
        rocket.py = rocket.y;

        rocket.y -= rocket.speed;
        rocket.x += rocket.drift;
        rocket.speed = Math.max(rocket.speed * 0.99, 2.4);

        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#fff4de';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rocket.px, rocket.py);
        ctx.lineTo(rocket.x, rocket.y);
        ctx.stroke();

        // тонкий золотой след
        add(
          rocket.x,
          rocket.y + 4,
          (Math.random() - 0.5) * 0.3,
          0.4 + Math.random() * 0.3,
          '#ffcf8a',
          { decay: 0.07, size: 1, gravity: 0, friction: 1, glow: false }
        );

        if (rocket.y <= rocket.targetY) {
          explode(rocket.x, rocket.y);
          rockets.splice(index, 1);
        }
      }

      // искры
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];

        spark.px = spark.x;
        spark.py = spark.y;

        spark.vx *= spark.friction;
        spark.vy *= spark.friction;
        spark.vy += spark.gravity;

        spark.x += spark.vx;
        spark.y += spark.vy;

        spark.life -= spark.decay;

        if (spark.life <= 0) {
          sparks.splice(index, 1);
          continue;
        }

        let alpha = spark.life;

        if (spark.twinkle && Math.random() > 0.75) {
          alpha *= 0.35;
        }

        if (spark.glitter && spark.life < 0.4 && Math.random() > 0.5) {
          alpha *= 0.2;
        }

        // тонкий яркий штрих-след
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = Math.max(spark.size * (0.5 + spark.life * 0.5), 0.6);
        ctx.beginPath();
        ctx.moveTo(spark.px, spark.py);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();

        // мягкое свечение вокруг головки
        if (spark.glow && sparks.length < 1400) {
          ctx.globalAlpha = alpha * 0.22;
          ctx.fillStyle = spark.color;
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(tick);
    };

    resize();

    window.addEventListener('resize', resize);

    const parent = canvas.parentElement;

    if (tap && parent) {
      parent.addEventListener('pointerdown', handleTap);
    }

    // стартовый залп
    launch(0);
    launch(16);
    launch(32);

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);

      if (tap && parent) {
        parent.removeEventListener('pointerdown', handleTap);
      }
    };
  }, [tap]);

  return <canvas ref={canvasRef} className="fireworks" aria-hidden="true" />;
}

function Equalizer({ on }) {
  return (
    <div className={on ? 'equalizer on' : 'equalizer'} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function App() {
  const [page, setPage] = useState(0);
  const [blownCandles, setBlownCandles] = useState([]);
  const [candlePause, setCandlePause] = useState(false);
  const [popup, setPopup] = useState(false);
  const [playing, setPlaying] = useState('');
  const [musicError, setMusicError] = useState(false);
  const [wishIndex, setWishIndex] = useState(null);
  const [wishCount, setWishCount] = useState(0);

  const [secret, setSecret] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  const [flipped, setFlipped] = useState({});
  const [brokenImages, setBrokenImages] = useState({});

  const audioRef = useRef(null);
  const touchStart = useRef(null);
  const secretTaps = useRef({ count: 0, time: 0 });

  const totalPages = 13;
  const lastPage = totalPages - 1;

  const candles = Array.from({ length: 25 }, (_, index) => index + 1);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // живой счётчик — тикает только на своей странице
  useEffect(() => {
    if (page !== 6) {
      return undefined;
    }

    setNow(Date.now());

    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, [page]);

  const blowCandle = (number) => {
    if (candlePause || blownCandles.includes(number)) {
      return;
    }

    const updatedCandles = [...blownCandles, number];

    setBlownCandles(updatedCandles);

    if (updatedCandles.length === 5) {
      setTimeout(() => {
        setCandlePause(true);
      }, 350);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setPlaying('');
  };

  const nextPage = () => {
    stopMusic();

    setPage((currentPage) => Math.min(currentPage + 1, lastPage));
  };

  const previousPage = () => {
    stopMusic();

    setPage((currentPage) => Math.max(currentPage - 1, 0));
  };

  const playMusic = async (name, file) => {
    if (playing === name && audioRef.current) {
      audioRef.current.pause();
      setPlaying('');
      return;
    }

    stopMusic();

    const audio = new Audio(file);

    audioRef.current = audio;
    setMusicError(false);

    audio.onended = () => {
      setPlaying('');
    };

    audio.onerror = () => {
      setPlaying('');
      setMusicError(true);
    };

    try {
      await audio.play();
      setPlaying(name);
    } catch {
      setPlaying('');
      setMusicError(true);
    }
  };

  const makeWish = () => {
    setWishCount((count) => count + 1);

    setWishIndex((current) => {
      let next = Math.floor(Math.random() * WISHES.length);

      while (next === current && WISHES.length > 1) {
        next = Math.floor(Math.random() * WISHES.length);
      }

      return next;
    });
  };

  // секрет: 5 быстрых нажатий на логотип
  const handleLogoTap = () => {
    const time = Date.now();

    if (time - secretTaps.current.time > 1800) {
      secretTaps.current.count = 0;
    }

    secretTaps.current.count += 1;
    secretTaps.current.time = time;

    if (secretTaps.current.count >= 5) {
      secretTaps.current.count = 0;
      setSecret(true);
    }
  };

  const restart = () => {
    stopMusic();

    setPage(0);
    setBlownCandles([]);
    setCandlePause(false);
    setPopup(false);
    setMusicError(false);
    setWishIndex(null);
    setWishCount(0);
    setFlipped({});
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (touchStart.current === null) {
      return;
    }

    const touch = event.changedTouches[0];

    const differenceX = touchStart.current.x - touch.clientX;
    const differenceY = touchStart.current.y - touch.clientY;

    // листаем только явным горизонтальным свайпом, чтобы не мешать прокрутке
    if (
      Math.abs(differenceX) > 60 &&
      Math.abs(differenceX) > Math.abs(differenceY) * 1.5 &&
      !candlePause
    ) {
      if (differenceX > 0) {
        if (page !== 0) {
          nextPage();
        }
      } else {
        previousPage();
      }
    }

    touchStart.current = null;
  };

  // данные для счётчика «сколько ты живёшь»
  const totalSeconds = Math.max(
    Math.floor((now - BIRTH_DATE.getTime()) / 1000),
    0
  );

  const lived = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  const heartbeats = Math.floor((totalSeconds / 60) * 72);
  const weeks = Math.floor(lived.days / 7);

  const tickerText = 'HAPPY BIRTHDAY · MAXIM · 25 · С ДНЁМ РОЖДЕНИЯ · ';

  return (
    <div
      className={page === lastPage ? 'site night' : 'site'}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-number" aria-hidden="true">
        25
      </div>

      <header className="header">
        <span className="header-link">BIRTHDAY</span>

        <div className="logo" onClick={handleLogoTap}>
          MAXIM
          <small>25</small>
        </div>

        <span className="header-link">
          {String(page + 1).padStart(2, '0')} /{' '}
          {String(totalPages).padStart(2, '0')}
        </span>
      </header>

      <main className="book">
        {/* 01 — СВЕЧИ */}

        {page === 0 && (
          <section className="page">
            <div className="page-content candles-page">
              <p className="section-number">01 / BIRTHDAY</p>

              <h1>
                Задуй <em>свечи</em>
              </h1>

              <p className="intro-text">
                Здесь их действительно 25...
                <br />
                Не забудь загадать желание )
              </p>

              <div className="candle-count">
                {String(blownCandles.length).padStart(2, '0')} / 25
              </div>

              <div className="candle-progress">
                <div
                  className="candle-progress-fill"
                  style={{ width: `${(blownCandles.length / 25) * 100}%` }}
                />
              </div>

              <div className="candles">
                {candles.map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={
                      blownCandles.includes(number)
                        ? 'candle candle-off'
                        : 'candle'
                    }
                    onClick={() => blowCandle(number)}
                    disabled={candlePause}
                    aria-label={`Свеча ${number}`}
                  >
                    <span className="candle-flame" />
                    <span className="candle-body" />
                  </button>
                ))}
              </div>

              <p className="candle-hint">Нажми на свечу</p>
            </div>

            {candlePause && (
              <div className="candle-pause">
                <Fireworks />

                <div className="pause-box">
                  <p className="section-number">ENOUGH</p>

                  <h2>Ладно, хватит.</h2>

                  <p>
                    Пять свечей — вполне достаточно, желание уже услышано.
                    <br />
                    Остальные двадцать можешь представить, так уж и быть.
                  </p>

                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => {
                      setCandlePause(false);
                      nextPage();
                    }}
                  >
                    ДАЛЬШЕ
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 02 — ДЕНЬ РОЖДЕНИЯ */}

        {page === 1 && (
          <section className="page">
            <div className="page-content birthday-page">
              <p className="section-number">02 / FOR MAXIM</p>

              <h1>
                С Днём рождения,
                <br />
                <em>Максим.</em>
              </h1>

              <div className="birthday-copy">
                <p>
                  <span className="big-age">25</span> — это, конечно, тяжело.
                </p>

                <p>Ладно, шучу, 30 пострашнее будет.</p>

                <p>
                  Решила поздравить тебя таким необычным способом: мне
                  хотелось сделать это не как у всех. Желаю всего прекрасного,
                  хорошего и легендарного.
                </p>

                <p className="quote">
                  А дальше — ещё несколько пожеланий. Не пролистывай, я
                  старалась.
                </p>
              </div>

              <img className="corner-dog" src={`${BASE}memes/собачка.jpg`} alt="" />
            </div>
          </section>
        )}

        {/* 03 — ПРЕКРАСНОГО */}

        {page === 2 && (
          <section className="page">
            <div className="page-content wish-page">
              <p className="section-number">03 / WONDERFUL</p>

              <h1>Прекрасного.</h1>

              <p className="wish-description">Прекрасного, как эта песня.</p>

              <div className="music-card">
                <div className="music-info">
                  <span className="track-number">01</span>

                  <div>
                    <strong>Нажми, клянусь, это не «Три дня дождя»</strong>
                  </div>
                </div>

                <div className="music-right">
                  <Equalizer on={playing === 'shape'} />

                  <button
                    type="button"
                    className="play-button"
                    onClick={() =>
                      playMusic('shape', `${BASE}music/Sting_-_Shape_Of_My_Heart_47835291.mp3`)
                    }
                  >
                    {playing === 'shape' ? 'PAUSE' : 'PLAY'}
                  </button>
                </div>
              </div>

              {musicError && (
                <p className="music-error">Не удалось загрузить песню.</p>
              )}

              <div className="long-text">
                <p>Эта песня мне очень нравится, поэтому она здесь.</p>

                <p>
                  Пусть в жизни будет больше красивых моментов, хороших
                  новостей и спокойных вечеров.
                </p>

                <p>
                  Уловил настроение? Именно таких уютных вечеров я тебе и
                  желаю. И чтобы рядом были люди, с которыми приятно просто
                  помолчать.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 04 — ХОРОШЕГО */}

        {page === 3 && (
          <section className="page">
            <div className="page-content wish-page">
              <p className="section-number">04 / GOOD</p>

              <h1>Хорошего.</h1>

              <p className="wish-description">
                Хорошего, как этот день.
                <br />
                Или как песни этого исполнителя.
              </p>

              <div className="music-card">
                <div className="music-info">
                  <span className="track-number">02</span>

                  <div>
                    <strong>О, я знаю: эта песня тебе нравится</strong>
                  </div>
                </div>

                <div className="music-right">
                  <Equalizer on={playing === 'eminem'} />

                  <button
                    type="button"
                    className="play-button"
                    onClick={() =>
                      playMusic('eminem', `${BASE}music/Eminem_-_Mockingbird_47829435.mp3`)
                    }
                  >
                    {playing === 'eminem' ? 'PAUSE' : 'PLAY'}
                  </button>
                </div>
              </div>

              {musicError && (
                <p className="music-error">Не удалось загрузить песню.</p>
              )}

              <div className="long-text">
                <p>
                  Хорошего настолько, чтобы утром хотелось вставать и смотреть,
                  что приготовил новый день.
                </p>

                <p>
                  Как это прозвучало банально. Да, это я тебе сеанс психолога
                  устраиваю. Надеюсь, поможет.
                </p>

                <p>Шучу. А может, и нет.</p>

                <p>
                  Но если серьёзно: я правда хочу, чтобы у тебя всё было
                  хорошо.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 05 — ЛЕГЕНДАРНОГО */}

        {page === 4 && (
          <section className="page">
            <div className="page-content legendary-page">
              <p className="section-number">05 / LEGENDARY</p>

              <h1 className="huge-title">ЛЕГЕНДАРНОГО</h1>

              <p className="legendary-text">Легендарного, как эта открытка.</p>

              <p className="legendary-copy">
                Вот спорим, никто тебе такого не делал.
              </p>

              <button
                type="button"
                className="outline-button"
                onClick={() => setPopup(true)}
              >
                ПРОВЕРИТЬ
                <span>→</span>
              </button>

              <img className="corner-hamster" src={`${BASE}memes/хомяк.jpg`} alt="" />
            </div>

            {popup && (
              <div className="minimal-popup" onClick={() => setPopup(false)}>
                <div
                  className="popup-inner"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="popup-close"
                    onClick={() => setPopup(false)}
                  >
                    ×
                  </button>

                  <p className="section-number">CONFESSION</p>

                  <h2>
                    Вот спорим,
                    <br />
                    никто
                    <br />
                    тебе такого
                    <br />
                    не делал.
                  </h2>

                  <p className="popup-text">
                    А ты ещё проверяешь...
                    <br />
                    Не понял, что только я могла догадаться отправить тебе
                    ссылку, как одно предложение, и уместить туда целую
                    открытку. Я старалась, чтобы получилось красиво.
                  </p>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setPopup(false)}
                  >
                    ПОНЯТНО
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 06 — ПОЖЕЛАНИЯ */}

        {page === 5 && (
          <section className="page">
            <div className="page-content mood-page">
              <p className="section-number">06 / THE IMPORTANT THINGS</p>

              <h2 className="mood-title">
                И ещё я хочу
                <br />
                пожелать тебе:
              </h2>

              <div className="mood-list">
                <div>
                  <span>01</span>
                  GOOD MOOD
                </div>

                <div>
                  <span>02</span>
                  FRIENDS
                </div>

                <div>
                  <span>03</span>
                  MONEY
                </div>

                <div>
                  <span>04</span>
                  HEALTH
                </div>
              </div>

              <div className="long-text mood-text">
                <p>
                  Чтобы рядом были друзья (много друзей — не один и не два, а
                  много), с которыми можно смеяться над полной ерундой, а
                  можно поговорить о действительно важных вещах.
                </p>

                <p>Чтобы деньги дальше не были причиной проблем.</p>

                <p>
                  Чтобы здоровье не подводило — а то я видела новости из
                  Иркутска.
                </p>

                <p>
                  И чтобы рядом был человек, с которым всё это приятно делить.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 07 — СЧЁТЧИК */}

        {page === 6 && (
          <section className="page">
            <div className="page-content counter-page">
              <p className="section-number">07 / TIME</p>

              <h1>
                Ты живёшь <em>уже</em>
              </h1>

              <p className="intro-text">
                Вот сколько времени ты уже здесь. Цифры идут прямо сейчас.
              </p>

              <div className="counter-grid">
                <div className="counter-cell wide">
                  <strong>{lived.days.toLocaleString('ru-RU')}</strong>
                  <span>ДНЕЙ</span>
                </div>

                <div className="counter-cell">
                  <strong>{String(lived.hours).padStart(2, '0')}</strong>
                  <span>ЧАСОВ</span>
                </div>

                <div className="counter-cell">
                  <strong>{String(lived.minutes).padStart(2, '0')}</strong>
                  <span>МИНУТ</span>
                </div>

                <div className="counter-cell">
                  <strong>{String(lived.seconds).padStart(2, '0')}</strong>
                  <span>СЕКУНД</span>
                </div>
              </div>

              <div className="counter-facts">
                <p>
                  Твоё сердце ударило примерно{' '}
                  <b>{heartbeats.toLocaleString('ru-RU')}</b> раз.
                </p>

                <p>
                  Это около <b>{weeks.toLocaleString('ru-RU')}</b> недель — и
                  впереди их ещё очень много.
                </p>

                <p className="quiet-text">И это только начало.</p>
              </div>
            </div>
          </section>
        )}

        {/* 08 — ЧТО УЖЕ ПОЛУЧИЛОСЬ */}

        {page === 7 && (
          <section className="page">
            <div className="page-content ach-page">
              <p className="section-number">08 / ACHIEVEMENTS</p>

              <h2 className="ach-title">
                Достижения,
                <br />
                разблокированные в 25
              </h2>

              <div className="ach-list">
                {ACHIEVEMENTS.map((item) => (
                  <div className="ach" key={item.title}>
                    <div className="ach-icon">{item.icon}</div>

                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </div>

                    <span className="ach-tag">UNLOCKED</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 09 — ПРОГНОЗ */}

        {page === 8 && (
          <section className="page">
            <div className="page-content forecast-page">
              <p className="section-number">09 / FORECAST</p>

              <h2 className="ach-title">
                Прогноз на
                <br />
                ближайший год
              </h2>

              <div className="forecast-list">
                {FORECAST.map((item) => (
                  <div key={item.label}>
                    <div className="forecast-top">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>

                    <div className="forecast-bar">
                      <div
                        className={
                          item.accent
                            ? 'forecast-fill accent'
                            : 'forecast-fill'
                        }
                        style={{ '--w': `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="forecast-note">
                Прогноз составлен лично мной. Достоверность — ну почти.
              </p>
            </div>
          </section>
        )}

        {/* 10 — ГАЛЕРЕЯ */}

        {page === 9 && (
          <section className="page">
            <div className="page-content gallery-page">
              <p className="section-number">10 / GALLERY</p>

              <h1>
                Несколько <em>картинок</em>
              </h1>

              <p className="intro-text">
                Они показались мне подходящими. Тапни — на обороте подпись.
              </p>

              <div className="gallery-grid">
                {GALLERY.map((item, index) => (
                  <button
                    key={`${item.file}-${index}`}
                    type="button"
                    className={
                      flipped[index] ? 'flip-card flipped' : 'flip-card'
                    }
                    onClick={() =>
                      setFlipped((current) => ({
                        ...current,
                        [index]: !current[index],
                      }))
                    }
                    aria-label={`Картинка ${index + 1}`}
                  >
                    <span className="flip-inner">
                      <span className="flip-face flip-front">
                        {brokenImages[index] ? (
                          <span className="flip-ph">
                            <b>{String(index + 1).padStart(2, '0')}</b>
                            МЕСТО ДЛЯ КАРТИНКИ
                          </span>
                        ) : (
                          <img
                            src={`${BASE}memes/${item.file}`}
                            alt=""
                            onError={() =>
                              setBrokenImages((current) => ({
                                ...current,
                                [index]: true,
                              }))
                            }
                          />
                        )}
                      </span>

                      <span className="flip-face flip-back">
                        {item.caption}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 11 — ГЕНЕРАТОР ЖЕЛАНИЙ */}

        {page === 10 && (
          <section className="page">
            <div className="page-content gen-page">
              <p className="section-number">11 / MAKE A WISH</p>

              <h1>
                Загадай <em>желание</em>
              </h1>

              <div className="gen-box">
                <p className="section-number">ТВОЁ ЖЕЛАНИЕ</p>

                {wishIndex === null ? (
                  <p className="gen-wish placeholder">
                    Нажми на кнопку — и получишь пожелание.
                  </p>
                ) : (
                  <p className="gen-wish" key={wishCount}>
                    {WISHES[wishIndex]}
                  </p>
                )}

                {wishCount > 0 && (
                  <p className="gen-counter">
                    ВЫПАЛО ЖЕЛАНИЙ: {String(wishCount).padStart(2, '0')}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="outline-button"
                onClick={makeWish}
              >
                {wishCount === 0 ? 'ЗАГАДАТЬ' : 'ЕЩЁ ОДНО'}
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {/* 12 — ЛИЧНОЕ */}

        {page === 11 && (
          <section className="page">
            <div className="page-content personal-page">
              <p className="section-number">12 / FROM ME</p>

              <h1>
                Если <em>честно</em>
              </h1>

              <div className="letter">
                {PERSONAL_TEXT.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                <p className="letter-sign">— от меня</p>
              </div>
            </div>
          </section>
        )}

        {/* 13 — ФИНАЛ */}

        {page === 12 && (
          <section className="page">
            <Fireworks tap />

            <div className="page-content final-page">
              <p className="section-number">13 / END</p>

              <h1>
                Надеюсь,
                <br />
                мне удалось
                <br />
                поднять тебе
                <br />
                <em>настроение.</em>
              </h1>

              <div className="final-copy">
                <p>
                  Я правда надеюсь, что эта открытка хоть немного тебя
                  порадовала.
                </p>

                <h2>
                  С днём рождения ещё раз,
                  <br />
                  Максим.
                </h2>
              </div>

              <div className="final-bottom">
                <span>25</span>

                <button
                  type="button"
                  className="outline-button"
                  onClick={restart}
                >
                  НАЧАТЬ СНАЧАЛА
                </button>
              </div>

              <p className="quiet-text">
                Тапай по экрану — будут салюты. А в шапке сайта спрятан секрет:
                подсказка — логотип.
              </p>
            </div>
          </section>
        )}
      </main>

      {secret && (
        <div className="minimal-popup" onClick={() => setSecret(false)}>
          <div
            className="popup-inner"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="popup-close"
              onClick={() => setSecret(false)}
            >
              ×
            </button>

            <p className="section-number">SECRET</p>

            <h2>
              Ты нашёл
              <br />
              секрет.
            </h2>

            <p className="popup-text">
              Раз ты дошёл до этого места, значит, ты внимательный.
              <br />
              Это редкое качество, и оно мне нравится.
            </p>

            <button
              type="button"
              className="text-button"
              onClick={() => setSecret(false)}
            >
              ЗАКРЫТЬ
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>{tickerText.repeat(6)}</span>
          <span>{tickerText.repeat(6)}</span>
        </div>
      </div>

      <div className="navigation">
        <button
          type="button"
          className="nav-button"
          onClick={previousPage}
          disabled={page === 0 || candlePause}
          aria-label="Предыдущая страница"
        >
          ←
        </button>

        <div className="page-dots">
          {Array.from({ length: totalPages }, (_, index) => (
            <span
              key={index}
              className={index === page ? 'dot active' : 'dot'}
            />
          ))}
        </div>

        <button
          type="button"
          className="nav-button"
          onClick={nextPage}
          disabled={page === 0 || page === lastPage || candlePause}
          aria-label="Следующая страница"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default App;