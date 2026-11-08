/* 多页面共用：数据、进度、音效、通用工具、站点导航 */
(() => {
  'use strict';

  const { levels, questions } = window.QUIZ_DATA;
  const stories = window.LONG_MARCH_STORIES || [];

  const MAX_HP = 50;
  const DAMAGE = 10;
  const QUESTIONS_PER_LEVEL = 5;
  const ROUND_TIME = 12;
  const REVEAL_MS = 1750;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const MC_KEYS = ['A', 'S', 'D', 'F'];
  const TF_KEYS = ['A', 'S'];
  const PROGRESS_KEY = 'quizclash_campaign_v1';
  const SOUND_KEY = 'quizclash_sound_v1';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  let audioCtx = null;
  let memoryProgress = null;
  let toastTimer = null;
  let soundOn = (() => {
    try {
      return window.localStorage.getItem(SOUND_KEY) !== '0';
    } catch {
      return true;
    }
  })();

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function hexAlpha(hex, alpha) {
    const raw = String(hex).replace('#', '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    const num = parseInt(full, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  function formatDate(ts) {
    const date = new Date(ts || Date.now());
    if (Number.isNaN(date.getTime())) return '—';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDuration(seconds) {
    const value = Math.max(0, Math.round(Number(seconds) || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function starsFor(correct) {
    if (correct >= 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
    return 0;
  }

  function starText(stars) {
    return `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  }

  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    window.clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add('is-show');
    toastTimer = window.setTimeout(() => element.classList.remove('is-show'), 2200);
  }

  // ── 进度存档 ────────────────────────────────────────────
  function defaultProgress() {
    return { unlocked: 1, levels: {} };
  }

  function readProgress() {
    let source = null;
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw) source = JSON.parse(raw);
    } catch {
      /* 使用内存备份 */
    }
    if (!source && memoryProgress) source = memoryProgress;

    const progress = defaultProgress();
    if (source && typeof source === 'object') {
      const unlocked = Number(source.unlocked);
      if (Number.isFinite(unlocked)) progress.unlocked = clamp(Math.round(unlocked), 1, levels.length);
      if (source.levels && typeof source.levels === 'object') {
        Object.entries(source.levels).forEach(([key, value]) => {
          const levelId = Number(key);
          if (!Number.isInteger(levelId) || levelId < 1 || levelId > levels.length || !value) return;
          progress.levels[levelId] = {
            bestCorrect: clamp(Number(value.bestCorrect) || 0, 0, QUESTIONS_PER_LEVEL),
            bestHp: clamp(Number(value.bestHp) || 0, 0, MAX_HP),
            bestEnemyHp: clamp(Number(value.bestEnemyHp) || 0, 0, MAX_HP),
            bestTs: Number(value.bestTs) || 0,
            bestDuration: Number(value.bestDuration) || 0,
            attempts: Math.max(0, Number(value.attempts) || 0),
            cleared: Boolean(value.cleared)
          };
        });
      }
    }
    memoryProgress = progress;
    return progress;
  }

  function writeProgress(progress) {
    memoryProgress = progress;
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      return true;
    } catch {
      return false;
    }
  }

  function getNextLevel(progress) {
    for (const level of levels) {
      if (level.id <= progress.unlocked && !progress.levels[level.id]?.cleared) return level.id;
    }
    return levels[0].id;
  }

  function clearedCount(progress) {
    return levels.filter((level) => progress.levels[level.id]?.cleared).length;
  }

  function saveAttempt(levelId, result) {
    const progress = readProgress();
    const previous = progress.levels[levelId] || null;
    const attempts = (previous?.attempts || 0) + 1;
    const previousCorrect = previous ? previous.bestCorrect : -1;
    const previousHp = previous ? previous.bestHp : -1;
    const previousDuration = previous ? previous.bestDuration || Infinity : Infinity;

    const better = result.correct > previousCorrect
      || (result.correct === previousCorrect && result.playerHp > previousHp)
      || (result.correct === previousCorrect && result.playerHp === previousHp && result.duration < previousDuration);

    const best = better
      ? {
        bestCorrect: result.correct,
        bestHp: result.playerHp,
        bestEnemyHp: result.enemyHp,
        bestTs: Date.now(),
        bestDuration: result.duration
      }
      : {
        bestCorrect: previous?.bestCorrect || 0,
        bestHp: previous?.bestHp || 0,
        bestEnemyHp: previous?.bestEnemyHp || 0,
        bestTs: previous?.bestTs || 0,
        bestDuration: previous?.bestDuration || 0
      };

    const cleared = Boolean(previous?.cleared) || result.win;
    progress.levels[levelId] = {
      ...best,
      attempts,
      cleared
    };

    if (result.win) {
      progress.unlocked = Math.max(progress.unlocked, Math.min(levels.length, levelId + 1));
    }

    writeProgress(progress);
    return {
      newBest: better,
      attempts,
      best: progress.levels[levelId],
      cleared,
      unlocked: progress.unlocked
    };
  }

  // ── 音效 ────────────────────────────────────────────────
  function initAudio() {
    if (!soundOn) return null;
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch {
      return null;
    }
  }

  function tone(freq, duration = 0.08, type = 'sine', volume = 0.045, delay = 0) {
    if (!soundOn) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    } catch {
      /* 音效失败不影响答题 */
    }
  }

  const sfx = {
    select: () => tone(640, 0.055, 'triangle', 0.028),
    correct: () => {
      tone(720, 0.09, 'triangle', 0.04);
      tone(980, 0.15, 'triangle', 0.035, 0.075);
    },
    wrong: () => {
      tone(190, 0.14, 'sawtooth', 0.032);
      tone(125, 0.2, 'sawtooth', 0.028, 0.08);
    },
    tick: () => tone(920, 0.025, 'square', 0.014),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.04, i * 0.1)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.24, 'sine', 0.036, i * 0.14)),
    salute: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.038, i * 0.12))
  };

  function updateSoundButton() {
    const button = $('#sound-toggle');
    if (!button) return;
    button.textContent = soundOn ? '🔊' : '🔇';
    button.setAttribute('aria-label', soundOn ? '关闭音效' : '开启音效');
  }

  function toggleSound() {
    soundOn = !soundOn;
    try {
      window.localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0');
    } catch { /* 忽略 */ }
    updateSoundButton();
    if (soundOn) {
      initAudio();
      sfx.select();
    }
    toast(soundOn ? '音效已开启' : '音效已关闭');
  }

  // ── 站点导航 / 通用初始化 ───────────────────────────────
  function initChrome() {
    const page = document.body.dataset.page || '';
    $$('.site-links a').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.page === page);
    });
    $$('[data-story-count]').forEach((element) => {
      element.textContent = String(stories.length);
    });

    const progress = readProgress();
    const cleared = clearedCount(progress);
    const percent = Math.round((cleared / levels.length) * 100);
    const navProgress = $('#nav-progress');
    if (navProgress) navProgress.textContent = `${percent}%`;
    const target = cleared === levels.length ? 1 : getNextLevel(progress);
    $$('[data-start-link]').forEach((link) => {
      link.href = `game.html?level=${target}`;
    });

    updateSoundButton();
    const soundButton = $('#sound-toggle');
    if (soundButton) soundButton.addEventListener('click', toggleSound);
    document.addEventListener('pointerdown', initAudio, { passive: true });
  }

  window.LM = {
    levels,
    questions,
    stories,
    MAX_HP,
    DAMAGE,
    QUESTIONS_PER_LEVEL,
    ROUND_TIME,
    REVEAL_MS,
    LETTERS,
    MC_KEYS,
    TF_KEYS,
    PROGRESS_KEY,
    clamp,
    shuffle,
    escapeHtml,
    hexAlpha,
    formatDate,
    formatDuration,
    starsFor,
    starText,
    toast,
    readProgress,
    writeProgress,
    defaultProgress,
    getNextLevel,
    clearedCount,
    saveAttempt,
    initAudio,
    sfx,
    isSoundOn: () => soundOn,
    toggleSound,
    updateSoundButton
  };

  initChrome();
})();
