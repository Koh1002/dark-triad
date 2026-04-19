(() => {
  'use strict';

  /**
   * 質問リスト
   *  - SD3 (Jones & Paulhus, 2014), SD4 (Paulhus et al., 2021),
   *    Dirty Dozen (Jonason & Webster, 2010), SSIS (O'Meara et al., 2011)
   *    を参考に、日本語話者に違和感がないよう文言を調整。
   *  - 各特性7問 × 4特性 = 28問。
   *  - trait: 'mach' | 'narc' | 'psyc' | 'sad'
   *  - reverse: true の項目は逆転項目として採点
   */
  const QUESTIONS = [
    // マキャベリアリズム
    { trait: 'mach', text: '人に自分の本心や弱みを知られない方が賢明だと思う。' },
    { trait: 'mach', text: '目的を達成するためなら、多少の嘘やごまかしも時には必要だ。' },
    { trait: 'mach', text: 'お世辞や社交辞令は、人を味方につけるための有効な手段だ。' },
    { trait: 'mach', text: '影響力のある人とのつながりは、戦略的に築いておくべきだ。' },
    { trait: 'mach', text: '自分の本当の計画や狙いは、簡単には他人に明かさない。' },
    { trait: 'mach', text: '交渉や人間関係では、感情よりも駆け引きのほうが大事だ。' },
    { trait: 'mach', text: '相手の弱点やクセを把握しておくと、なにかと自分に有利になる。' },

    // ナルシシズム
    { trait: 'narc', text: '自分には他の人にはない特別な才能や魅力があると思う。' },
    { trait: 'narc', text: '周りは自分のことを、もっと評価してくれてもいいはずだ。' },
    { trait: 'narc', text: '集団の中ではごく自然に自分がリーダー役になることが多い。' },
    { trait: 'narc', text: '注目されたり、場の中心にいたりするのは心地よい。' },
    { trait: 'narc', text: '自分は多くの人より、いくらか優れていると感じることがある。' },
    { trait: 'narc', text: 'SNSや写真では、自分が一番よく見えるように気を配る。' },
    { trait: 'narc', text: '自分は普通の人とは違う、特別な扱いを受けるに値すると思う。' },

    // サイコパシー
    { trait: 'psyc', text: '自分のしたことで強く後悔したり、罪悪感に悩んだりすることは少ない。' },
    { trait: 'psyc', text: '他人の悩みや苦しみを聞いても、正直そこまで気持ちが動かない。' },
    { trait: 'psyc', text: '先のことを深く考えず、衝動のまま行動してしまうことがある。' },
    { trait: 'psyc', text: '自分をなめてきた相手には、きっちり仕返しすべきだと思う。' },
    { trait: 'psyc', text: 'ルールやマナーは、状況によっては破っても構わないと思う。' },
    { trait: 'psyc', text: '人の気持ちを細かく察したり共感したりするのは、あまり得意ではない。' },
    { trait: 'psyc', text: 'スリルや危険のある状況に身を置くのは、むしろ嫌いではない。' },

    // サディズム
    { trait: 'sad',  text: '格闘技や暴力的なシーンのある映画・映像を見るのは、わりと好きだ。' },
    { trait: 'sad',  text: '嫌いな人やムカつく人が失敗したり困ったりすると、正直少しすっきりする。' },
    { trait: 'sad',  text: '言葉で相手を論破したり、痛いところを突いたりするのは得意なほうだ。' },
    { trait: 'sad',  text: 'ネットやSNSで、辛辣なコメントや皮肉を書きたくなることがある。' },
    { trait: 'sad',  text: '傲慢な人や理不尽な人は、一度ひどい目を見た方がいいと思う。' },
    { trait: 'sad',  text: '他人が恥をかいたり失敗したりする場面を見るのは、ちょっと面白い。' },
    { trait: 'sad',  text: '相手をからかったり、いじって反応を見たりするのは楽しい。' }
  ];

  const TRAITS = {
    mach: {
      name: 'マキャベリアリズム',
      en: 'Machiavellianism',
      color: '#d4a15a',
      about:
        '目的達成のための戦略的な操作性・計算高さを指す傾向。16世紀の政治思想家マキャヴェッリに由来し、' +
        '「人は感情ではなく利害で動く」と捉え、長期的な視点で人間関係や交渉を駒のように設計できる冷静さが特徴です。',
      levels: {
        high: {
          tendency:
            'あなたは人間関係を「戦略的に設計する」タイプです。相手の思惑や力関係を読むのが得意で、' +
            '感情的にならず、目的から逆算して動ける強さを持っています。交渉、営業、政治的な調整、プロジェクトの根回しなど、' +
            '「人を動かすこと」が成果に直結する領域では際立った強みになります。',
          caution:
            '一方で、周囲からは「本音が見えない」「打算的」と映り、信頼関係を長期的に損なうリスクがあります。' +
            'あなた自身も「誰もが敵になりうる」という前提で接するため、無自覚に孤立しがちです。' +
            '時には計算を手放し、弱さや本音を見せる関係を意識的に持つことで、バランスが取れます。'
        },
        mid: {
          tendency:
            '必要なときには駆け引きをしつつ、普段は率直に接することもできる、比較的バランスの取れた状態です。' +
            '損得だけでなく、相手との関係性や感情も加味して判断できるタイプといえます。',
          caution:
            '仕事では戦略的に、プライベートでは素直に、という使い分けを意識できると、' +
            'どちらの場面でも摩擦なく動けるでしょう。'
        },
        low: {
          tendency:
            '基本的に率直で、腹の探り合いや打算的な立ち回りを好みません。誠実さと透明さがあり、' +
            '周囲から信用されやすいタイプです。',
          caution:
            '一方で、利害がぶつかる交渉や政治的な場面では、相手の戦略に押し負けやすい面があります。' +
            '「裏の意図を読む」視点を時々取り入れると、自分を守るうえで役に立ちます。'
        }
      }
    },
    narc: {
      name: 'ナルシシズム',
      en: 'Narcissism',
      color: '#b678dd',
      about:
        '自分は特別で優れた存在だという誇大的な自己感と、他者からの賞賛・注目への強い欲求を指す傾向。' +
        '高い自信とリーダーシップの源泉になる一方で、批判に対する脆さや他者への共感不足と結びつきやすいのが特徴です。',
      levels: {
        high: {
          tendency:
            'あなたは「自分には価値がある」「特別である」という感覚が強く、堂々と前に出られるタイプです。' +
            '注目される場で実力を発揮しやすく、自己プロデュース力、発信力、リーダーシップが強みになります。' +
            '実際に行動で結果を出せるときには、周囲を巻き込む大きな推進力になります。',
          caution:
            '注意したいのは、批判や無視に対して過敏になりやすい点と、' +
            '「自分が評価されて当然」という感覚が他者への共感や感謝を薄めてしまいやすい点です。' +
            '承認を他人からの反応だけに依存すると、SNSや他人の評価で気分が乱高下しがちになります。' +
            '自分の中に静かな自己評価の基準を持つことが、長期的な安定につながります。'
        },
        mid: {
          tendency:
            '健全な自信と謙虚さが同居している状態です。自分を肯定しつつ、他者の評価にも耳を貸せるバランス型。' +
            '自己主張と協調のどちらにも振れすぎず、状況に応じて立ち回れます。',
          caution:
            '目立ちたい気持ちと、他者を立てる姿勢をその場その場でどう配分するかを意識できると、' +
            '人間関係でも仕事でも安定した評価を得やすくなります。'
        },
        low: {
          tendency:
            '自己主張が控えめで、謙虚・慎み深いタイプ。目立ちたがらず、他人の功績を素直に認められます。' +
            '協調性の求められる場では信頼される存在です。',
          caution:
            '一方で、自分の成果や実力を表に出す機会を逃しやすく、「評価されるべき場面で評価されない」' +
            'ことが起こりがちです。適切に自分を売り込むスキルを持つと、実力と評価のギャップが縮まります。'
        }
      }
    },
    psyc: {
      name: 'サイコパシー',
      en: 'Psychopathy',
      color: '#e05a7a',
      about:
        '衝動性、冷淡さ、共感の乏しさ、罪悪感の希薄さを核とする傾向。' +
        '冷静に意思決定できる胆力や動じなさと紙一重で、ダークトライアドの中で最も反社会的傾向と結びつくとされます。' +
        '日常レベルでの高スコアは「臨床的サイコパシー」とは別物で、あくまで性格の濃淡を示します。',
      levels: {
        high: {
          tendency:
            'プレッシャー下でも冷静さを失わず、感情に振り回されにくい強さがあります。' +
            '損切りや不快な意思決定を素早くできる点、同調圧力に屈しにくい点は、' +
            '緊急対応、交渉、独立した判断が求められる場面で大きな強みになります。',
          caution:
            '注意したいのは、他者の痛みへの想像力が弱まる瞬間と、衝動的・短絡的に動いてしまうリスクです。' +
            '「自分には害がない」と感じた行為でも、相手や周囲には長く響くことがあります。' +
            '決断の前に「この選択は半年後も正しいと思えるか」と一呼吸おく習慣を持つと、強みがそのまま活きます。' +
            'もし他者に繰り返し深刻な被害が出ている実感があるなら、専門家への相談を検討してください。'
        },
        mid: {
          tendency:
            '必要なときに冷静になれ、必要なときに共感もできる、切り替えのできる状態です。' +
            '情に流されすぎず、冷酷にもなりすぎない、現実的な判断ができるタイプといえます。',
          caution:
            '疲労やストレスが溜まると共感スイッチが切れやすくなる点だけ気をつけると良いでしょう。' +
            '自分の感情の状態をモニターする習慣が、判断の質を支えます。'
        },
        low: {
          tendency:
            '共感力が高く、他人の感情を丁寧に汲み取れるタイプ。信頼関係を築きやすく、' +
            '誰かを傷つけることへの抵抗感も強く、対人関係のトラブルが少ない傾向があります。',
          caution:
            '一方で、他者の感情を背負いすぎて消耗する「共感疲労」や、' +
            '必要な場面で厳しい判断を下しづらい面があります。「自分を守ってもいい」という感覚を意識的に持つことが大切です。'
        }
      }
    },
    sad: {
      name: 'サディズム',
      en: 'Sadism',
      color: '#56a7c9',
      about:
        '他人が苦しんだり傷ついたりすることに、快や楽しさを覚える傾向。' +
        '「攻撃行動に喜びを伴うか」という点でサイコパシーと区別されます。' +
        '研究では、直接的な暴力への衝動だけでなく、格闘技や暴力的な映像・皮肉・ネット上の攻撃などに「楽しさ」を見出す傾向（代理的サディズム）も含まれます。',
      levels: {
        high: {
          tendency:
            '競争、論破、皮肉、ブラックユーモアなど、「攻撃性のあるやり取り」に対して、' +
            '通常より楽しさや刺激を感じやすいタイプです。言語的な攻撃力、議論での鋭さ、' +
            '弱さを見せない強度は、場面によっては武器になりえます。',
          caution:
            '注意したいのは、相手の痛みに対する感度の低下です。' +
            'こちらは「冗談」「正論」と思っていても、相手にとっては深い傷として残ることがあります。' +
            '特にSNSや匿名空間では、攻撃の快感が習慣化しやすく、人間関係や評判を静かに削っていきます。' +
            '「この言葉は、直接目の前で言えるか？」を一度自問するだけでも、歯止めになります。',
        },
        mid: {
          tendency:
            '攻撃的なユーモアや刺激的なコンテンツも楽しめる一方、相手が本当に傷ついているときはきちんとブレーキを踏める状態です。',
          caution:
            '疲れているときやストレスが強いときに、皮肉や攻撃性がこぼれやすくなる可能性があります。' +
            '自分のコンディションと言葉の鋭さの関係を意識しておくと安全です。'
        },
        low: {
          tendency:
            '他人が傷つく様子に快感を覚えることはほとんどなく、むしろ避けたいと感じるタイプ。' +
            '温厚で、安心感を与える存在として周囲から信頼されやすい傾向があります。',
          caution:
            '強い対立や競争の場面では、攻撃性を出すこと自体にストレスを感じやすい面があります。' +
            '「怒っていい」「反論していい」という自分への許可を持つと、いざというとき自分を守れます。'
        }
      }
    }
  };

  /* ---------- State ---------- */
  const state = {
    current: 0,
    answers: new Array(QUESTIONS.length).fill(null),
    chart: null
  };

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const screens = {
    intro: $('screen-intro'),
    quiz: $('screen-quiz'),
    result: $('screen-result')
  };

  /* ---------- Screens ---------- */
  function showScreen(key) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[key].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Quiz ---------- */
  function renderQuestion() {
    const q = QUESTIONS[state.current];
    $('question-text').textContent = q.text;
    $('progress-text').textContent = `${state.current + 1} / ${QUESTIONS.length}`;
    $('progress-fill').style.width = `${((state.current) / QUESTIONS.length) * 100}%`;

    const selected = state.answers[state.current];
    document.querySelectorAll('.likert-btn').forEach((btn) => {
      const v = parseInt(btn.dataset.value, 10);
      btn.classList.toggle('selected', v === selected);
    });

    $('btn-back').disabled = state.current === 0;
  }

  function selectAnswer(value) {
    state.answers[state.current] = value;
    document.querySelectorAll('.likert-btn').forEach((btn) => {
      const v = parseInt(btn.dataset.value, 10);
      btn.classList.toggle('selected', v === value);
    });

    // advance after short delay for visual feedback
    setTimeout(() => {
      if (state.current < QUESTIONS.length - 1) {
        state.current += 1;
        renderQuestion();
      } else {
        $('progress-fill').style.width = '100%';
        finish();
      }
    }, 200);
  }

  /* ---------- Scoring ---------- */
  function computeScores() {
    const sums = { mach: 0, narc: 0, psyc: 0, sad: 0 };
    const counts = { mach: 0, narc: 0, psyc: 0, sad: 0 };

    QUESTIONS.forEach((q, i) => {
      const a = state.answers[i];
      if (a == null) return;
      sums[q.trait] += a;
      counts[q.trait] += 1;
    });

    const means = {};
    Object.keys(sums).forEach((k) => {
      means[k] = counts[k] ? sums[k] / counts[k] : 0;
    });
    return means;
  }

  function levelOf(mean) {
    // 1..5 Likert scale -> low (<2.5), mid (2.5-3.5), high (>3.5)
    if (mean >= 3.5) return 'high';
    if (mean >= 2.5) return 'mid';
    return 'low';
  }

  const LEVEL_LABELS = {
    high: '高い傾向',
    mid:  '平均的',
    low:  '低い傾向'
  };

  /* ---------- Result rendering ---------- */
  function renderResult() {
    const means = computeScores();

    renderScoreList(means);
    renderRadar(means);
    renderDetails(means);
  }

  function renderScoreList(means) {
    const list = $('score-list');
    list.innerHTML = '';

    ['mach', 'narc', 'psyc', 'sad'].forEach((k) => {
      const t = TRAITS[k];
      const mean = means[k];
      const pct = ((mean - 1) / 4) * 100;
      const level = levelOf(mean);

      const el = document.createElement('div');
      el.className = 'score-item';
      el.dataset.trait = k;
      el.innerHTML = `
        <div class="score-item-head">
          <span class="score-item-name">${t.name}</span>
          <span class="score-item-val"><strong>${mean.toFixed(2)}</strong>/ 5.00</span>
        </div>
        <div class="score-item-label">${LEVEL_LABELS[level]}</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${pct}%"></div></div>
      `;
      list.appendChild(el);
    });
  }

  function renderRadar(means) {
    const canvas = $('radar-chart');
    if (state.chart) state.chart.destroy();

    const data = {
      labels: [
        TRAITS.mach.name,
        TRAITS.narc.name,
        TRAITS.psyc.name,
        TRAITS.sad.name
      ],
      datasets: [
        {
          label: 'あなたのスコア',
          data: [means.mach, means.narc, means.psyc, means.sad],
          backgroundColor: 'rgba(201, 169, 110, 0.22)',
          borderColor: 'rgba(201, 169, 110, 1)',
          borderWidth: 2,
          pointBackgroundColor: [
            TRAITS.mach.color,
            TRAITS.narc.color,
            TRAITS.psyc.color,
            TRAITS.sad.color
          ],
          pointBorderColor: '#0b0d14',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    const config = {
      type: 'radar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.r.toFixed(2)} / 5`
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: 'rgba(154, 160, 180, 0.7)',
              backdropColor: 'transparent',
              font: { size: 10 }
            },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.12)' },
            pointLabels: {
              color: '#e9eaf0',
              font: { size: 13, family: "'Noto Sans JP', sans-serif", weight: '600' }
            }
          }
        }
      }
    };

    state.chart = new Chart(canvas, config);
  }

  function renderDetails(means) {
    const container = $('result-detail');
    container.innerHTML = '';

    ['mach', 'narc', 'psyc', 'sad'].forEach((k) => {
      const t = TRAITS[k];
      const mean = means[k];
      const level = levelOf(mean);
      const lv = t.levels[level];

      const card = document.createElement('article');
      card.className = 'detail-card';
      card.dataset.trait = k;
      card.innerHTML = `
        <div class="detail-head">
          <h3 class="detail-name">${t.name}</h3>
          <span class="detail-level lvl-${level}">${LEVEL_LABELS[level]} / ${mean.toFixed(2)}</span>
        </div>
        <p class="detail-en">${t.en}</p>

        <div class="detail-section">
          <h4>この指標について</h4>
          <p>${t.about}</p>
        </div>

        <div class="detail-section">
          <h4>あなたの傾向</h4>
          <p>${lv.tendency}</p>
        </div>

        <div class="detail-section">
          <h4>注意点・活かし方</h4>
          <p>${lv.caution}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* ---------- Flow ---------- */
  function finish() {
    renderResult();
    showScreen('result');
  }

  function restart() {
    state.current = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    renderQuestion();
    showScreen('quiz');
  }

  function shareResult() {
    const means = computeScores();
    const text =
      `ダークテトラッド診断 結果\n` +
      `・マキャベリアリズム: ${means.mach.toFixed(2)} / 5\n` +
      `・ナルシシズム:       ${means.narc.toFixed(2)} / 5\n` +
      `・サイコパシー:       ${means.psyc.toFixed(2)} / 5\n` +
      `・サディズム:         ${means.sad.toFixed(2)} / 5`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = $('btn-share');
        const orig = btn.textContent;
        btn.textContent = 'コピーしました';
        setTimeout(() => (btn.textContent = orig), 1800);
      });
    }
  }

  /* ---------- Events ---------- */
  function bind() {
    $('btn-start').addEventListener('click', () => {
      state.current = 0;
      state.answers = new Array(QUESTIONS.length).fill(null);
      renderQuestion();
      showScreen('quiz');
    });

    document.querySelectorAll('.likert-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = parseInt(btn.dataset.value, 10);
        selectAnswer(v);
      });
    });

    $('btn-back').addEventListener('click', () => {
      if (state.current > 0) {
        state.current -= 1;
        renderQuestion();
      }
    });

    $('btn-retry').addEventListener('click', restart);
    $('btn-share').addEventListener('click', shareResult);

    // Keyboard shortcuts on quiz screen: 1-5 for answer, ArrowLeft to go back
    document.addEventListener('keydown', (e) => {
      if (!screens.quiz.classList.contains('active')) return;
      if (e.key >= '1' && e.key <= '5') {
        selectAnswer(parseInt(e.key, 10));
      } else if (e.key === 'ArrowLeft' && state.current > 0) {
        state.current -= 1;
        renderQuestion();
      }
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    bind();
  });
})();
