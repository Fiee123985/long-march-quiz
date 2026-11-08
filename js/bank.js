/* 题库页 */
(() => {
  'use strict';

  const LM = window.LM;
  const { levels, questions, LETTERS } = LM;
  const $ = (selector) => document.querySelector(selector);

  const dom = {
    count: $('#bank-count'),
    search: $('#bank-search'),
    cats: $('#bank-cats'),
    list: $('#bank-list'),
    empty: $('#bank-empty')
  };

  const state = { level: 'all', query: '' };

  function buildChips() {
    dom.cats.innerHTML = [
      `<button type="button" data-level="all">全部<em>${questions.length}</em></button>`,
      ...levels.map((level) => {
        const count = questions.filter((question) => question.level === level.id).length;
        return `<button type="button" data-level="${level.id}">第${level.id}关<em>${count}</em></button>`;
      })
    ].join('');
  }

  function render() {
    const query = state.query.trim().toLowerCase();
    const filtered = questions.filter((question) => {
      if (state.level !== 'all' && question.level !== state.level) return false;
      if (!query) return true;
      const level = levels.find((item) => item.id === question.level);
      return question.mc.q.toLowerCase().includes(query)
        || question.mc.options.some((option) => option.toLowerCase().includes(query))
        || question.tf.statement.toLowerCase().includes(query)
        || question.stage.toLowerCase().includes(query)
        || (level ? level.name.toLowerCase().includes(query) : false);
    });

    dom.count.textContent = filtered.length === questions.length
      ? `${filtered.length} 题`
      : `${filtered.length} / ${questions.length} 题`;

    dom.list.innerHTML = filtered.map((question) => {
      const level = levels.find((item) => item.id === question.level);
      const index = questions.indexOf(question) + 1;
      const options = question.mc.options.map((option, optionIndex) => `
        <div class="bank-opt ${optionIndex === question.mc.answer ? 'is-answer' : ''}">
          <span>${LETTERS[optionIndex]}</span>
          <p>${LM.escapeHtml(option)}</p>
          ${optionIndex === question.mc.answer ? '<em>正确</em>' : ''}
        </div>
      `).join('');

      return `
        <article class="bank-card">
          <div class="bank-top">
            <span class="chip bank-level">第 ${level?.id} 关 · ${LM.escapeHtml(level?.name || '')}</span>
            <span class="bank-idx">NO. ${String(index).padStart(2, '0')}</span>
          </div>
          <h3><span class="bank-qtype">选择</span>${LM.escapeHtml(question.mc.q)}</h3>
          <div class="bank-options">${options}</div>
          <div class="bank-tf">
            <span class="tf-badge">判断</span>
            <p>${LM.escapeHtml(question.tf.statement)}</p>
            <em class="${question.tf.answer ? '' : 'is-false'}">${question.tf.answer ? '正确' : '错误'}</em>
          </div>
        </article>
      `;
    }).join('');

    dom.empty.classList.toggle('is-hidden', filtered.length > 0);
    dom.list.classList.toggle('is-hidden', filtered.length === 0);

    dom.cats.querySelectorAll('button[data-level]').forEach((button) => {
      button.classList.toggle('is-active', String(button.dataset.level) === String(state.level));
    });
  }

  dom.cats.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-level]');
    if (!button) return;
    state.level = button.dataset.level === 'all' ? 'all' : Number(button.dataset.level);
    render();
  });

  dom.search.addEventListener('input', () => {
    state.query = dom.search.value;
    render();
  });

  buildChips();
  render();
})();
