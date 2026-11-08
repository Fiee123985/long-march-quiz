/* 首页 · 长征行军档案 */
(() => {
  'use strict';

  const LM = window.LM;
  const { levels } = LM;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const dom = {
    navProgress: $('#nav-progress'),
    startLabel: $('#start-label'),
    startLinks: $$('[data-start-link]'),
    progressPercent: $('#progress-percent'),
    progressDial: $('#progress-dial'),
    progressDistance: $('#progress-distance'),
    progressCurrent: $('#progress-current'),
    milestones: $('#milestones'),
    sun: $('#home-sun'),
    mist: $('.home-mist'),
    heroCopy: $('.hero-copy'),
    statDistance: $('#stat-distance'),
    statCleared: $('#stat-cleared'),
    statBest: $('#stat-best'),
    statAttempts: $('#stat-attempts')
  };

  function render() {
    const progress = LM.readProgress();
    const cleared = LM.clearedCount(progress);
    const next = LM.getNextLevel(progress);
    const allCleared = cleared === levels.length;
    const distance = cleared * 5000;
    const percent = Math.round((cleared / levels.length) * 100);
    const bestValues = levels
      .map((level) => progress.levels[level.id]?.bestCorrect)
      .filter((value) => Number.isFinite(value));
    const best = bestValues.length ? Math.max(...bestValues) : 0;
    const attempts = levels.reduce((sum, level) => sum + (progress.levels[level.id]?.attempts || 0), 0);

    dom.navProgress.textContent = `${percent}%`;
    dom.progressPercent.textContent = `${percent}%`;
    dom.progressDial.style.setProperty('--progress', String(percent));
    dom.progressDistance.textContent = `${distance.toLocaleString('en-US')} 里`;
    dom.progressCurrent.textContent = allCleared ? '25,000 里 · 全部通关' : '总里程 25,000 里';
    dom.statDistance.textContent = `${distance.toLocaleString('en-US')} 里`;
    dom.statCleared.textContent = `${cleared} / ${levels.length}`;
    dom.statBest.textContent = `${best} / 5`;
    dom.statAttempts.textContent = `${attempts} 次`;

    const ratio = cleared / levels.length;
    dom.sun.style.setProperty('--sun-y', `${-110 * ratio}px`);
    dom.sun.style.setProperty('--sun-opacity', String(0.8 + 0.15 * ratio));
    dom.sun.style.setProperty('--sun-scale', String(0.8 + 0.2 * ratio));
    dom.heroCopy.style.setProperty('--cloud-opacity', String(0.95 - 0.15 * ratio));
    dom.sun.style.setProperty('--sun-blur', `${(1 - ratio) * 0.5}px`);
    if (dom.mist) dom.mist.style.setProperty('--mist-opacity', String(Math.max(0.06, 0.45 - 0.65 * ratio)));
    dom.sun.classList.toggle('is-complete', allCleared);

    dom.startLabel.textContent = allCleared
      ? '重温长征 · 第 1 关'
      : cleared === 0
        ? '开始长征 · 第 1 关'
        : `继续长征 · 第 ${next} 关`;

    dom.milestones.innerHTML = levels.map((level) => {
      const record = progress.levels[level.id];
      const unlocked = level.id <= progress.unlocked;
      const isCleared = Boolean(record?.cleared);
      const isCurrent = unlocked && !isCleared && level.id === next;
      const cls = [
        'milestone',
        unlocked ? '' : 'is-locked',
        isCleared ? 'is-cleared' : '',
        isCurrent ? 'is-current' : ''
      ].filter(Boolean).join(' ');
      const dot = isCleared ? '✓' : isCurrent ? '→' : unlocked ? level.id : '🔒';
      const href = unlocked ? `game.html?level=${level.id}` : '#';

      return `
        <a class="${cls}" href="${href}" data-level="${level.id}" ${unlocked ? '' : 'aria-disabled="true"'}>
          <span class="milestone__dot">${dot}</span>
          <span class="milestone__distance">${level.distanceLabel} 里</span>
          <span class="milestone__name">${LM.escapeHtml(level.name)}</span>
        </a>
      `;
    }).join('');

    const target = allCleared ? 1 : next;
    dom.startLinks.forEach((link) => {
      link.href = `game.html?level=${target}`;
    });
  }

  dom.milestones.addEventListener('click', (event) => {
    const item = event.target.closest('.milestone');
    if (!item) return;
    const levelId = Number(item.dataset.level);
    const progress = LM.readProgress();
    if (levelId > progress.unlocked) {
      event.preventDefault();
      LM.toast(`先通过第 ${levelId - 1} 关，才能解锁这里`);
    }
  });

  render();

  const locked = Number(new URLSearchParams(window.location.search).get('locked'));
  if (Number.isInteger(locked) && locked >= 1 && locked <= levels.length) {
    LM.toast(`第 ${locked} 关尚未解锁，请先完成前面的关卡`);
    try {
      window.history.replaceState({}, '', 'index.html');
    } catch { /* 忽略 */ }
  }
})();
