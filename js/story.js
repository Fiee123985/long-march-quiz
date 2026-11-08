/* 长征故事 · 地图选点与故事面板 */
(() => {
  'use strict';

  const LM = window.LM;
  const { stories, levels } = LM;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const MAP_POINTS = [
    { id: 'xiangjiang', x: 59.15, y: 77.97, side: 'right', label: '湘江' },
    { id: 'zunyi', x: 55.1, y: 74.1, side: 'right', label: '遵义' },
    { id: 'chishui', x: 51.2, y: 71.4, side: 'left', label: '赤水' },
    { id: 'yihai', x: 46.5, y: 71.2, side: 'left', label: '彝海' },
    { id: 'luding', x: 46.9, y: 67.7, side: 'left', label: '泸定' },
    { id: 'jiajinshan', x: 48.8, y: 65.5, side: 'right', label: '夹金山' },
    { id: 'grassland', x: 50.1, y: 60.8, side: 'right', label: '草地' },
    { id: 'huining', x: 52.0, y: 54.2, side: 'right', label: '会宁' }
  ];

  const dom = {
    mapPoints: $('#story-map-points'),
    places: $('#story-places'),
    panel: $('#story-panel'),
    count: $('#stories-count')
  };

  function levelOf(item) {
    return levels.find((level) => level.id === item.level);
  }

  function shortPlace(item) {
    const point = MAP_POINTS.find((entry) => entry.id === item.id);
    if (point) return point.label;
    return item.place.split('·').pop().split(' / ').pop();
  }

  function renderPoints() {
    dom.mapPoints.innerHTML = MAP_POINTS.map((point, index) => {
      const item = stories.find((story) => story.id === point.id);
      if (!item) return '';
      return `
        <button class="map-point map-point--${point.side}" type="button"
          style="--x:${point.x}%;--y:${point.y}%"
          data-story="${item.id}"
          aria-label="第 ${index + 1} 处：${LM.escapeHtml(item.place)} · ${LM.escapeHtml(item.title)}">
          <span class="map-point__dot">${index + 1}</span>
          <span class="map-point__label">${LM.escapeHtml(shortPlace(item))}</span>
        </button>
      `;
    }).join('');
    dom.places.innerHTML = stories.map((item, index) => `
      <button type="button" data-story="${item.id}" aria-label="第 ${index + 1} 处：${LM.escapeHtml(item.place)}">
        <small>${index + 1}</small>${LM.escapeHtml(shortPlace(item))}
      </button>
    `).join('');
  }

  function renderPanel(item) {
    const index = stories.findIndex((story) => story.id === item.id);
    const level = levelOf(item);
    const previous = stories[(index - 1 + stories.length) % stories.length];
    const next = stories[(index + 1) % stories.length];

    dom.panel.innerHTML = `
      <div class="story-panel__hero">
        <img src="${item.image}" alt="${LM.escapeHtml(item.title)}">
        <div class="story-panel__veil" aria-hidden="true"></div>
        <div class="story-panel__hero-text">
          <span>第 ${level?.id || 1} 关 · ${LM.escapeHtml(level?.name || '长征路')}</span>
          <h2>${LM.escapeHtml(item.title)}</h2>
        </div>
      </div>
      <div class="story-panel__body">
        <div class="story-panel__meta">
          <span>${LM.escapeHtml(item.date)}</span>
          <span>${LM.escapeHtml(item.place)}</span>
          <span>第 ${index + 1} / ${stories.length} 处</span>
        </div>
        <p class="story-panel__lead">${LM.escapeHtml(item.summary)}</p>
        ${item.paragraphs.map((paragraph) => `<p>${LM.escapeHtml(paragraph)}</p>`).join('')}
        <nav class="story-panel__pager" aria-label="故事翻页">
          <button type="button" data-goto="${previous.id}">
            <small>上一处</small>
            <b>${LM.escapeHtml(previous.title)}</b>
          </button>
          <button type="button" data-goto="${next.id}">
            <small>下一处</small>
            <b>${LM.escapeHtml(next.title)}</b>
          </button>
        </nav>
        <p class="story-panel__credit">配图：Wikimedia Commons · 地点实景 / 资料图</p>
      </div>
    `;
  }

  function selectStory(id, options = {}) {
    const item = stories.find((story) => story.id === id) || stories[0];
    if (!item) return;

    renderPanel(item);
    $$('.map-point').forEach((point) => {
      const active = point.dataset.story === item.id;
      point.classList.toggle('is-active', active);
      point.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    $$('.story-places button').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.story === item.id);
    });

    document.title = `${item.title} · 长征故事地图`;
    dom.count.textContent = `${stories.length} 个地点`;

    if (options.updateUrl !== false) {
      const url = new URL(window.location.href);
      url.searchParams.set('id', item.id);
      try {
        window.history.replaceState({}, '', url);
      } catch { /* 忽略 */ }
    }

    if (options.scroll && window.matchMedia('(max-width: 980px)').matches) {
      dom.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  renderPoints();

  dom.mapPoints.addEventListener('click', (event) => {
    const point = event.target.closest('.map-point');
    if (!point) return;
    selectStory(point.dataset.story, { scroll: true });
  });

  dom.places.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-story]');
    if (!button) return;
    selectStory(button.dataset.story, { scroll: true });
  });

  dom.panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-goto]');
    if (!button) return;
    selectStory(button.dataset.goto, { scroll: true });
  });

  const initialId = new URLSearchParams(window.location.search).get('id');
  selectStory(initialId || stories[0]?.id, { updateUrl: false });
})();
