/**
 * PIZZZA – 25 YEARS SKA-CORE & PIZZA
 * Vanilla JS Application & Web Audio API Engine
 */

let currentLang = 'bg';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initMobileNavigation();
  initWebAudioPizzaMixer();
  initJukeboxPlayer();
  initTimelineModal();
  initBookingForm();
  initMerchCart();
  initEasterEggPartyMode();
});

/* ==========================================================================
   1. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });
}

/* ==========================================================================
   2. WEB AUDIO API & PIZZA-MIXER ENGINE
   ========================================================================== */
/**
 * Real-time Web Audio API Engine that generates tight, synced Ska-Core music loops:
 * - Stem 1: Vocals (Punchy Punk Voice Synth / Formant filter chants)
 * - Stem 2: Guitars (Authentic Ska Upbeat Chords 'chik-a-chik')
 * - Stem 3: Bass (Walking Punk-Rock Bassline in A minor / D minor)
 * - Stem 4: Drums & Horns (High-energy Kick/Snare beat + Brass Section stabs)
 *
 * Each stem has individual gain nodes, mute flags, and visual turntable synchronization.
 */
function initWebAudioPizzaMixer() {
  let audioCtx = null;
  let isMasterPlaying = false;
  let masterGainNode = null;
  let tempoBpm = 165; // High energy Ska-Core tempo
  let nextNoteTime = 0.0;
  let currentStep = 0; // 16-step loop
  let timerId = null;

  // Stems State
  const stems = {
    vocals: {
      isPlaying: true,
      isMuted: false,
      volume: 0.80,
      gainNode: null,
      deckEl: document.getElementById('deck-vocals'),
      discEl: document.getElementById('pizza-disc-vocals'),
      vuBar: document.querySelector('#deck-vocals .vu-bar')
    },
    guitars: {
      isPlaying: true,
      isMuted: false,
      volume: 0.85,
      gainNode: null,
      deckEl: document.getElementById('deck-guitars'),
      discEl: document.getElementById('pizza-disc-guitars'),
      vuBar: document.querySelector('#deck-guitars .vu-bar')
    },
    bass: {
      isPlaying: true,
      isMuted: false,
      volume: 0.90,
      gainNode: null,
      deckEl: document.getElementById('deck-bass'),
      discEl: document.getElementById('pizza-disc-bass'),
      vuBar: document.querySelector('#deck-bass .vu-bar')
    },
    drums: {
      isPlaying: true,
      isMuted: false,
      volume: 0.95,
      gainNode: null,
      deckEl: document.getElementById('deck-drums'),
      discEl: document.getElementById('pizza-disc-drums'),
      vuBar: document.querySelector('#deck-drums .vu-bar')
    }
  };

  // Master UI Elements
  const masterPlayBtn = document.getElementById('master-play-btn');
  const masterPauseBtn = document.getElementById('master-pause-btn');
  const masterResetBtn = document.getElementById('master-reset-btn');
  const masterVolumeSlider = document.getElementById('master-volume');
  const masterVolumeVal = document.getElementById('master-volume-val');
  const syncStatus = document.getElementById('sync-status');

  // Initialize Web Audio Context
  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // Master Gain
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime((masterVolumeSlider.value / 100), audioCtx.currentTime);
      masterGainNode.connect(audioCtx.destination);

      // Create stem gain nodes
      Object.keys(stems).forEach(key => {
        const stem = stems[key];
        stem.gainNode = audioCtx.createGain();
        stem.gainNode.gain.setValueAtTime(stem.volume, audioCtx.currentTime);
        stem.gainNode.connect(masterGainNode);
      });
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Scheduler Engine for rhythmic sync
  function scheduleNextNote() {
    const secondsPerBeat = 60.0 / tempoBpm;
    const stepDuration = secondsPerBeat / 4; // 16th notes
    nextNoteTime += stepDuration;
    currentStep = (currentStep + 1) % 16;
  }

  function audioScheduler() {
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
      scheduleStepSounds(currentStep, nextNoteTime);
      scheduleNextNote();
    }
    if (isMasterPlaying) {
      timerId = requestAnimationFrame(audioScheduler);
    }
  }

  // Step Sounds Synthesizer (Ska Upbeat & Punk Drive)
  function scheduleStepSounds(step, time) {
    // 1. DRUMS & HORNS STEM
    if (stems.drums.isPlaying && !stems.drums.isMuted) {
      // Kick on 0, 8
      if (step === 0 || step === 8) {
        playKick(time, stems.drums.gainNode);
      }
      // Snare on 4, 12 (Skank beat backbeat)
      if (step === 4 || step === 12) {
        playSnare(time, stems.drums.gainNode);
      }
      // Fast Hi-hats on all eighths
      if (step % 2 === 0) {
        playHiHat(time, stems.drums.gainNode, step % 4 === 2);
      }
      // Brass Section Fanfare (steps 0, 3, 6, 12)
      if (step === 0 || step === 3 || step === 6 || step === 12) {
        playBrassChord(time, stems.drums.gainNode, step);
      }
      triggerVUMeter(stems.drums.vuBar);
    }

    // 2. GUITARS STEM: Classic Ska Upstroke (Offbeats: 2, 6, 10, 14)
    if (stems.guitars.isPlaying && !stems.guitars.isMuted) {
      if (step === 2 || step === 6 || step === 10 || step === 14) {
        playSkaGuitarChop(time, stems.guitars.gainNode);
        triggerVUMeter(stems.guitars.vuBar);
      }
    }

    // 3. BASS STEM: Punk Walking Bassline (A2, C3, D3, E3)
    if (stems.bass.isPlaying && !stems.bass.isMuted) {
      if (step % 2 === 0) {
        const bassNotes = [110.0, 110.0, 130.81, 146.83, 164.81, 146.83, 130.81, 123.47];
        const noteIndex = Math.floor(step / 2) % bassNotes.length;
        playPunkBass(time, stems.bass.gainNode, bassNotes[noteIndex]);
        triggerVUMeter(stems.bass.vuBar);
      }
    }

    // 4. VOCALS STEM: Rhythmic Punk Chants & Shouts ("Oi! Pizzza!")
    if (stems.vocals.isPlaying && !stems.vocals.isMuted) {
      if (step === 0 || step === 8) {
        playVocalShout(time, stems.vocals.gainNode, step === 0 ? 330 : 392);
        triggerVUMeter(stems.vocals.vuBar);
      }
    }
  }

  /* Sound Synthesis Modules */
  function playKick(time, destination) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  function playSnare(time, destination) {
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.12);
  }

  function playHiHat(time, destination, isOpen) {
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = audioCtx.createGain();
    const duration = isOpen ? 0.08 : 0.04;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  function playBrassChord(time, destination, step) {
    const freqs = step === 0 ? [220, 277, 330] : [261, 329, 392];
    freqs.forEach(freq => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(600, time + 0.18);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  function playSkaGuitarChop(time, destination) {
    const freqs = [330, 415, 493, 659];
    freqs.forEach(freq => {
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      osc.start(time);
      osc.stop(time + 0.07);
    });
  }

  function playPunkBass(time, destination, freq) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.05, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  function playVocalShout(time, destination, freq) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  function triggerVUMeter(vuBar) {
    if (!vuBar) return;
    vuBar.style.width = `${Math.floor(Math.random() * 40 + 60)}%`;
    setTimeout(() => {
      vuBar.style.width = '0%';
    }, 120);
  }

  /* Play / Pause / Visual Sync Logic */
  function startPlayback() {
    ensureAudioContext();
    if (isMasterPlaying) return;

    isMasterPlaying = true;
    nextNoteTime = audioCtx.currentTime + 0.05;
    currentStep = 0;
    audioScheduler();

    updateAllDiscsSpinningState();
    syncStatus.textContent = '● AUDIO ENGINE: LIVE STREAMING (165 BPM)';
    syncStatus.style.color = '#2ECC71';
  }

  function pausePlayback() {
    isMasterPlaying = false;
    if (timerId) cancelAnimationFrame(timerId);

    updateAllDiscsSpinningState();
    syncStatus.textContent = '⏸ AUDIO ENGINE: PAUSED';
    syncStatus.style.color = '#F1C40F';
  }

  function resetAll() {
    pausePlayback();
    Object.keys(stems).forEach(key => {
      const stem = stems[key];
      stem.isPlaying = true;
      stem.isMuted = false;
      stem.volume = 0.85;

      const muteBtn = stem.deckEl.querySelector('[data-action="toggle-mute"]');
      const playBtn = stem.deckEl.querySelector('[data-action="toggle-play"]');
      const volSlider = stem.deckEl.querySelector('.track-volume');
      const volInd = stem.deckEl.querySelector('.vol-indicator');

      if (muteBtn) {
        muteBtn.classList.remove('is-muted');
        muteBtn.querySelector('.mute-text').textContent = currentLang === 'bg' ? 'Заглуши' : 'Mute';
      }
      if (playBtn) {
        playBtn.classList.remove('active-pause');
        playBtn.querySelector('.state-text').textContent = currentLang === 'bg' ? 'Пусни' : 'Play';
      }
      if (volSlider && volInd) {
        volSlider.value = 85;
        volInd.textContent = '85%';
      }
      if (stem.gainNode && audioCtx) {
        stem.gainNode.gain.setValueAtTime(0.85, audioCtx.currentTime);
      }
    });

    masterVolumeSlider.value = 85;
    masterVolumeVal.textContent = '85%';
    if (masterGainNode && audioCtx) {
      masterGainNode.gain.setValueAtTime(0.85, audioCtx.currentTime);
    }

    updateAllDiscsSpinningState();
    syncStatus.textContent = currentLang === 'bg' ? '● АУДИО СИСТЕМА: ГОТОВА' : '● AUDIO ENGINE: READY';
  }

  function updateAllDiscsSpinningState() {
    Object.keys(stems).forEach(key => {
      const stem = stems[key];
      const shouldSpin = isMasterPlaying && stem.isPlaying && !stem.isMuted;
      if (shouldSpin) {
        stem.discEl.classList.add('is-spinning');
        stem.deckEl.classList.add('is-active');
      } else {
        stem.discEl.classList.remove('is-spinning');
        stem.deckEl.classList.remove('is-active');
      }
    });
  }

  /* Setup DOM Listeners for Decks */
  Object.keys(stems).forEach(key => {
    const stem = stems[key];
    const deck = stem.deckEl;
    if (!deck) return;

    // Play/Pause Deck Button
    const playBtn = deck.querySelector('[data-action="toggle-play"]');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        ensureAudioContext();
        stem.isPlaying = !stem.isPlaying;
        playBtn.classList.toggle('active-pause', !stem.isPlaying);
        playBtn.querySelector('.state-text').textContent = stem.isPlaying 
          ? (currentLang === 'bg' ? 'Пусни' : 'Play') 
          : (currentLang === 'bg' ? 'Спрян' : 'Stopped');

        if (!isMasterPlaying && stem.isPlaying) {
          startPlayback();
        } else {
          updateAllDiscsSpinningState();
        }
      });
    }

    // Mute Deck Button
    const muteBtn = deck.querySelector('[data-action="toggle-mute"]');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        ensureAudioContext();
        stem.isMuted = !stem.isMuted;
        muteBtn.classList.toggle('is-muted', stem.isMuted);
        muteBtn.querySelector('.mute-text').textContent = stem.isMuted 
          ? (currentLang === 'bg' ? 'Включи' : 'Unmute') 
          : (currentLang === 'bg' ? 'Заглуши' : 'Mute');

        if (stem.gainNode) {
          stem.gainNode.gain.setValueAtTime(stem.isMuted ? 0 : stem.volume, audioCtx.currentTime);
        }
        updateAllDiscsSpinningState();
      });
    }

    // Volume Slider
    const volSlider = deck.querySelector('.track-volume');
    const volInd = deck.querySelector('.vol-indicator');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        stem.volume = val;
        if (volInd) volInd.textContent = `${Math.round(val * 100)}%`;
        if (stem.gainNode && !stem.isMuted && audioCtx) {
          stem.gainNode.gain.setValueAtTime(val, audioCtx.currentTime);
        }
      });
    }
  });

  // Master UI Events
  masterPlayBtn.addEventListener('click', startPlayback);
  masterPauseBtn.addEventListener('click', pausePlayback);
  masterResetBtn.addEventListener('click', resetAll);

  masterVolumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) / 100;
    masterVolumeVal.textContent = `${Math.round(val * 100)}%`;
    if (masterGainNode && audioCtx) {
      masterGainNode.gain.setValueAtTime(val, audioCtx.currentTime);
    }
  });
}

