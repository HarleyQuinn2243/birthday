import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const CONFETTI_COLORS = ['#1d1d1b', '#b5533c', '#d9a441', '#77766f', '#c9c8c0'];

const WISHES = [
  'Чтобы завел кота.',
  'Чтобы все планы получались с первого раза.',
  'Чтобы деньги приходили быстрее, чем уходят.',
  'Чтобы рядом всегда были те, кому ничего не надо объяснять.',
  'Чтобы нашлась та девушка которая тебе подходит',
  'Чтобы понедельники начинались в 12:00.',
  'Чтобы приятные неожиданности случались чаще, чем неприятные.',
  'Билет на марс видимо тоже желаю',
  'Чтобы любимые песни играли ровно в нужный момент.',
  'Чтобы смог дорисовать картину',
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
    text: 'Не каждому удаётся. Тебе удалось.',
  },
  {
    icon: '♪',
    title: 'Иметь хороший музыкальный вкус',
    text: 'Sting и Эминем в одном плейлисте. Уважение.Правда я бы еще три дня дождя добавила ',
  },
  {
    icon: '☺',
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

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3.5 + Math.random() * 3,
        width: 6 + Math.random() * 8,
        height: 8 + Math.random() * 10,
        round: Math.random() > 0.65,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      })),
    []
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.round ? piece.width : piece.height,
            borderRadius: piece.round ? '50%' : 0,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
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

  const audioRef = useRef(null);
  const touchStart = useRef(null);

  const totalPages = 11;
  const lastPage = totalPages - 1;

  const candles = Array.from({ length: 25 }, (_, index) => index + 1);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

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

  const restart = () => {
    stopMusic();

    setPage(0);
    setBlownCandles([]);
    setCandlePause(false);
    setPopup(false);
    setMusicError(false);
    setWishIndex(null);
    setWishCount(0);
  };

  const handleTouchStart = (event) => {
    touchStart.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStart.current === null) {
      return;
    }

    const touchEnd = event.changedTouches[0].clientX;
    const difference = touchStart.current - touchEnd;

    if (Math.abs(difference) > 60 && !candlePause) {
      if (difference > 0) {
        if (page !== 0) {
          nextPage();
        }
      } else {
        previousPage();
      }
    }

    touchStart.current = null;
  };

  const tickerText = 'HAPPY BIRTHDAY · MAXIM · 25 · С ДНЁМ РОЖДЕНИЯ · ';

  return (
    <div
      className="site"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-number" aria-hidden="true">
        25
      </div>

      <header className="header">
        <span className="header-link">BIRTHDAY</span>

        <div className="logo">
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
                Здесь их действительно 25.
                <br />
                Не забудь загадать желание — оно потом пригодится.
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
                <Confetti />

                <div className="pause-box">
                  <p className="section-number">ENOUGH</p>

                  <h2>Ладно, хватит.</h2>

                  <p>
                    Пять свечей — вполне достаточно.
                    <br />
                    Остальные двадцать можешь представить.
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
                  <span className="big-age">25</span> — это тяжело.
                </p>

                <p>
                  Пхх.
                  <br />
                  Но не унывай.
                  <br />
                  Ладно, шучу.
                </p>

                <p>
                  Поздравляю тебя с днём рождения. Желаю всего прекрасного,
                  хорошего и легендарного.
                </p>

                <p className="quote">
                  Дальше будет несколько страниц. Каждая — с отдельным
                  пожеланием. Не пролистывай, я старалась.
                </p>
              </div>

              <img className="corner-dog" src="/memes/собачка.jpg" alt="" />
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
                    <strong>SHAPE OF MY HEART</strong>

                    <small>STING</small>
                  </div>
                </div>

                <div className="music-right">
                  <Equalizer on={playing === 'shape'} />

                  <button
                    type="button"
                    className="play-button"
                    onClick={() =>
                      playMusic(
                        'shape',
                        '/music/Sting_-_Shape_Of_My_Heart_47835291.mp3'
                      )
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
                <p>
                  Эта песня мне очень нравится, поэтому она здесь не просто так.
                </p>

                <p>
                  Пусть в твоей жизни будет больше таких моментов, которые
                  хочется не пролистать, а оставить себе.
                </p>

                <p>
                  Красивых дней, хороших новостей, спокойных вечеров и людей,
                  рядом с которыми действительно хорошо.
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
                Или как песни Эминема.
              </p>

              <div className="music-card">
                <div className="music-info">
                  <span className="track-number">02</span>

                  <div>
                    <strong>MOCKINGBIRD</strong>

                    <small>EMINEM</small>
                  </div>
                </div>

                <div className="music-right">
                  <Equalizer on={playing === 'eminem'} />

                  <button
                    type="button"
                    className="play-button"
                    onClick={() =>
                      playMusic(
                        'eminem',
                        '/music/Eminem_-_Mockingbird_47829435.mp3'
                      )
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
                  Хорошего настолько, чтобы утром хотелось вставать не потому,
                  что надо, а потому что интересно, что будет дальше.
                </p>

                <p>
                  Чтобы планы получались, случайности оказывались приятными, а
                  обычные дни иногда внезапно становились лучшими.
                </p>

                <p>И чтобы музыка всегда находила нужное настроение.</p>
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
                Вот спорим, никто из девушек тебе такого не делал.
              </p>

              <button
                type="button"
                className="outline-button"
                onClick={() => setPopup(true)}
              >
                ПРОВЕРИТЬ
                <span>→</span>
              </button>

              <img className="corner-hamster" src="/memes/хомяк.jpg" alt="" />
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
                    никто из девушек
                    <br />
                    тебе такого
                    <br />
                    не делал.
                  </h2>

                  <p className="popup-text">
                    А ты ещё проверяешь...
                    <br />
                    Не понял что только я могла догодаться отправить тебе ссылку,как одно предложнние
                    и уместить туда целую открытку .
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
                пожелать тебе 
                 <br />
                 (давай ты сможешь перевести)
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
                  Чтобы рядом были друзья, с которыми можно смеяться над полной
                  ерундой, а можно поговорить о действительно важных вещах.
                </p>

                <p>Чтобы деньги дальше не были причиной проблем.</p>

                <p>
                  Чтобы здоровье не подводило, да а то видел новости с
                  Иркутска.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 07 — ДОСТИЖЕНИЯ */}

        {page === 6 && (
          <section className="page">
            <div className="page-content ach-page">
              <p className="section-number">07 / ACHIEVEMENTS</p>

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

        {/* 08 — ПРОГНОЗ */}

        {page === 7 && (
          <section className="page">
            <div className="page-content forecast-page">
              <p className="section-number">08 / FORECAST</p>

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

        {/* 09 — ГЕНЕРАТОР ЖЕЛАНИЙ */}

        {page === 8 && (
          <section className="page">
            <div className="page-content gen-page">
              <p className="section-number">09 / MAKE A WISH</p>

              <h1>
                Загадай <em>желание</em>
              </h1>

              <div className="gen-box">
                <p className="section-number">ТВОЁ ЖЕЛАНИЕ</p>

                {wishIndex === null ? (
                  <p className="gen-wish placeholder">
                    Нажми на кнопку, и я выдам тебе пожелание.
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

        {/* 10 — БЕЗ ДЕПРЕССИЙ */}

        {page === 9 && (
          <section className="page">
            <div className="page-content depression-page">
              <p className="section-number">10 / IMPORTANT</p>

              <h1>
                Ну и давай
                <br />
                без депрессий.
              </h1>

              <div className="depression-copy">
                <p>Жизнь интересная штука.</p>

                <p>
                  Она точно не заканчивается на проблемах с бензином и
                  политике.
                </p>

                <p>Да, иногда всё идёт вообще не по плану.</p>

                <p>
                  Иногда приходится думать, решать какие-то проблемы,
                  переживать из-за денег, работы, машин, людей и ещё миллиона
                  вещей.
                </p>

                <p>
                  Но это всё равно только часть жизни. Не вся жизнь целиком.
                </p>

                <p className="quiet-text">
                  И я совсем ни на что не намекаю.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 11 — ФИНАЛ */}

        {page === 10 && (
          <section className="page">
            <Confetti />

            <div className="page-content final-page">
              <p className="section-number">11 / END</p>

              <h1>
                Надеюсь,
                <br />
                я хоть как-то
                <br />
                подняла тебе
                <br />
                <em>настроение.</em>
              </h1>

              <div className="final-copy">
                <p>
                  Я правда надеюсь, что хотя бы немного заставила тебя
                  улыбнуться.
                </p>

                <h2>
                  С Днём рождения ещё раз,
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
            </div>
          </section>
        )}
      </main>

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