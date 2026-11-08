/* 关卡战绩页 */
(() => {
  'use strict';

  const LM = window.LM;
  const { levels } = LM;
  const $ = (selector) => document.querySelector(selector);

  const dom = {
    count: $('#records-count'),
    summary: $('#record-summary'),
    list: $('#record-list'),
    reset: $('#btn-reset-progress')
  };

  function render() {
    const progress = LM.readProgress();
    const cleared = LM.clearedCount(progress);
    const totalAttempts = levels.reduce((sum, level) => sum + (progress.levels[level.id]?.attempts || 0), 0);
    const bestValues = levels
      .map((level) => progress.levels[level.id]?.bestCorrect)
      .filter((value) => Number.isFinite(value));
    const maxBest = bestValues.length ? Math.max(...bestValues) : 0;
    const distance = cleared * 5000;

    const summary = [
      { label: '已通关', value: `${cleared}`, suffix: '/ 5' },
      { label: '长征进度', value: distance.toLocaleString('en-US'), suffix: '里' },
      { label: '最佳答对', value: `${maxBest}`, suffix: '/ 5' },
      { label: '总尝试', value: `${totalAttempts}`, suffix: '次' }
    ];

    dom.summary.innerHTML = summary.map((item) => `
      <div class="summary-card">
        <span>${item.label}</span>
        <strong>${item.value}</strong><small>${item.suffix}</small>
      </div>
    `).join('');

    dom.count.textContent = `${cleared} / 5 关`;
    dom.reset.classList.toggle('is-hidden', totalAttempts === 0);

    dom.list.innerHTML = levels.map((level) => {
      const record = progress.levels[level.id];
      const unlocked = level.id <= progress.unlocked;
      const isCleared = Boolean(record?.cleared);
      const stars = record ? LM.starsFor(record.bestCorrect) : 0;
      const badgeClass = !unlocked
        ? 'is-locked'
        : isCleared
          ? 'is-win'
          : record
            ? 'is-lose'
            : 'is-none';
      const badgeText = isCleared ? '✓' : !unlocked ? '🔒' : String(level.id);
      const status = !unlocked ? '未解锁' : isCleared ? '已通关' : record ? '未通关' : '可挑战';
      const detail = record
        ? `最佳 ${record.bestCorrect}/5 题 · 我方 ${record.bestHp} : ${record.bestEnemyHp} 敌方 · ${LM.formatDate(record.bestTs)} · 尝试 ${record.attempts} 次`
        : unlocked
          ? '尚无挑战记录'
          : '通过上一关后解锁';
      const right = record ? LM.starText(stars) : '—';

      return `
        <article class="record-item ${unlocked ? '' : 'is-locked'}">
          <div class="record-badge ${badgeClass}">${badgeText}</div>
          <div class="record-main">
            <div class="record-title">
              <b>第 ${level.id} 关 · ${LM.escapeHtml(level.name)}</b>
              <span>${level.distanceLabel} 里 · ${status}</span>
            </div>
            <p>${detail}</p>
          </div>
          <div class="record-stars">${right}</div>
        </article>
      `;
    }).join('');
  }

  dom.reset.addEventListener('click', () => {
    if (!window.confirm('确定重置长征进度吗？已通关记录和每关最佳成绩都会被清空。')) return;
    LM.writeProgress(LM.defaultProgress());
    render();
    LM.toast('长征进度已重置');
  });

  render();
})();
