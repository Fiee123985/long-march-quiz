/* 闯关页：单关 5 题、50 血对战、结算与敬礼动画 */
(() => {
  'use strict';

  const LM = window.LM;
  const {
    levels,
    questions,
    MAX_HP,
    DAMAGE,
    QUESTIONS_PER_LEVEL,
    ROUND_TIME,
    REVEAL_MS,
    LETTERS,
    MC_KEYS,
    TF_KEYS
  } = LM;

  const params = new URLSearchParams(window.location.search);
  const requestedLevel = Number(params.get('level'));
  const level = levels.find((item) => item.id === requestedLevel);
  const progress = LM.readProgress();
  const BATTLE_BACKGROUND = 'assets/battle-sunrise.svg';

  if (!level) {
    window.location.replace('index.html');
    return;
  }
  if (level.id > progress.unlocked) {
    window.location.replace(`index.html?locked=${level.id}`);
    return;
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const dom = {
    battleView: $('#battle-view'),
    resultView: $('#result-view'),
    battleBgImg: $('#battle-bg-img'),
    sceneLabel: $('#scene-label'),
    levelLabel: $('#level-label'),
    roundDots: $('#round-dots'),
    roundTag: $('#round-tag'),
    timer: $('#timer'),
    timerBar: $('#timer-bar'),
    timerNum: $('#timer-num'),

    hud: [$('#hud-p1'), $('#hud-p2')],
    name: [$('#name-p1'), $('#name-p2')],
    status: [$('#status-p1'), $('#status-p2')],
    hpFill: [$('#hp-fill-p1'), $('#hp-fill-p2')],
    hpNum: [$('#hp-num-p1'), $('#hp-num-p2')],

    questionCard: $('#question-card'),
    qChip: $('#q-chip'),
    qStage: $('#q-stage'),
    qIndex: $('#q-index'),
    qText: $('#q-text'),
    optionList: $('#option-list'),
    feedback: $('#feedback'),
    fxLayer: $('#fx-layer'),

    resultCard: $('#result-card'),
    resultEmoji: $('#result-emoji'),
    resultKicker: $('#result-kicker'),
    resultTitle: $('#result-title'),
    resultSub: $('#result-sub'),
    bestBanner: $('#best-banner'),
    finalName: [$('#final-name-1'), $('#final-name-2')],
    finalHp: [$('#final-hp-1'), $('#final-hp-2')],
    statTable: $('#stat-table'),
    btnNext: $('#btn-next'),
    btnMenu: $('#btn-menu'),
    resultSaved: $('#result-saved'),
    resultBgImg: $('#result-bg-img'),

    saluteOverlay: $('#salute-overlay'),
    saluteFigure: $('#salute-figure'),
    saluteKicker: $('#salute-kicker'),
    saluteTitle: $('#salute-title'),
    saluteSub: $('#salute-sub'),
    saluteClose: $('#salute-close'),
    btnSaluteReplay: $('#btn-salute-replay'),

    confetti: $('#confetti')
  };

  const state = {
    phase: 'idle',
    rounds: [],
    roundIndex: 0,
    playerHp: MAX_HP,
    enemyHp: MAX_HP,
    correct: 0,
    answer: null,
    answerTime: null,
    startTime: 0,
    roundStart: 0,
    deadline: 0,
    timerId: null,
    revealTimer: null,
    lastTickSecond: null,
    result: null,
    saluteTimer: null,
    hiddenAt: 0
  };

  let confettiParticles = [];
  let confettiRaf = null;
  let confettiLast = 0;

  // ── 关卡初始化 ─────────────────────────────────────────
  function makeRounds() {
    const pool = questions.filter((question) => question.level === level.id);
    const picked = LM.shuffle(pool).slice(0, QUESTIONS_PER_LEVEL).sort((a, b) => a.order - b.order);
    const types = picked.map(() => (Math.random() < 0.5 ? 'mc' : 'tf'));
    if (!types.includes('mc')) types[0] = 'mc';
    if (!types.includes('tf')) types[1] = 'tf';

    return picked.map((question, index) => {
      const type = types[index];
      if (type === 'tf') {
        return {
          q: question,
          type,
          prompt: question.tf.statement,
          options: ['正确', '错误'],
          answer: question.tf.answer ? 0 : 1
        };
      }
      return {
        q: question,
        type,
        prompt: question.mc.q,
        options: question.mc.options,
        answer: question.mc.answer
      };
    });
  }

  function start() {
    state.rounds = makeRounds();
    state.roundIndex = 0;
    state.playerHp = MAX_HP;
    state.enemyHp = MAX_HP;
    state.correct = 0;
    state.startTime = performance.now();
    state.phase = 'idle';

    document.title = `第 ${level.id} 关 · ${level.name} · 长征问答`;
    dom.battleBgImg.src = BATTLE_BACKGROUND;
    dom.sceneLabel.textContent = `长征路 · ${level.sceneName}`;
    dom.levelLabel.textContent = `第 ${level.id} 关 · ${level.distanceLabel} 里 · ${level.name}`;
    dom.name[0].textContent = '红军 · 星火';
    dom.name[1].textContent = level.enemy;
    setStatus(0, '准备作答', false);
    setStatus(1, '据险阻击', false);
    dom.resultBgImg.src = BATTLE_BACKGROUND;
    dom.resultCard.className = 'result-card';
    dom.optionList.innerHTML = '';
    dom.feedback.innerHTML = '';
    dom.fxLayer.innerHTML = '';
    updateHUD();
    showView('battle');
    nextQuestion();
  }

  function showView(name) {
    const result = name === 'result';
    dom.battleView.classList.toggle('is-active', !result);
    dom.resultView.classList.toggle('is-active', result);
    if (result) {
      dom.resultView.scrollTop = 0;
      dom.resultCard.scrollTop = 0;
    }
  }

  // ── 题目 ───────────────────────────────────────────────
  function nextQuestion() {
    if (state.phase === 'over') return;
    const current = state.rounds[state.roundIndex];
    if (!current) {
      endLevel(state.playerHp > state.enemyHp, 'complete');
      return;
    }

    state.phase = 'answering';
    state.answer = null;
    state.answerTime = null;
    state.roundStart = performance.now();
    state.deadline = state.roundStart + ROUND_TIME * 1000;
    state.lastTickSecond = null;

    renderQuestion(current);
    updateHUD();
    startTimer();
  }

  function renderQuestion(current) {
    const isTF = current.type === 'tf';
    const color = isTF ? '#ffd166' : '#4cc9f0';

    dom.qChip.textContent = isTF ? '判断题' : '选择题';
    dom.qChip.style.color = color;
    dom.qChip.style.borderColor = LM.hexAlpha(color, 0.35);
    dom.qChip.style.background = LM.hexAlpha(color, 0.12);
    dom.qStage.textContent = current.q.stage || level.sceneName;
    dom.qIndex.textContent = `第 ${state.roundIndex + 1} / ${state.rounds.length} 题`;
    dom.roundTag.textContent = `第 ${state.roundIndex + 1} / ${state.rounds.length} 题`;
    dom.qText.textContent = current.prompt;

    dom.optionList.className = `options${isTF ? ' options--tf' : ''}`;
    dom.optionList.innerHTML = current.options.map((text, index) => {
      const key = isTF ? TF_KEYS[index] : MC_KEYS[index];
      const badge = isTF ? (index === 0 ? '✓' : '✗') : LETTERS[index];
      return `
        <button class="option" type="button" data-index="${index}">
          <span class="badge">${badge}</span>
          <span class="label">${LM.escapeHtml(text)}</span>
          <span class="key">${key}</span>
        </button>
      `;
    }).join('');

    $$('.option').forEach((button) => {
      button.addEventListener('click', () => resolveAnswer(Number(button.dataset.index), false));
    });

    dom.questionCard.classList.remove('is-enter');
    void dom.questionCard.offsetWidth;
    dom.questionCard.classList.add('is-enter');

    dom.feedback.innerHTML = isTF
      ? '<span>判断正误 · A 正确 / S 错误 · 答对伤敌 10 血</span>'
      : '<span>选择答案 · 答对伤敌 10 血 · 答错自损 10 血</span>';

    setStatus(0, '准备作答', false);
    setStatus(1, '据险阻击', false);
    resetTimerUI();
    renderRoundDots();
  }

  function renderRoundDots() {
    dom.roundDots.innerHTML = Array.from({ length: state.rounds.length }, (_, index) => {
      const cls = index < state.roundIndex ? 'is-done' : index === state.roundIndex ? 'is-active' : '';
      return `<span class="round-dot ${cls}"></span>`;
    }).join('');
  }

  function setStatus(index, text, thinking = false) {
    dom.status[index].textContent = text;
    dom.status[index].classList.toggle('is-thinking', Boolean(thinking));
  }

  function updateHUD() {
    [state.playerHp, state.enemyHp].forEach((hp, index) => {
      const ratio = LM.clamp(hp / MAX_HP, 0, 1);
      dom.hpFill[index].style.width = `${ratio * 100}%`;
      dom.hpFill[index].classList.toggle('is-low', hp <= 15);
      dom.hpNum[index].textContent = String(hp);
    });
  }

  // ── 计时 ───────────────────────────────────────────────
  function resetTimerUI() {
    dom.timer.classList.remove('is-low');
    dom.timerBar.style.strokeDashoffset = '0';
    dom.timerNum.textContent = String(ROUND_TIME);
  }

  function startTimer() {
    window.clearInterval(state.timerId);
    state.timerId = window.setInterval(tickTimer, 80);
    tickTimer();
  }

  function tickTimer() {
    if (state.phase !== 'answering') return;
    const remaining = Math.max(0, (state.deadline - performance.now()) / 1000);
    updateTimer(remaining);

    const second = Math.ceil(remaining);
    if (second !== state.lastTickSecond) {
      state.lastTickSecond = second;
      if (second > 0 && second <= 3) LM.sfx.tick();
    }

    if (remaining <= 0) resolveAnswer(null, true);
  }

  function updateTimer(remaining) {
    const circumference = 213.63;
    const fraction = LM.clamp(remaining / ROUND_TIME, 0, 1);
    dom.timerBar.style.strokeDashoffset = String(circumference * (1 - fraction));
    dom.timerNum.textContent = String(Math.ceil(remaining));
    dom.timer.classList.toggle('is-low', remaining <= 3.2);
  }

  // ── 作答 ───────────────────────────────────────────────
  function resolveAnswer(choice, timedOut) {
    if (state.phase !== 'answering') return;
    const current = state.rounds[state.roundIndex];
    if (!current) return;

    state.phase = 'reveal';
    window.clearInterval(state.timerId);
    state.timerId = null;
    state.answer = choice;
    state.answerTime = timedOut ? null : Math.max(0.2, (performance.now() - state.roundStart) / 1000);

    const correct = !timedOut && choice === current.answer;
    let hitTarget = null;

    if (correct) {
      state.correct += 1;
      state.enemyHp = Math.max(0, state.enemyHp - DAMAGE);
      hitTarget = 1;
      LM.sfx.correct();
      setStatus(0, '答对 · 敌方 -10', false);
      setStatus(1, '受创 · -10', false);
      dom.feedback.innerHTML = `<span class="good">答对！${LM.escapeHtml(level.enemy)} -10 血</span>`;
    } else {
      state.playerHp = Math.max(0, state.playerHp - DAMAGE);
      hitTarget = 0;
      LM.sfx.wrong();
      setStatus(0, `${timedOut ? '超时' : '答错'} · 我方 -10`, false);
      setStatus(1, '据险阻击', false);
      dom.feedback.innerHTML = `<span class="bad">${timedOut ? '超时' : '答错'}！我方 -10 血</span>`;
    }

    revealAnswer(current);
    updateHUD();

    const remaining = Math.max(0, (state.deadline - performance.now()) / 1000);
    updateTimer(remaining);

    if (hitTarget !== null) {
      window.setTimeout(() => {
        if (state.phase !== 'reveal') return;
        const card = dom.hud[hitTarget];
        card.classList.remove('is-hit');
        void card.offsetWidth;
        card.classList.add('is-hit');
        spawnDamage(hitTarget, DAMAGE);
        window.setTimeout(() => card.classList.remove('is-hit'), 500);
      }, 60);
    }

    state.revealTimer = window.setTimeout(() => {
      if (state.phase !== 'reveal') return;
      if (state.playerHp <= 0) {
        endLevel(false, 'wipe');
        return;
      }
      if (state.roundIndex >= state.rounds.length - 1) {
        endLevel(state.playerHp > state.enemyHp, 'complete');
        return;
      }
      state.roundIndex += 1;
      nextQuestion();
    }, REVEAL_MS);
  }

  function revealAnswer(current) {
    $$('.option').forEach((button, index) => {
      button.disabled = true;
      button.classList.remove('is-picked');
      if (index === current.answer) {
        button.classList.add('is-correct');
      } else if (state.answer !== null && index === state.answer) {
        button.classList.add('is-wrong');
      } else {
        button.classList.add('is-muted');
      }
    });
  }

  function spawnDamage(targetIndex, amount) {
    const card = dom.hud[targetIndex];
    const rect = card.getBoundingClientRect();
    const element = document.createElement('div');
    element.className = 'damage-pop';
    element.textContent = `-${amount}`;
    element.style.left = `${rect.left + rect.width / 2}px`;
    element.style.top = `${rect.top + rect.height / 2}px`;
    dom.fxLayer.appendChild(element);
    window.setTimeout(() => element.remove(), 1050);
  }

  // ── 结束 / 结算 ────────────────────────────────────────
  function endLevel(win, reason) {
    if (state.phase === 'over') return;
    state.phase = 'over';
    window.clearInterval(state.timerId);
    window.clearTimeout(state.revealTimer);
    state.timerId = null;
    state.revealTimer = null;

    const duration = Math.round((performance.now() - state.startTime) / 1000);
    const saved = LM.saveAttempt(level.id, {
      correct: state.correct,
      playerHp: state.playerHp,
      enemyHp: state.enemyHp,
      duration,
      win
    });

    state.result = {
      win,
      reason,
      correct: state.correct,
      playerHp: state.playerHp,
      enemyHp: state.enemyHp,
      duration,
      saved
    };

    renderResult(win, reason, saved, duration);
    showView('result');
    window.scrollTo(0, 0);

    if (win) {
      LM.sfx.win();
      window.setTimeout(burstConfetti, 260);
      window.setTimeout(() => {
        if (state.phase === 'over') showSalute(level.id === levels.length);
      }, 430);
    } else {
      LM.sfx.lose();
    }
  }

  function renderResult(win, reason, saved, duration) {
    const finalWin = win && level.id === levels.length;
    const stars = LM.starsFor(state.correct);
    const best = saved.best;

    dom.resultCard.className = `result-card ${win ? 'is-win' : 'is-lose'}${finalWin ? ' is-final' : ''}`;
    dom.resultEmoji.textContent = finalWin ? '🎖️' : win ? '🏆' : '💥';
    dom.resultKicker.textContent = finalWin
      ? '全部关卡完成 · 长征胜利'
      : `第 ${level.id} 关 · ${win ? '关卡通过' : '闯关失败'}`;
    dom.resultTitle.textContent = finalWin ? '胜利会师' : win ? '关卡通过' : '闯关失败';
    dom.resultSub.textContent = finalWin
      ? '二十五千里长征路，三军会师，胜利完成！'
      : win
        ? `我方 ${state.playerHp} : ${state.enemyHp} 敌方，成功突围`
        : reason === 'wipe'
          ? '队伍失去战斗力，调整策略再战'
          : `我方 ${state.playerHp} : ${state.enemyHp} 敌方，未能压过敌方`;

    dom.finalName[0].textContent = '红军 · 星火';
    dom.finalName[1].textContent = level.enemy;
    dom.finalHp[0].textContent = String(state.playerHp);
    dom.finalHp[1].textContent = String(state.enemyHp);
    dom.resultBgImg.src = BATTLE_BACKGROUND;

    if (saved.newBest) {
      dom.bestBanner.textContent = !win
        ? '📝 本关最佳成绩已更新'
        : saved.attempts > 1
          ? '🎉 刷新本关最佳纪录'
          : '✅ 已记录本关最佳成绩';
      dom.bestBanner.classList.remove('is-hidden');
    } else {
      dom.bestBanner.classList.add('is-hidden');
    }

    const rows = [
      ['答对题数', `${state.correct} / ${state.rounds.length}`],
      ['本关最佳', `${best.bestCorrect} / 5`],
      ['用时', LM.formatDuration(duration)],
      ['星级', LM.starText(stars)]
    ];

    dom.statTable.innerHTML = `
      <div class="stat-row"><span>本关数据</span><b>结果</b></div>
      ${rows.map(([label, value]) => `<div class="stat-row"><span>${label}</span><b>${value}</b></div>`).join('')}
    `;

    dom.btnNext.textContent = win
      ? finalWin
        ? '重温第 1 关'
        : `前往第 ${level.id + 1} 关`
      : '返回主页面';
    dom.btnMenu.textContent = win ? '返回关卡地图' : '再试一次';

    dom.resultSaved.textContent = win
      ? finalWin
        ? '五关全通，长征胜利！'
        : `第 ${level.id} 关已通关，第 ${level.id + 1} 关已解锁`
      : '本关最佳成绩已保存，可再次挑战';

    dom.btnSaluteReplay.classList.toggle('is-hidden', !win);

    dom.resultCard.style.animation = 'none';
    void dom.resultCard.offsetWidth;
    dom.resultCard.style.animation = '';
  }

  // ── 敬礼动画 ───────────────────────────────────────────
  function showSalute(finalWin = false) {
    window.clearTimeout(state.saluteTimer);
    dom.saluteKicker.textContent = finalWin
      ? 'LONG MARCH COMPLETE · 长征问答'
      : 'LEVEL CLEARED · 长征问答';
    dom.saluteTitle.textContent = finalWin ? '长征胜利' : '关卡通过';
    dom.saluteSub.textContent = finalWin
      ? '二十五千里，胜利会师 · 向英雄致敬'
      : `第 ${level.id} 关 · ${level.name} 完成 · 向英雄致敬`;

    dom.saluteFigure.src = `assets/salute.svg?t=${Date.now()}`;
    dom.saluteOverlay.classList.remove('is-hidden');
    dom.saluteOverlay.classList.remove('is-show');
    void dom.saluteOverlay.offsetWidth;
    dom.saluteOverlay.classList.add('is-show');
    dom.saluteOverlay.setAttribute('aria-hidden', 'false');

    LM.sfx.salute();
    window.setTimeout(() => {
      try { dom.saluteClose.focus({ preventScroll: true }); } catch { /* 忽略 */ }
    }, 420);

    state.saluteTimer = window.setTimeout(hideSalute, 5600);
  }

  function hideSalute() {
    window.clearTimeout(state.saluteTimer);
    state.saluteTimer = null;
    dom.saluteOverlay.classList.remove('is-show');
    dom.saluteOverlay.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      if (!dom.saluteOverlay.classList.contains('is-show')) {
        dom.saluteOverlay.classList.add('is-hidden');
      }
    }, 360);
  }

  // ── 彩带 ───────────────────────────────────────────────
  function resizeConfetti() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dom.confetti.width = Math.floor(window.innerWidth * dpr);
    dom.confetti.height = Math.floor(window.innerHeight * dpr);
    dom.confetti.style.width = `${window.innerWidth}px`;
    dom.confetti.style.height = `${window.innerHeight}px`;
    const ctx = dom.confetti.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burstConfetti() {
    resizeConfetti();
    dom.confetti.classList.add('is-on');
    const colors = ['#42d9ff', '#ff5c93', '#ffd166', '#3ee6a4', '#7ba7ff', '#ffffff'];
    confettiParticles = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -30 - Math.random() * window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 160,
      vy: 90 + Math.random() * 190,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 9,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    }));

    window.cancelAnimationFrame(confettiRaf);
    confettiLast = performance.now();
    confettiRaf = window.requestAnimationFrame(stepConfetti);
  }

  function stepConfetti(now) {
    const dt = Math.min(0.04, (now - confettiLast) / 1000);
    confettiLast = now;
    const ctx = dom.confetti.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    let alive = false;
    confettiParticles.forEach((particle) => {
      particle.vy += 260 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rot += particle.vr * dt;
      particle.life -= dt * 0.2;
      if (particle.y < height + 50 && particle.life > 0) alive = true;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rot);
      ctx.globalAlpha = LM.clamp(particle.life, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
      ctx.restore();
    });

    if (alive) {
      confettiRaf = window.requestAnimationFrame(stepConfetti);
    } else {
      dom.confetti.classList.remove('is-on');
      ctx.clearRect(0, 0, width, height);
    }
  }

  // ── 事件 ───────────────────────────────────────────────
  dom.btnNext.addEventListener('click', () => {
    if (!state.result) return;
    if (!state.result.win) {
      window.location.href = 'index.html';
      return;
    }
    window.location.href = level.id === levels.length
      ? 'game.html?level=1'
      : `game.html?level=${level.id + 1}`;
  });

  dom.btnMenu.addEventListener('click', () => {
    if (state.result && !state.result.win) {
      window.location.href = `game.html?level=${level.id}`;
      return;
    }
    window.location.href = 'index.html';
  });

  dom.btnSaluteReplay.addEventListener('click', () => {
    showSalute(level.id === levels.length);
  });
  dom.saluteClose.addEventListener('click', hideSalute);
  dom.saluteOverlay.addEventListener('click', (event) => {
    if (event.target === dom.saluteOverlay) hideSalute();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dom.saluteOverlay.classList.contains('is-show')) {
      hideSalute();
      return;
    }
    if (state.phase !== 'answering') return;

    const current = state.rounds[state.roundIndex];
    if (!current) return;
    const key = event.key.toLowerCase();
    const isTF = current.type === 'tf';
    const keys = isTF ? ['a', 's'] : ['a', 's', 'd', 'f'];
    const index = keys.indexOf(key);

    if (index >= 0) {
      event.preventDefault();
      resolveAnswer(index, false);
      return;
    }

    if (['1', '2', '3', '4'].includes(key)) {
      const numericIndex = Number(key) - 1;
      if (numericIndex < current.options.length) {
        event.preventDefault();
        resolveAnswer(numericIndex, false);
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state.hiddenAt = performance.now();
    } else if (state.hiddenAt && state.phase === 'answering') {
      const delta = performance.now() - state.hiddenAt;
      state.deadline += delta;
      state.roundStart += delta;
      state.hiddenAt = 0;
    }
  });

  window.addEventListener('resize', () => {
    if (dom.confetti.classList.contains('is-on')) resizeConfetti();
  });

  start();
})();
