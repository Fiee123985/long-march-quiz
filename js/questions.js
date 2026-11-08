/* 长征闯关题库
 * 五关 × 每关 6 题（每关随机抽 5 题，并按 order 还原历史顺序）
 * 每题同时提供选择题（mc）与判断题（tf）两种问法
 */
window.QUIZ_DATA = {
  levels: [
    {
      id: 1,
      distance: 5000,
      distanceLabel: '5,000',
      name: '突破封锁线',
      date: '1934.10 — 1934.12',
      scene: 'assets/scene-xiangjiang.svg',
      sceneName: '血战湘江',
      enemy: '湘江追兵',
      desc: '突破四道封锁线，血战湘江。',
      accent: '#ff7a59'
    },
    {
      id: 2,
      distance: 10000,
      distanceLabel: '10,000',
      name: '遵义与赤水',
      date: '1935.01 — 1935.05',
      scene: 'assets/scene-grass.svg',
      sceneName: '赤水河畔',
      enemy: '赤水追兵',
      desc: '遵义会议，四渡赤水，巧渡金沙江。',
      accent: '#ffb454'
    },
    {
      id: 3,
      distance: 15000,
      distanceLabel: '15,000',
      name: '大渡桥横',
      date: '1935.05 — 1935.06',
      scene: 'assets/scene-bridge.svg',
      sceneName: '飞夺泸定桥',
      enemy: '大渡河追兵',
      desc: '强渡大渡河，飞夺泸定桥。',
      accent: '#4cc9f0'
    },
    {
      id: 4,
      distance: 20000,
      distanceLabel: '20,000',
      name: '雪山草地',
      date: '1935.08 — 1935.11',
      scene: 'assets/scene-snow.svg',
      sceneName: '雪山草地',
      enemy: '雪山追兵',
      desc: '翻雪山，过草地，突破腊子口。',
      accent: '#a9c7ff'
    },
    {
      id: 5,
      distance: 25000,
      distanceLabel: '25,000',
      name: '胜利会师',
      date: '1935.12 — 1936.10',
      scene: 'assets/scene-loess.svg',
      sceneName: '会师陕北',
      enemy: '尾随追兵',
      desc: '吴起镇落脚，三大主力会师。',
      accent: '#ffd166'
    }
  ],

  questions: [
    // ══════════ 第一关：突破封锁线 ══════════
    {
      id: 'L1-01', level: 1, order: 10, stage: '出发',
      mc: {
        q: '中央红军长征的主要出发地是？',
        options: ['江西瑞金', '陕西延安', '贵州遵义', '甘肃会宁'],
        answer: 0
      },
      tf: { statement: '中央红军长征的主要出发地是江西瑞金。', answer: true }
    },
    {
      id: 'L1-02', level: 1, order: 12, stage: '出发',
      mc: {
        q: '中央红军开始长征是在哪一年？',
        options: ['1933 年', '1934 年', '1935 年', '1936 年'],
        answer: 1
      },
      tf: { statement: '中央红军于 1934 年 10 月开始长征。', answer: true }
    },
    {
      id: 'L1-03', level: 1, order: 20, stage: '湘江',
      mc: {
        q: '红军长征初期突破的第四道封锁线位于哪条江？',
        options: ['湘江', '乌江', '赤水河', '大渡河'],
        answer: 0
      },
      tf: { statement: '红军长征初期突破的第四道封锁线位于乌江。', answer: false }
    },
    {
      id: 'L1-04', level: 1, order: 22, stage: '湘江',
      mc: {
        q: '湘江战役后，中央红军人数由出发时的 8.6 万余人锐减至约？',
        options: ['3 万余人', '5 万余人', '7 万余人', '1 万余人'],
        answer: 0
      },
      tf: { statement: '湘江战役使中央红军由 8.6 万余人锐减至 3 万余人。', answer: true }
    },
    {
      id: 'L1-05', level: 1, order: 30, stage: '转兵',
      mc: {
        q: '长征途中，中央红军改向贵州进军的重要会议是？',
        options: ['黎平会议', '遵义会议', '两河口会议', '瓦窑堡会议'],
        answer: 0
      },
      tf: { statement: '黎平会议决定中央红军改向贵州进军。', answer: true }
    },
    {
      id: 'L1-06', level: 1, order: 15, stage: '突围',
      mc: {
        q: '下列哪一项发生在中央红军长征初期？',
        options: ['突破四道封锁线', '飞夺泸定桥', '翻越夹金山', '会宁会师'],
        answer: 0
      },
      tf: { statement: '飞夺泸定桥发生在中央红军长征初期。', answer: false }
    },

    // ══════════ 第二关：遵义与赤水 ══════════
    {
      id: 'L2-01', level: 2, order: 10, stage: '遵义',
      mc: {
        q: '遵义会议召开于哪一年？',
        options: ['1934 年', '1935 年', '1936 年', '1937 年'],
        answer: 1
      },
      tf: { statement: '遵义会议召开于 1934 年 1 月。', answer: false }
    },
    {
      id: 'L2-02', level: 2, order: 12, stage: '遵义',
      mc: {
        q: '遵义会议被视为中国共产党历史上一个生死攸关的转折点，主要是因为？',
        options: ['确立毛泽东在党中央和红军的领导地位', '宣布长征结束', '决定建立陕北根据地', '成立中华苏维埃共和国'],
        answer: 0
      },
      tf: { statement: '遵义会议确立了毛泽东在党中央和红军的领导地位。', answer: true }
    },
    {
      id: 'L2-03', level: 2, order: 20, stage: '赤水',
      mc: {
        q: '四渡赤水战役发生在哪一年？',
        options: ['1933 年', '1934 年', '1935 年', '1936 年'],
        answer: 2
      },
      tf: { statement: '四渡赤水战役发生在 1935 年。', answer: true }
    },
    {
      id: 'L2-04', level: 2, order: 22, stage: '赤水',
      mc: {
        q: '四渡赤水战役主要在今天的哪些省份交界地区进行？',
        options: ['川黔滇', '湘鄂赣', '陕甘宁', '闽粤赣'],
        answer: 0
      },
      tf: { statement: '四渡赤水战役主要在湘鄂赣交界地区进行。', answer: false }
    },
    {
      id: 'L2-05', level: 2, order: 30, stage: '金沙江',
      mc: {
        q: '红军巧渡金沙江的主要意义是？',
        options: ['跳出敌人包围圈', '与红四方面军会师', '攻占遵义', '翻越雪山'],
        answer: 0
      },
      tf: { statement: '巧渡金沙江使红军跳出了敌人的包围圈。', answer: true }
    },
    {
      id: 'L2-06', level: 2, order: 40, stage: '彝海',
      mc: {
        q: '长征途中，刘伯承与彝族首领小叶丹歃血为盟的地点是？',
        options: ['彝海', '泸定桥', '夹金山', '会宁'],
        answer: 0
      },
      tf: { statement: '刘伯承与彝族首领小叶丹在彝海歃血为盟。', answer: true }
    },

    // ══════════ 第三关：大渡桥横 ══════════
    {
      id: 'L3-01', level: 3, order: 10, stage: '大渡河',
      mc: {
        q: '红军飞夺泸定桥发生在哪条河上？',
        options: ['金沙江', '大渡河', '乌江', '赤水河'],
        answer: 1
      },
      tf: { statement: '飞夺泸定桥发生在金沙江上。', answer: false }
    },
    {
      id: 'L3-02', level: 3, order: 12, stage: '泸定桥',
      mc: {
        q: '飞夺泸定桥时，红军突击队冒着火力攀爬的是什么？',
        options: ['铁索', '竹筏', '云梯', '浮桥'],
        answer: 0
      },
      tf: { statement: '飞夺泸定桥时，红军突击队攀爬铁索夺取桥头。', answer: true }
    },
    {
      id: 'L3-03', level: 3, order: 20, stage: '雪山',
      mc: {
        q: '中央红军长征途中翻越的第一座大雪山是？',
        options: ['夹金山', '六盘山', '岷山', '祁连山'],
        answer: 0
      },
      tf: { statement: '夹金山是中央红军长征途中翻越的第一座大雪山。', answer: true }
    },
    {
      id: 'L3-04', level: 3, order: 30, stage: '会师',
      mc: {
        q: '1935 年 6 月，中央红军与红四方面军会师的地点是？',
        options: ['懋功', '会宁', '吴起镇', '遵义'],
        answer: 0
      },
      tf: { statement: '1935 年 6 月，红一、红四方面军在懋功会师。', answer: true }
    },
    {
      id: 'L3-05', level: 3, order: 32, stage: '北上',
      mc: {
        q: '两河口会议确定红军继续北上的方针，这次会议召开于？',
        options: ['1935 年 6 月', '1935 年 1 月', '1936 年 10 月', '1934 年 10 月'],
        answer: 0
      },
      tf: { statement: '两河口会议确定红军继续南下的方针。', answer: false }
    },
    {
      id: 'L3-06', level: 3, order: 5, stage: '大渡河',
      mc: {
        q: '红军强渡大渡河的主要渡口是？',
        options: ['安顺场', '泸定桥', '太平渡', '皎平渡'],
        answer: 0
      },
      tf: { statement: '红军强渡大渡河的主要渡口是安顺场。', answer: true }
    },

    // ══════════ 第四关：雪山草地 ══════════
    {
      id: 'L4-01', level: 4, order: 10, stage: '草地',
      mc: {
        q: '红军长征经过的“草地”主要位于今天的？',
        options: ['四川西北部', '云南南部', '甘肃东部', '陕西中部'],
        answer: 0
      },
      tf: { statement: '红军长征经过的草地主要位于四川西北部。', answer: true }
    },
    {
      id: 'L4-02', level: 4, order: 12, stage: '草地',
      mc: {
        q: '红军过草地时面临的主要困难不包括？',
        options: ['沼泽密布', '粮食短缺', '气候寒冷', '水源充足'],
        answer: 3
      },
      tf: { statement: '红军过草地时面临沼泽密布、粮食短缺和气候寒冷等困难。', answer: true }
    },
    {
      id: 'L4-03', level: 4, order: 20, stage: '腊子口',
      mc: {
        q: '红军长征中突破腊子口天险，打开了北上通道。腊子口位于今天的？',
        options: ['甘肃', '四川', '陕西', '贵州'],
        answer: 0
      },
      tf: { statement: '腊子口位于甘肃，是红军北上的重要通道。', answer: true }
    },
    {
      id: 'L4-04', level: 4, order: 30, stage: '榜罗镇',
      mc: {
        q: '榜罗镇会议确定了红军落脚陕北的战略方针，这次会议召开于？',
        options: ['1935 年 9 月', '1935 年 1 月', '1936 年 10 月', '1934 年 12 月'],
        answer: 0
      },
      tf: { statement: '榜罗镇会议确定红军落脚云南。', answer: false }
    },
    {
      id: 'L4-05', level: 4, order: 40, stage: '吴起镇',
      mc: {
        q: '中央红军到达陕北吴起镇是在哪一年？',
        options: ['1934 年', '1935 年', '1936 年', '1937 年'],
        answer: 1
      },
      tf: { statement: '中央红军于 1935 年 10 月到达陕北吴起镇。', answer: true }
    },
    {
      id: 'L4-06', level: 4, order: 50, stage: '直罗镇',
      mc: {
        q: '直罗镇战役的胜利，为党中央把全国革命大本营放在西北举行了奠基礼。这场战役发生在？',
        options: ['1935 年 11 月', '1935 年 1 月', '1936 年 10 月', '1934 年 10 月'],
        answer: 0
      },
      tf: { statement: '直罗镇战役发生在 1936 年 10 月。', answer: false }
    },

    // ══════════ 第五关：胜利会师 ══════════
    {
      id: 'L5-01', level: 5, order: 10, stage: '会宁',
      mc: {
        q: '红军三大主力会师的地点是？',
        options: ['甘肃会宁', '陕西吴起镇', '贵州遵义', '江西于都'],
        answer: 0
      },
      tf: { statement: '红军三大主力会师的地点是陕西吴起镇。', answer: false }
    },
    {
      id: 'L5-02', level: 5, order: 12, stage: '会师',
      mc: {
        q: '红军三大主力会师标志着？',
        options: ['长征胜利结束', '长征开始', '遵义会议召开', '抗日战争爆发'],
        answer: 0
      },
      tf: { statement: '红军三大主力会师标志着长征胜利结束。', answer: true }
    },
    {
      id: 'L5-03', level: 5, order: 20, stage: '里程',
      mc: {
        q: '中央红军长征的总里程约为？',
        options: ['二万五千里', '一万里', '五万里', '十万里'],
        answer: 0
      },
      tf: { statement: '中央红军长征的总里程约为二万五千里。', answer: true }
    },
    {
      id: 'L5-04', level: 5, order: 30, stage: '精神',
      mc: {
        q: '下列哪一项不属于长征精神的内涵？',
        options: ['坚定理想信念', '艰苦奋斗', '畏难退缩', '团结协作'],
        answer: 2
      },
      tf: { statement: '畏难退缩是长征精神的重要内涵。', answer: false }
    },
    {
      id: 'L5-05', level: 5, order: 40, stage: '诗篇',
      mc: {
        q: '“红军不怕远征难，万水千山只等闲”出自毛泽东的哪首诗？',
        options: ['《七律·长征》', '《沁园春·雪》', '《忆秦娥·娄山关》', '《清平乐·六盘山》'],
        answer: 0
      },
      tf: { statement: '“红军不怕远征难，万水千山只等闲”出自《七律·长征》。', answer: true }
    },
    {
      id: 'L5-06', level: 5, order: 50, stage: '意义',
      mc: {
        q: '长征胜利的历史意义是？',
        options: ['中国革命转危为安', '中国进入封建社会', '抗日战争全面爆发', '新中国成立'],
        answer: 0
      },
      tf: { statement: '长征的胜利使中国革命转危为安。', answer: true }
    }
  ]
};