/* ==========================================================================
   2.1 SPOTIFY JUKEBOX INTERACTION
   ========================================================================== */
function initJukeboxPlayer() {
  const iframe = document.getElementById('spotify-iframe');
  const embedButtons = document.querySelectorAll('.selection-grid button[data-embed]');
  const allJbButtons = document.querySelectorAll('.selection-grid .jb-btn');
  const coinSlot = document.getElementById('coin-slot');
  const cabinet = document.querySelector('.jukebox-cabinet');

  function playCoinSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      // High coin metallic ping 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1760, now); // A6
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Secondary clink
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2637, now + 0.08); // E7
      gain2.gain.setValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function flashJukebox() {
    if (!cabinet) return;
    cabinet.classList.add('jukebox-flash');
    setTimeout(() => cabinet.classList.remove('jukebox-flash'), 600);
  }

  if (embedButtons.length && iframe) {
    embedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const embedUrl = btn.getAttribute('data-embed');
        if (embedUrl) {
          playCoinSound();
          flashJukebox();
          iframe.src = embedUrl;
          allJbButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const jbSec = document.getElementById('jukebox');
          if (jbSec) {
            jbSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  if (coinSlot) {
    const handleCoinInsert = () => {
      playCoinSound();
      flashJukebox();
      // Cycle to the next embed option
      if (embedButtons.length && iframe) {
        let activeIdx = -1;
        embedButtons.forEach((b, idx) => {
          if (b.classList.contains('active')) activeIdx = idx;
        });
        const nextIdx = (activeIdx + 1) % embedButtons.length;
        embedButtons[nextIdx].click();
      }
    };

    coinSlot.addEventListener('click', handleCoinInsert);
    coinSlot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCoinInsert();
      }
    });
  }
}

/* ==========================================================================
   3. THE MENU OF TIME MODAL (BILINGUAL)
   ========================================================================== */
const timelineData = {
  bg: {
    'modal-1999': {
      title: '1999: НАЧАЛОТО ВЪВ ВАРНА',
      subtitle: 'Основаването на бандата от Кобо, Яшо и Рамбо',
      image: 'assets/images/album2.jpg',
      imageAlt: 'PIZZZA 1999 – Началото във Варна, ъндърграунд касетки',
      story: 'Групата е основана във Варна по идея на Кобо, с участието на басиста Яшо и барабаниста Рамбо. Впоследствие се оформят: Каската (вокали), Машинката (цук тромбон) и Ники (тромпет). Любопитен факт: Преди първия официален албум песните се разпространяват из страната на презаписвани аудио касетки.',
      tracksLabel: 'КУЛТОВИ ТРАКОВЕ ОТ ПЕРИОДА:',
      tracks: ['Първи репетиционни записи', 'Презаписвани касетки', 'Варненски ска-кор ъндърграунд']
    },
    'modal-2006': {
      title: '2006: ДЕБЮТЕН АЛБУМ „allBoom“',
      subtitle: 'Първият официален дългосвирещ албум',
      image: 'assets/images/album1.jpg',
      imageAlt: 'PIZZZA 2006 – allBoom дебютен дългосвирещ албум',
      story: 'Излиза първият официален албум на групата в този класически състав. Мощна брас атака, концертни химни и чисто пънк пого.',
      tracksLabel: 'КУЛТОВИ ТРАКОВЕ ОТ ПЕРИОДА:',
      tracks: ['allBoom (Full Album)', 'Класически концертни химни', 'Мошпит класика']
    },
    'modal-2013': {
      title: '2013: ОЗВУЧАВАНЕ И ПРОМЕНИ В СЪСТАВА – „PIZZZA“',
      subtitle: 'Гост-бардът Миро Морски и нов брас тандем',
      image: 'assets/images/photo3.jpg',
      imageAlt: 'PIZZZA 2013 – Озвучаване и сценичен изглед',
      story: 'Излиза едноименният албум. В една от песните гостува легендарният бард Миро Морски (фронтмен на варненската група „Джанго Зе“). В духовата секция на мястото на Машинката идва Ники малкия (саксофон), а на цук-тромбон застава Витко (Витомир), който свири и до днес.',
      tracksLabel: 'КУЛТОВИ ТРАКОВЕ ОТ ПЕРИОДА:',
      tracks: ['Едноименен албум „Pizzza“', 'feat. Миро Морски (Джанго Зе)', 'Брас секция: Ники малкия & Витко']
    },
    'modal-2020': {
      title: '2020: „КРАЛЯ НА КОФРАЖА“',
      subtitle: 'Култовият химн за работната етика',
      image: 'assets/images/photo2.jpg',
      imageAlt: 'PIZZZA 2020 – Краля на кофража и брас секцията',
      story: 'Излиза емблематичният сингъл с невероятния преразказ на Каската за работната етика на зидаро-кофражиста, облечен в тежък ска-пънк бийт.',
      tracksLabel: 'КУЛТОВИ ТРАКОВЕ ОТ ПЕРИОДА:',
      tracks: ['„Краля на кофража“ (Сингъл)', 'Разказът на Каската', 'Строително пого']
    },
    'modal-2025': {
      title: '2025: „ГЛАСОВЕТЕ НА БЪЛГАРИЯ“ И НОВА ЕРА',
      subtitle: 'Звездна колаборация и новият фронтмен Симона',
      image: 'assets/images/photo4.jpg',
      imageAlt: 'PIZZZA 2025 – Симона и новата ера на бандата',
      story: 'Мащабен проект в колаборация с именити музиканти: Иван Гатев (Контрол), СърМата Хари, хип-хоп звездата Neggi (от група „Фарс“) и R&B певицата Полина от Варна. На вокалите застава Симона – младо момиче от Варна, което поема микрофона.',
      tracksLabel: 'КУЛТОВИ ТРАКОВЕ ОТ ПЕРИОДА:',
      tracks: ['„Гласовете на България“', 'feat. Иван Гатев, СърМата Хари, Neggi & Полина', 'Вокали: Симона (Варна)']
    }
  },
  en: {
    'modal-1999': {
      title: '1999: THE BEGINNING IN VARNA',
      subtitle: 'Founding of the band by Kobo, Yasho and Rambo',
      image: 'assets/images/album2.jpg',
      imageAlt: 'PIZZZA 1999 – Underground cassette beginnings in Varna',
      story: 'The band was founded in Varna on Kobo\'s initiative, with bassist Yasho and drummer Rambo. Soon joined by Kaskata (vocals), Mashinkata (trombone) and Niki (trumpet). Fun fact: Before the first official album, tracks spread nationwide on bootleg cassette tapes passed hand-to-hand.',
      tracksLabel: 'CULT TRACKS FROM THIS ERA:',
      tracks: ['First Rehearsal Tapes', 'Dubbed Underground Tapes', 'Varna Ska-Core Underground']
    },
    'modal-2006': {
      title: '2006: DEBUT ALBUM "allBoom"',
      subtitle: 'First official full-length release',
      image: 'assets/images/album1.jpg',
      imageAlt: 'PIZZZA 2006 – allBoom debut LP',
      story: 'The debut official album "allBoom" drops with this classic lineup. Heavy brass attack, live concert anthems and pure punk moshpits.',
      tracksLabel: 'CULT TRACKS FROM THIS ERA:',
      tracks: ['allBoom (Full Album)', 'Classic Festival Anthems', 'Moshpit Classics']
    },
    'modal-2013': {
      title: '2013: SOUND REFRESH & LINEUP CHANGES – "PIZZZA"',
      subtitle: 'Guest singer Miro Morski & new brass duo',
      image: 'assets/images/photo3.jpg',
      imageAlt: 'PIZZZA 2013 – Sound refresh and brass lineup',
      story: 'Release of the self-titled album. Featuring legendary guest bard Miro Morski (Django Ze frontman). In the horn section, Niki the Kid takes sax, while Vitko (Vitomir) steps in on trombone, remaining in the band to this day.',
      tracksLabel: 'CULT TRACKS FROM THIS ERA:',
      tracks: ['Self-Titled Album "Pizzza"', 'feat. Miro Morski (Django Ze)', 'Brass Duo: Niki the Kid & Vitko']
    },
    'modal-2020': {
      title: '2020: "KING OF FORMWORK"',
      subtitle: 'Cult anthem celebrating the working crew',
      image: 'assets/images/photo2.jpg',
      imageAlt: 'PIZZZA 2020 – King of Formwork single',
      story: 'Release of the iconic single featuring Kaskata\'s hilarious and authentic monologue on construction worker ethics.',
      tracksLabel: 'CULT TRACKS FROM THIS ERA:',
      tracks: ['"King of Formwork" (Single)', 'Kaskata\'s Working Class Monologue', 'Construction Circle Pit']
    },
    'modal-2025': {
      title: '2025: "VOICES OF BULGARIA" & NEW ERA',
      subtitle: 'All-star collaboration & new frontwoman Simona',
      image: 'assets/images/photo4.jpg',
      imageAlt: 'PIZZZA 2025 – Simona and Voices of Bulgaria',
      story: 'Major collaborative project with prominent musicians: Ivan Gatev (Kontrol), SarMata Hari, hip-hop star Neggi (Fars), and R&B vocalist Polina. Taking center stage is Simona – a powerhouse young vocalist from Varna, injecting explosive new energy.',
      tracksLabel: 'CULT TRACKS FROM THIS ERA:',
      tracks: ['"Voices of Bulgaria"', 'feat. Ivan Gatev, SarMata Hari, Neggi & Polina', 'Lead Vocals: Simona (Varna)']
    }
  }
};

function initTimelineModal() {
  const modal = document.getElementById('timeline-modal');
  const closeBtn = document.getElementById('modal-close');
  const target = document.getElementById('modal-content-target');
  const dishes = document.querySelectorAll('.timeline-dish');

  if (!modal || !closeBtn || !target) return;

  dishes.forEach(dish => {
    dish.addEventListener('click', () => {
      const modalKey = dish.getAttribute('data-modal');
      const langData = timelineData[currentLang] || timelineData.bg;
      const data = langData[modalKey];
      if (!data) return;

      target.innerHTML = `
        <img src="${data.image}" alt="${data.imageAlt}" class="modal-dish-img">
        <h3 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--color-punk-red); margin-bottom: 0.3rem;">
          ${data.title}
        </h3>
        <h4 style="font-family: var(--font-heading); color: #555; text-transform: uppercase; margin-bottom: 1.2rem;">
          ${data.subtitle}
        </h4>
        <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.5rem; color: #222;">
          ${data.story}
        </p>
        <div style="background: #111; color: #FFF; padding: 1rem; border: 2px solid #000; box-shadow: 4px 4px 0 #000;">
          <strong style="display:block; font-family: var(--font-heading); color: var(--color-cheese-light); margin-bottom: 0.5rem;">
            ${data.tracksLabel}
          </strong>
          <ul style="list-style: none; padding-left: 0;">
            ${data.tracks.map(t => `<li style="font-family: var(--font-heading); font-size: 1.05rem;">🍕 ${t}</li>`).join('')}
          </ul>
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ==========================================================================
   4. BOOKING FORM
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('b-name').value;
      const city = document.getElementById('b-city').value;

      feedback.className = 'form-feedback success';
      if (currentLang === 'en') {
        feedback.textContent = `🍕 Thank you, ${name}! Your show inquiry for ${city} has been sent to the band! We will reply within 24 hours.`;
      } else {
        feedback.textContent = `🍕 Благодарим ти, ${name}! Запитването за концерт в ${city} е изпратено към бандата! Ще се свържем с теб до 24 часа.`;
      }
      form.reset();
    });
  }


}

/* ==========================================================================
   5. FOOTER EASTER EGG: PARTY MODE
   ========================================================================== */
function initEasterEggPartyMode() {
  const eggBtn = document.getElementById('easter-egg-btn');
  if (!eggBtn) return;

  eggBtn.addEventListener('click', () => {
    document.body.classList.toggle('party-mode');
    
    // Play celebratory sound burst if Web Audio is active
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (err) {
        // Silent catch for audio block policy
      }
    }
  });
}

/* ==========================================================================
   6. LANGUAGE SWITCHER & LOCALIZATION DICTIONARY (BG / EN)
   ========================================================================== */
const translations = {
  bg: {
    top_bar_tag: '🍕 ОФИЦИАЛЕН САЙТ • ВАРНА 1999–2026',
    top_social_label: 'СЛУШАЙ & СЛЕДВАЙ:',
    logo_badge: '25 ГОДИНИ',
    nav_mixer: 'Миксер',
    nav_jukebox: 'Дискография',
    nav_videos: 'Клипове',
    nav_timeline: 'История',
    nav_tour_merch: 'Турне & Мърч',
    nav_gallery: 'Галерия',
    nav_booking: 'Контакти',
    hero_sticker_1: '★ 1999–2026 ★',
    hero_sticker_2: '100% ЧИСТ СКА-КОР',
    hero_sticker_3: 'ГРЪМОГЛАСЕН БРАС',
    hero_title_1: '25 ГОДИНИ',
    hero_title_2: 'SKA-CORE CHAOS',
    hero_title_3: '& PIZZZA!',
    hero_subtext: 'Четвърт век безкомпромисен ъндърграунд, брас секция, пого пред сцената, препечени корички и високи децибели. Включи се в PIZZZA отбора!',
    hero_cta_mixer: '<span class="btn-icon">🔥</span><span>ПОРЪЧАЙ МИКСА (Пусни всичко)</span>',
    hero_cta_dates: '<span>ПРЕДСТОЯЩИ ДАТИ</span>',
    mixer_tag: 'ИНТЕРАКТИВЕН УЕБ АУДИО МИКСЕР',
    mixer_title: 'ПИЦА ПУЛТ: 4-КАНАЛЕН МИКСЕР НА ЖИВО',
    mixer_desc: 'Сглоби перфектното парче ска-кор хаос! Управлявай отделните съставки: вокали, китари, бас и барабани с духови. Всяка пица се върти като грамофонна плоча, докато трака свири.',
    console_label: 'ГЛАВЕН КОНТРОЛЕН ПУЛТ / ПЕЩТА',
    master_play: '<span class="btn-icon">▶</span> ПУСНИ ВСИЧКО',
    master_pause: '<span class="btn-icon">⏸</span> ПАУЗА',
    master_reset: '<span class="btn-icon">↺</span> ИЗЧИСТИ ВСИЧКО',
    master_volume_label: 'ОБЩА СИЛА НА ЗВУКА:',
    tempo_label: 'ТЕМПО:',
    audio_ready: '● АУДИО СИСТЕМА: ГОТОВА',
    deck_1_num: 'ПИСТА #01',
    deck_1_name: 'ВОКАЛИ',
    deck_1_badge: '🌶️ Люто Пеперони',
    deck_1_label: 'ВОКАЛИ',
    deck_2_num: 'ПИСТА #02',
    deck_2_name: 'КИТАРИ',
    deck_2_badge: '🧀 Ска Акорди',
    deck_2_label: 'КИТАРИ',
    deck_3_num: 'ПИСТА #03',
    deck_3_name: 'БАС',
    deck_3_badge: '🍄 Пънк Бас Линия',
    deck_3_label: 'БАС',
    deck_4_num: 'ПИСТА #04',
    deck_4_name: 'ДУХАЧИ & БАРАБАНИ',
    deck_4_badge: '🎺 Медни Духови & Барабани',
    deck_4_label: 'ДУХАЧИ & БАРАБАНИ',
    btn_play: 'Пусни',
    btn_mute: 'Заглуши',
    fader_vol: 'СИЛА:',
    jb_title: 'PIZZZA РЕТРО ДЖУБОКС',
    jb_prompt: '⚡ ОФИЦИАЛЕН SPOTIFY ПРОФИЛ: АЛБУМИ, СИНГЛИ & ХИТОВЕ',
    jb_coin: 'ПУСНИ МОНЕТА ЗА СКА-КОР',
    jb_btn_spotify: '🎧 СЛУШАЙ В SPOTIFY',
    jb_btn_disco: 'ДИСКОГРАФИЯ',
    jb_btn_top: 'ТОП ХИТОВЕ',
    videos_tag: 'ОФИЦИАЛНИ КЛИПОВЕ И СИНГЛИ',
    videos_title: 'ВИДЕО СЦЕНА',
    videos_desc: 'Официални видеоклипове, актуални сингли и култови колаборации от златния фонд на групата.',
    vid_tag_1: 'ОФИЦИАЛНА КОЛАБОРАЦИЯ',
    vid_title_1: 'PIZZZA feat. Асен Василев – „Кой Разпореди Това Безобразие“',
    vid_desc_1: 'Експлозивна ска-кор колаборация, социална сатира, остър хумор и взривяваща брас секция.',
    vid_tag_2: 'ОФИЦИАЛЕН МУЗИКАЛЕН КЛИП',
    vid_title_2: 'PIZZZA – „Наш\'та Маса“ feat. NEGY (Official Music Video)',
    vid_desc_2: 'Официален видеоклип – химнът за приятелите, масата и добрите времена. Чист ска-кор ъндърграунд вайб!',
    vid_tag_3: 'СКА-ПЪНК ХИМН',
    vid_title_3: 'PIZZZA – „Един За Един“',
    vid_desc_3: 'Бързо темпо, безкомпромисно пого пред сцената и мощни медни духови. Чиста ска-кор класика за верните фенове.',
    vid_link: 'Гледай в YouTube ➜',
    timeline_badge: '1999 – 2026',
    timeline_title: 'МЕНЮ НА ВРЕМЕТО (ВАРНЕНСКАТА ХРОНОЛОГИЯ)',
    timeline_desc: 'Отвори кутията на спомените. Кликни върху всяко ястие от менюто за подробна история, състав и редки архиви от Варна.',
    menu_board_title: 'ПИЦАРИЯ PIZZZA: СПЕЦИАЛНО МЕНЮ',
    menu_board_sub: 'Автентична рецепта от улиците на Варна (1999–2026)',
    dish_1_title: '1999: Началото във Варна',
    dish_1_desc: 'Групата е основана във Варна по идея на Кобо, с участието на басиста Яшо и барабаниста Рамбо. Впоследствие се оформят: Каската (вокали), Машинката (цук тромбон) и Ники (тромпет). Любопитен факт: Преди първия официален албум песните се разпространяват из страната на презаписвани аудио касетки.',
    dish_2_title: '2006: Дебютен албум „allBoom“',
    dish_2_desc: 'Излиза първият официален албум на групата в този класически състав. Мощна брас атака, концертни химни и чисто пънк пого.',
    dish_3_title: '2013: Озвучаване и промени в състава – „Pizzza“',
    dish_3_desc: 'Излиза едноименният албум. В една от песните гостува легендарният бард Миро Морски (фронтмен на варненската група „Джанго Зе“). В духовата секция на мястото на Машинката идва Ники малкия (саксофон), а на цук-тромбон застава Витко (Витомир), който свири и до днес.',
    dish_4_title: '2020: „Краля на кофража“',
    dish_4_desc: 'Излиза емблематичният сингъл с невероятния преразказ на Каската за работната етика на зидаро-кофражиста.',
    dish_5_title: '2025: „Гласовете на България“ и нова ера',
    dish_5_desc: 'Мащабен проект в колаборация с именити музиканти: Иван Гатев (Контрол), СърМата Хари, хип-хоп звездата Neggi (от група „Фарс“) и R&B певицата Полина от Варна. На вокалите застава Симона – младо момиче от Варна, което поема микрофона.',
    btn_dish_inspect: 'Опитай парчето ➜',
    btn_dish_new_era: '★ НОВА ЕРА ★',
    tour_badge: 'КАЛЕНДАР ЗА ПОГО НА ЖИВО',
    tour_title: 'ТУРНЕ „25 ГОДИНИ НА ЖАРТА“',
    tour_sub: 'Ела да се потиш пред сцената. Билети на входа и онлайн.',
    btn_fb_event: 'ФБ СЪБИТИЕ',
    merch_badge: 'ОФИЦИАЛЕН DIY МЪРЧ',
    merch_title: 'МЕНЮ С МЪРЧ ЗА ФЕНОВЕ',
    merch_sub: 'Демо артикули.',
    merch_item_1_title: 'Тениска „25 Години Ска & Пица“',
    merch_item_2_title: '12" Червен Винил „Златни Корички“',
    merch_item_3_title: 'Сет Нашивки + 10 Стикери за кутии',
    merch_item_4_title: 'Метална отварачка „Pizzza Ска-Кор“',
    stock_limited: 'ОГРАНИЧЕНИ',
    stock_vinyl: 'ЛИМИТИРАН',
    stock_available: 'В НАЛИЧНОСТ',
    stock_top: 'ТОП ИЗБОР',
    btn_order: 'Поръчай ➔',
    gallery_badge: 'СПОМЕНИ И ПОГО',
    gallery_title: 'СТЕНА НА ЛУДОСТТА (ПОЛАРОИДЕН АРХИВ)',
    gallery_desc: 'Пънк архив от последните две десетилетия и половина. Зад кулисите, репетиционната и сцената.',
    art_1: 'СКОК В ТЪЛПАТА',
    art_2: 'БРАС АТАКА',
    art_3: 'БЕКСТЕЙДЖ',
    art_4: 'СТУДИО',
    art_5: 'ФЕСТИВАЛНО ПОГО',
    cap_1: 'О`Шипка Live, София (2008)',
    cap_2: 'Брас атака & тромпети (2025)',
    cap_3: 'Бекстейдж хаос & пици (2016)',
    cap_4: 'Студийни сесии на 40°C (2021)',
    cap_5: 'Фестивална енергия & фенове (2024)',
    cap_6: 'Stage dive - Строежа-София (2018)',
    booking_badge: 'ДИРЕКТЕН БУУКИНГ',
    booking_title: 'ИЗВИКАЙ НИ В ТВОЯ ГРАД',
    booking_sub: 'Организираш клубен концерт, фестивал или DIY пънк гиг? Пиши ни директно:',
    form_label_name: 'Име / Организация / Клуб:',
    form_label_email: 'Имейл за обратна връзка:',
    form_label_city: 'Град:',
    form_label_date: 'Желана дата:',
    form_label_msg: 'Детайли за събитието:',
    form_btn_submit: '<span>ИЗПРАТИ ЗАПИТВАНЕ</span> ✉️',
    rider_badge: 'ТЕХНИЧЕСКИ РАЙДЪР',
    rider_title: 'ЗАДЪЛЖИТЕЛЕН ТЕХНИЧЕСКИ РАЙДЪР',
    rider_sub: 'Без тези неща ска-кор машината не пали:',
    rider_item_1_title: '2 Семейни пици в бекстейджа:',
    rider_item_1_desc: '1 бр. Люто Пеперони и 1 бр. Четири сирена (без компромис).',
    rider_item_2_title: 'Минимум 12 студени бири:',
    rider_item_2_desc: 'И 2 бутилки минерална вода за брас секцията.',
    rider_item_3_title: '3 бр. Shure SM58 за вокалите:',
    rider_item_3_desc: 'И устойчиви микрофонни стойки, способни да издържат на сценично пого.',
    rider_item_4_title: 'Озвучаване за духовите:',
    rider_item_4_desc: 'Силни сценични монитори, за да се чуват тромпетът и тромбонът над барабаните.',
    rider_item_5_title: 'Атмосфера:',
    rider_item_5_desc: 'Приятелско отношение, фенове готови за ска танц и суров ъндърграунд звук.',
    contacts_label: 'Директен контакт с мениджмънта:',
    footer_copy: '© 1999–2026 PIZZZA Ска-Кор (Варна). Всички права запазени за ъндърграунда. Създадено с чист HTML, CSS и Web Audio API без консерванти.',
    easter_hint: 'Кликни парчето за тайна съставка!',
    party_banner: '🚨 ПАРТИ РЕЖИМ: МЕЛЕ ПРЕД СЦЕНАТА! СКА-КОР ОВЪРДРАЙВ! 🚨'
  },
  en: {
    top_bar_tag: '🍕 OFFICIAL BAND SITE • VARNA 1999–2026',
    top_social_label: 'LISTEN & FOLLOW:',
    logo_badge: '25 YEARS',
    nav_mixer: 'Mixer',
    nav_jukebox: 'Discography',
    nav_videos: 'Videos',
    nav_timeline: 'History',
    nav_tour_merch: 'Tour & Merch',
    nav_gallery: 'Gallery',
    nav_booking: 'Contacts',
    hero_sticker_1: '★ 1999–2026 ★',
    hero_sticker_2: '100% RAW SKA-CORE',
    hero_sticker_3: 'LOUD BRASS SECTION',
    hero_title_1: '25 YEARS',
    hero_title_2: 'SKA-CORE CHAOS',
    hero_title_3: '& PIZZZA!',
    hero_subtext: 'A quarter century of uncompromising underground, brass section, stage moshing, crispy crusts and loud decibels. Join the PIZZZA crew!',
    hero_cta_mixer: '<span class="btn-icon">🔥</span><span>ORDER THE MIX (Play All)</span>',
    hero_cta_dates: '<span>TOUR DATES</span>',
    mixer_tag: 'INTERACTIVE WEB AUDIO MIXER',
    mixer_title: 'PIZZA CONSOLE: 4-TRACK LIVE MIXER',
    mixer_desc: 'Assemble the perfect slice of ska-core chaos! Control the toppings: vocals, guitars, bass, and drums with horns. Each pizza vinyl spins while active.',
    console_label: 'MASTER CONTROL / THE OVEN',
    master_play: '<span class="btn-icon">▶</span> PLAY ALL',
    master_pause: '<span class="btn-icon">⏸</span> PAUSE',
    master_reset: '<span class="btn-icon">↺</span> RESET ALL',
    master_volume_label: 'MASTER VOL:',
    tempo_label: 'TEMPO:',
    audio_ready: '● AUDIO ENGINE: READY',
    deck_1_num: 'TRACK #01',
    deck_1_name: 'VOCALS',
    deck_1_badge: '🌶️ Spicy Pepperoni',
    deck_1_label: 'VOCALS',
    deck_2_num: 'TRACK #02',
    deck_2_name: 'GUITARS',
    deck_2_badge: '🧀 Ska Chords',
    deck_2_label: 'GUITARS',
    deck_3_num: 'TRACK #03',
    deck_3_name: 'BASS',
    deck_3_badge: '🍄 Punk Bassline',
    deck_3_label: 'BASS',
    deck_4_num: 'TRACK #04',
    deck_4_name: 'HORNS & DRUMS',
    deck_4_badge: '🎺 Brass & Drums',
    deck_4_label: 'HORNS',
    btn_play: 'Play',
    btn_mute: 'Mute',
    fader_vol: 'VOL:',
    jb_title: 'PIZZZA RETRO JUKEBOX',
    jb_prompt: '⚡ OFFICIAL SPOTIFY PROFILE: ALBUMS, SINGLES & HITS',
    jb_coin: 'INSERT COIN FOR SKA-CORE',
    jb_btn_spotify: '🎧 LISTEN ON SPOTIFY',
    jb_btn_disco: 'DISCOGRAPHY',
    jb_btn_top: 'TOP TRACKS',
    videos_tag: 'OFFICIAL VIDEOS & SINGLES',
    videos_title: 'VIDEO STAGE',
    videos_desc: 'Official music videos, new singles and cult collaborations from the band\'s vault.',
    vid_tag_1: 'OFFICIAL COLLABORATION',
    vid_title_1: 'PIZZZA feat. Asen Vasilev – "Who Ordered This Outrage"',
    vid_desc_1: 'Explosive ska-core collaboration, social satire, witty humor and blasting brass horns.',
    vid_tag_2: 'OFFICIAL MUSIC VIDEO',
    vid_title_2: 'PIZZZA – "Nash\'ta Masa" feat. NEGY (Official Music Video)',
    vid_desc_2: 'Official music video – the anthem for friendship, gathering around the table and great times. Pure ska-core underground vibe!',
    vid_tag_3: 'SKA-PUNK ANTHEM',
    vid_title_3: 'PIZZZA – "Edin Za Edin"',
    vid_desc_3: 'High-speed tempo, intense stage moshpit and blasting brass horns. Pure ska-core classic for true fans.',
    vid_link: 'Watch on YouTube ➜',
    timeline_badge: '1999 – 2026',
    timeline_title: 'MENU OF TIME (THE VARNA CHRONOLOGY)',
    timeline_desc: 'Open the box of memories. Click each dish on the menu for full history, lineup and rare archives from Varna.',
    menu_board_title: 'PIZZERIA PIZZZA: SPECIAL MENU',
    menu_board_sub: 'Authentic recipe from the streets of Varna (1999–2026)',
    dish_1_title: '1999: The Beginning in Varna',
    dish_1_desc: 'Band founded in Varna by Kobo, with bassist Yasho and drummer Rambo. Soon joined by Kaskata (vocals), Mashinkata (trombone) and Niki (trumpet). Fun fact: Songs spread nationwide on bootleg cassettes before any official album.',
    dish_2_title: '2006: Debut Album "allBoom"',
    dish_2_desc: 'First official album released with the classic lineup. Powerful brass attack, festival anthems and pure punk moshpits.',
    dish_3_title: '2013: Sound Refresh & Lineup Changes – "Pizzza"',
    dish_3_desc: 'Release of the self-titled album. Featuring legendary guest bard Miro Morski (Django Ze). The horn section introduces Niki the Kid (saxophone) and Vitko (Vitomir) on trombone, playing to this day.',
    dish_4_title: '2020: "King of Formwork"',
    dish_4_desc: 'Release of the iconic single featuring Kaskata\'s hilarious monologue on construction worker ethics.',
    dish_5_title: '2025: "Voices of Bulgaria" & New Era',
    dish_5_desc: 'Major collaborative project with Ivan Gatev (Kontrol), SarMata Hari, hip-hop star Neggi (Fars), and R&B vocalist Polina. Fronting the band is Simona – a powerhouse young singer from Varna.',
    btn_dish_inspect: 'Taste slice ➜',
    btn_dish_new_era: '★ NEW ERA ★',
    tour_badge: 'LIVE MOSH CALENDAR',
    tour_title: '"25 YEARS ON COALS" TOUR',
    tour_sub: 'Come sweat in the pit. Tickets at door and online.',
    btn_fb_event: 'FB EVENT',
    merch_badge: 'OFFICIAL DIY MERCH',
    merch_title: 'FAN MERCH MENU',
    merch_sub: 'Demo items.',
    merch_item_1_title: 'T-Shirt "25 Yrs Ska & Pizza"',
    merch_item_2_title: '12" Red Vinyl "Greatest Crusts"',
    merch_item_3_title: 'Patches Set + 10 Box Stickers',
    merch_item_4_title: 'Metal Bottle Opener "Pizzza Ska-Core"',
    stock_limited: 'LIMITED',
    stock_vinyl: 'COLLECTOR',
    stock_available: 'IN STOCK',
    stock_top: 'TOP PICK',
    btn_order: 'Order ➔',
    gallery_badge: 'MEMORIES & MOSH',
    gallery_title: 'WALL OF MADNESS (POLAROID ARCHIVE)',
    gallery_desc: 'Punk archive from the past 25 years. Backstage, rehearsal room and loud stages.',
    art_1: 'STAGE DIVE',
    art_2: 'BRASS ATTACK',
    art_3: 'BACKSTAGE',
    art_4: 'STUDIO',
    art_5: 'FESTIVAL PIT',
    cap_1: '"Na Tamno" Live, Varna (2008)',
    cap_2: 'Brass Section & Horns (2012)',
    cap_3: 'Backstage Chaos & Pizza (2016)',
    cap_4: 'Studio Sessions at 40°C (2021)',
    cap_5: 'Festival Energy & Fans (2024)',
    cap_6: 'Stage Dive Frenzy in the Pit',
    booking_badge: 'DIRECT BOOKING',
    booking_title: 'BRING US TO YOUR CITY',
    booking_sub: 'Running a club gig, festival or DIY punk show? Hit us up directly:',
    form_label_name: 'Name / Organization / Venue:',
    form_label_email: 'Contact Email:',
    form_label_city: 'City:',
    form_label_date: 'Target Date:',
    form_label_msg: 'Event Details:',
    form_btn_submit: '<span>SEND INQUIRY</span> ✉️',
    rider_badge: 'TECHNICAL RIDER',
    rider_title: 'MANDATORY TECH RIDER',
    rider_sub: 'Without these items the ska-core beast won\'t start:',
    rider_item_1_title: '2 Family pizzas backstage:',
    rider_item_1_desc: '1 Spicy Pepperoni and 1 Four Cheese (strictly non-negotiable).',
    rider_item_2_title: 'At least 12 cold beers:',
    rider_item_2_desc: 'Plus 2 bottles of mineral water for the horn players.',
    rider_item_3_title: '3x Shure SM58 for vocals:',
    rider_item_3_desc: 'Heavy-duty mic stands that can withstand intense stage mosh.',
    rider_item_4_title: 'Loud Brass Monitoring:',
    rider_item_4_desc: 'Loud stage monitors so trumpet and trombone cut cleanly above drums.',
    rider_item_5_title: 'Atmosphere:',
    rider_item_5_desc: 'Friendly vibes, fans ready to skank, and raw loud underground sound.',
    contacts_label: 'Direct management contact:',
    footer_copy: '© 1999–2026 PIZZZA Ska-Core (Varna). All underground rights reserved. Handcrafted with pure HTML, CSS and Web Audio API without preservatives.',
    easter_hint: 'Click the slice for secret ingredient!',
    party_banner: '🚨 PARTY MODE: STAGE MOSHPIT! SKA-CORE OVERDRIVE! 🚨'
  }
};

function initLanguageSwitcher() {
  const btnBg = document.getElementById('lang-btn-bg');
  const btnEn = document.getElementById('lang-btn-en');

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    if (btnBg && btnEn) {
      btnBg.classList.toggle('active', lang === 'bg');
      btnEn.classList.toggle('active', lang === 'en');
    }

    // Update all data-i18n elements
    const i18nElements = document.querySelectorAll('[data-i18n]');
    const dict = translations[lang] || translations.bg;

    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (dict[key].includes('<') || dict[key].includes('&amp;')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update form placeholders
    const nameInput = document.getElementById('b-name');
    const emailInput = document.getElementById('b-email');
    const cityInput = document.getElementById('b-city');
    const msgInput = document.getElementById('b-msg');

    if (nameInput) nameInput.placeholder = lang === 'en' ? 'e.g. DIY Fest Varna' : 'Напр. DIY Fest Варна';
    if (emailInput) emailInput.placeholder = 'pizzzafan@domain.com';
    if (cityInput) cityInput.placeholder = lang === 'en' ? 'City' : 'Град';
    if (msgInput) msgInput.placeholder = lang === 'en' ? 'Tell us about the stage, sound system and venue capacity...' : 'Разкажи за сцената, саунда и капацитета...';
    renderMerchCart();
  }

  if (btnBg) {
    btnBg.addEventListener('click', () => setLanguage('bg'));
  }
  if (btnEn) {
    btnEn.addEventListener('click', () => setLanguage('en'));
  }

  // Initialize with Bulgarian by default
  setLanguage('bg');
}

/* Inline demo merchandise: catalog, state, operations, localization and rendering. */
const MERCH_CONFIG = Object.freeze({ demoMode: true });
const MERCH_PRODUCTS = Object.freeze({
  'anniversary-shirt': { price: 3500, names: { bg: 'Тениска „25 Години Ска & Пица“', en: 'T-Shirt "25 Yrs Ska & Pizza"' }, sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  'red-vinyl': { price: 4500, names: { bg: '12" Червен Винил „Златни Корички“', en: '12" Red Vinyl "Greatest Crusts"' } },
  'patches-stickers': { price: 1500, names: { bg: 'Сет Нашивки + 10 Стикери за кутии', en: 'Patches Set + 10 Box Stickers' } },
  'bottle-opener': { price: 1000, names: { bg: 'Метална отварачка „Pizzza Ска-Кор“', en: 'Metal Bottle Opener "Pizzza Ska-Core"' } }
});
const merchCart = new Map();
let merchFeedback = null;
const MERCH_LABELS = {
  bg: {
    title: 'Демо количка', demo: 'ДЕМО', notice: 'Демонстрационни артикули. Цените са примерни. Поръчките не са достъпни; не се изпращат имейли или лични данни.',
    size: 'Размер', choose: 'Избери размер', add: 'Добави в количката', empty: 'Количката е празна.',
    product: 'Продукт', variant: 'Размер / вариант', quantity: 'Количество', unit: 'Единична цена', line: 'Общо за артикула',
    subtotal: 'Междинна сума', count: 'Общ брой артикули', remove: 'Премахни', increase: 'Увеличи количеството', decrease: 'Намали количеството',
    summary: 'Обобщение (само за преглед)', unavailable: 'Поръчките още не са достъпни', explanation: 'Демо режим: не се изпращат поръчки, имейли или лични данни.',
    selectSize: 'Избери размер, преди да добавиш тениската.', added: 'Добавен артикул', updated: 'Количеството е променено', removed: 'Артикулът е премахнат'
  },
  en: {
    title: 'Demo cart', demo: 'DEMO', notice: 'Demonstration items. Prices are illustrative. Ordering is unavailable; no emails or personal data are submitted.',
    size: 'Size', choose: 'Choose a size', add: 'Add to cart', empty: 'Your cart is empty.',
    product: 'Product', variant: 'Size / variant', quantity: 'Quantity', unit: 'Unit price', line: 'Line total',
    subtotal: 'Subtotal', count: 'Total item count', remove: 'Remove', increase: 'Increase quantity', decrease: 'Decrease quantity',
    summary: 'Order summary (read only)', unavailable: 'Ordering is not yet available', explanation: 'Demo mode: no orders, emails or personal data are submitted.',
    selectSize: 'Choose a size before adding the T-shirt.', added: 'Item added', updated: 'Quantity updated', removed: 'Item removed'
  }
};
function merchLabels() { return MERCH_LABELS[currentLang] || MERCH_LABELS.bg; }
function merchMoney(amount) { return (amount / 100).toFixed(2) + ' BGN'; }
function merchTotals() {
  return [...merchCart.values()].reduce((total, item) => ({
    count: total.count + item.quantity,
    subtotal: total.subtotal + MERCH_PRODUCTS[item.id].price * item.quantity
  }), { count: 0, subtotal: 0 });
}
function addMerchItem(id, size = '') {
  const product = MERCH_PRODUCTS[id];
  if (!product || (product.sizes && !product.sizes.includes(size)) || (!product.sizes && size)) return false;
  const key = id + ':' + size;
  const item = merchCart.get(key);
  merchCart.set(key, { id, size, quantity: (item ? item.quantity : 0) + 1 });
  merchFeedback = { kind: 'added', id, size };
  return true;
}
function changeMerchItem(key, action) {
  const item = merchCart.get(key);
  if (!item || !['increase', 'decrease', 'remove'].includes(action)) return;
  const remove = action === 'remove' || (action === 'decrease' && item.quantity === 1);
  if (remove) merchCart.delete(key);
  else item.quantity += action === 'increase' ? 1 : -1;
  merchFeedback = { kind: remove ? 'removed' : 'updated', id: item.id, size: item.size };
}
function merchOrderSummary() {
  const labels = merchLabels();
  const summary = document.createElement('ul');
  summary.className = 'merch-summary-list';
  for (const item of merchCart.values()) {
    const product = MERCH_PRODUCTS[item.id];
    const row = document.createElement('li');
    const name = document.createElement('h5');
    name.textContent = product.names[currentLang];
    const facts = document.createElement('dl');
    for (const [label, value] of [
      [labels.variant, item.size || '\u2014'], [labels.quantity, item.quantity],
      [labels.unit, merchMoney(product.price)], [labels.line, merchMoney(product.price * item.quantity)]
    ]) {
      const field = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const description = document.createElement('dd'); description.textContent = value;
      field.append(term, description); facts.append(field);
    }
    row.append(name, facts); summary.append(row);
  }
  if (!merchCart.size) {
    const empty = document.createElement('li'); empty.textContent = labels.empty; summary.append(empty);
  }
  return summary;
}
function renderMerchCart() {
  const root = document.getElementById('merch-cart');
  if (!root) return;
  const labels = merchLabels();
  const column = root.closest('#tour-merch').querySelector('.col-merch');
  column.querySelector('[data-i18n="merch_sub"]').textContent = labels.demo;
  column.querySelectorAll('[data-merch-demo]').forEach(el => { el.textContent = labels.demo; });
  column.querySelectorAll('.btn-merch-inquire').forEach(button => {
    const product = MERCH_PRODUCTS[button.dataset.productId];
    const card = button.closest('.merch-card');
    card.querySelector('.merch-title').textContent = product.names[currentLang];
    card.querySelector('.merch-price').textContent = merchMoney(product.price);
    button.textContent = labels.add;
    button.setAttribute('aria-label', `${labels.add}: ${product.names[currentLang]}`);
  });
  column.querySelector('.merch-size-label').textContent = labels.size;
  document.querySelector('#merch-shirt-size option[value=""]').textContent = labels.choose;
  document.getElementById('merch-cart-heading').textContent = labels.title;
  const content = document.getElementById('merch-cart-content');
  content.replaceChildren();
  if (!merchCart.size) {
    const empty = document.createElement('p'); empty.textContent = labels.empty; content.append(empty);
  }
  for (const [key, item] of merchCart) {
    const product = MERCH_PRODUCTS[item.id];
    const name = product.names[currentLang] + (item.size ? ` (${labels.size}: ${item.size})` : '');
    const row = document.createElement('div'); row.className = 'merch-cart-line';
    const heading = document.createElement('h5'); heading.textContent = name;
    const price = document.createElement('p'); price.textContent = `${labels.unit}: ${merchMoney(product.price)} · ${labels.line}: ${merchMoney(product.price * item.quantity)}`;
    const controls = document.createElement('div'); controls.className = 'merch-cart-controls';
    const quantity = document.createElement('span'); quantity.textContent = `${labels.quantity}: ${item.quantity}`;
    for (const [action, text] of [['decrease', '−'], ['increase', '+'], ['remove', labels.remove]]) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
      button.dataset.cartAction = action; button.dataset.cartKey = key;
      button.setAttribute('aria-label', `${labels[action]}: ${name}`);
      controls.append(button);
    }
    controls.prepend(quantity); row.append(heading, price, controls); content.append(row);
  }
  const totals = merchTotals();
  document.getElementById('merch-cart-count').textContent = `${labels.count}: ${totals.count}`;
  document.getElementById('merch-cart-subtotal').textContent = `${labels.subtotal}: ${merchMoney(totals.subtotal)}`;
  document.getElementById('merch-summary-label').textContent = labels.summary;
  document.getElementById('merch-order-summary').replaceChildren(merchOrderSummary());
  document.getElementById('merch-order-explanation').textContent = MERCH_CONFIG.demoMode ? labels.notice : labels.explanation;
  document.getElementById('merch-submit').textContent = labels.unavailable;
  document.getElementById('merch-submit').disabled = true; // No order transport exists in this phase.
  const feedback = document.getElementById('merch-feedback');
  feedback.textContent = merchFeedback ? (merchFeedback.kind === 'selectSize' ? labels.selectSize : `${labels[merchFeedback.kind]}: ${MERCH_PRODUCTS[merchFeedback.id].names[currentLang]}${merchFeedback.size ? ' (' + merchFeedback.size + ')' : ''}. ${labels.count}: ${totals.count}. ${labels.subtotal}: ${merchMoney(totals.subtotal)}`) : '';
}
function initMerchCart() {
  const root = document.getElementById('merch-cart');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  root.closest('#tour-merch').addEventListener('click', event => {
    const add = event.target.closest('.btn-merch-inquire');
    if (add) {
      const size = document.getElementById('merch-shirt-size');
      const success = addMerchItem(add.dataset.productId, MERCH_PRODUCTS[add.dataset.productId].sizes ? size.value : '');
      if (!success) { merchFeedback = { kind: 'selectSize' }; size.setAttribute('aria-invalid', 'true'); size.focus(); }
      else size.removeAttribute('aria-invalid');
      renderMerchCart(); return;
    }
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const key = button.dataset.cartKey; const action = button.dataset.cartAction;
    changeMerchItem(key, action); renderMerchCart();
    const replacement = [...root.querySelectorAll('[data-cart-action]')].find(el => el.dataset.cartKey === key && el.dataset.cartAction === action) || root.querySelector('[data-cart-action]') || root.closest('#tour-merch').querySelector('.btn-merch-inquire');
    replacement.focus();
  });
  document.getElementById('merch-shirt-size').addEventListener('change', event => { event.target.removeAttribute('aria-invalid'); });
  renderMerchCart();
}
