(() => {
  'use strict';

  /**
   * 質問リスト
   *  - SD3 (Jones & Paulhus, 2014), SD4 (Paulhus et al., 2021),
   *    Dirty Dozen (Jonason & Webster, 2010), SSIS (O'Meara et al., 2011)
   *    を参考に、日本語話者に違和感がないよう文言を調整。
   *  - 各特性7問（直接項目5 + 逆転項目2） × 4特性 = 28問。
   *  - trait: 'mach' | 'narc' | 'psyc' | 'sad'
   *  - reverse: true の項目は採点時に (6 - 回答) として扱う
   *  - 表示順は runtime で Fisher–Yates シャッフルされる
   */
  const QUESTION_POOL = [
    // マキャベリアリズム
    { trait: 'mach', text: '人に自分の本心や弱みを知られない方が賢明だと思う。' },
    { trait: 'mach', text: '目的を達成するためなら、多少の嘘やごまかしも時には必要だ。' },
    { trait: 'mach', text: 'お世辞や社交辞令は、人を味方につけるための有効な手段だ。' },
    { trait: 'mach', text: '影響力のある人とのつながりは、戦略的に築いておくべきだ。' },
    { trait: 'mach', text: '相手の弱点やクセを把握しておくと、なにかと自分に有利になる。' },
    { trait: 'mach', text: '自分の考えや計画は、いつも相手に率直にそのまま伝える方だ。', reverse: true },
    { trait: 'mach', text: '駆け引きや根回しは苦手で、できれば使いたくない。', reverse: true },

    // ナルシシズム
    { trait: 'narc', text: '自分には他の人にはない特別な才能や魅力があると思う。' },
    { trait: 'narc', text: '周りは自分のことを、もっと評価してくれてもいいはずだ。' },
    { trait: 'narc', text: '集団の中ではごく自然に自分がリーダー役になることが多い。' },
    { trait: 'narc', text: '注目されたり、場の中心にいたりするのは心地よい。' },
    { trait: 'narc', text: 'SNSや写真では、自分が一番よく見えるように気を配る。' },
    { trait: 'narc', text: '自分は特別優れているわけではなく、ごく平凡な人間だと思う。', reverse: true },
    { trait: 'narc', text: '人前に出て目立つよりも、裏方や脇役でいる方が落ち着く。', reverse: true },

    // サイコパシー
    { trait: 'psyc', text: '先のことを深く考えず、衝動のまま行動してしまうことがある。' },
    { trait: 'psyc', text: '自分をなめてきた相手には、きっちり仕返しすべきだと思う。' },
    { trait: 'psyc', text: 'ルールやマナーは、状況によっては破っても構わないと思う。' },
    { trait: 'psyc', text: '人の気持ちを細かく察したり共感したりするのは、あまり得意ではない。' },
    { trait: 'psyc', text: 'スリルや危険のある状況に身を置くのは、むしろ嫌いではない。' },
    { trait: 'psyc', text: '自分のしたことで誰かが傷ついたと知ると、強い罪悪感に悩まされる。', reverse: true },
    { trait: 'psyc', text: 'ルールや約束を破ることには、かなり強い抵抗を感じる。', reverse: true },

    // サディズム
    { trait: 'sad',  text: '格闘技や暴力的なシーンのある映画・映像を見るのは、わりと好きだ。' },
    { trait: 'sad',  text: '嫌いな人やムカつく人が失敗したり困ったりすると、正直少しすっきりする。' },
    { trait: 'sad',  text: 'ネットやSNSで、辛辣なコメントや皮肉を書きたくなることがある。' },
    { trait: 'sad',  text: '傲慢な人や理不尽な人は、一度ひどい目を見た方がいいと思う。' },
    { trait: 'sad',  text: '相手をからかったり、いじって反応を見たりするのは楽しい。' },
    { trait: 'sad',  text: '誰かが苦しんでいる場面を見ると、自分まで胸が痛む。', reverse: true },
    { trait: 'sad',  text: '暴力的・残酷な描写のある作品は、できれば避けたい。', reverse: true }
  ];

  function fisherYates(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 出題順はセッションごとにシャッフル（同一特性・直接／逆転が連続しにくくなる）
  const QUESTIONS = fisherYates(QUESTION_POOL);

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

  /* ----------------------------------------------------------------
   *  ヴィランズ・アーキタイプ
   *
   *  各アーキタイプは、有名な悪役たちから抽出した「特徴タグ」の集合体として
   *  定義する。タグ集合をそのまま text-to-image のプロンプトに流し込むので、
   *  出力されるのは元キャラそのものではなく、特徴を合成したオリジナル像。
   *
   *  profile: [mach, narc, psyc, sad] - 診断結果とのマッチング用座標
   * ---------------------------------------------------------------- */
  const VILLAINS = [
    {
      id: 'puppeteer',
      name: '策謀家の公爵',
      en: 'The Puppeteer Duke',
      inspired:
        'イアーゴ（『オセロ』）／ フランク・アンダーウッド（『ハウス・オブ・カード』）／ ' +
        'ペティア・ベイリッシュ（『ゲーム・オブ・スローンズ』）／ モリアーティ教授',
      profile: [4.7, 3.2, 2.8, 2.2],
      features: [
        'aristocratic nobleman in his forties',
        'sharp thin eyebrows',
        'calculating cold gray eyes',
        'thin knowing smirk',
        'deep crimson velvet robe with gold embroidery',
        'mockingbird lapel brooch',
        'gloved fingers holding marionette strings',
        'ornate gold signet ring',
        'candlelit gothic study at midnight',
        'old map and chess board on desk behind',
        'chiaroscuro oil painting, rembrandt lighting'
      ],
      tagline:
        '派手な怒りや暴力ではなく、会話と情報とタイミングを武器に、人を静かに駒として配置する策略家。',
      narrative:
        '表情は穏やか、言葉は丁寧。だが机の下では、あなたが動いた次の一手まで既に読まれている。' +
        '感情を見せず、負けを悟られず、相手の選択肢だけを少しずつ狭めていく — そんな凄みがあなたのタイプです。'
    },
    {
      id: 'vain_tyrant',
      name: '虚栄の王',
      en: 'The Vain Tyrant',
      inspired:
        'ガストン（『美女と野獣』）／ コモドゥス（『グラディエーター』）／ ' +
        'ロックハート先生（『ハリー・ポッター』）／ 鏡よ鏡の女王（『白雪姫』）',
      profile: [2.9, 4.8, 2.4, 2.6],
      features: [
        'proud handsome man with flowing golden hair',
        'gleaming laurel crown',
        'chiseled noble jawline',
        'chest puffed out in grand pose',
        'ornate gold brocade ceremonial armor',
        'a floating hand mirror reflecting his own face',
        'rose petals drifting through air',
        'classical renaissance palace ballroom',
        'theatrical dramatic lighting',
        'baroque oil painting style'
      ],
      tagline: '「自分は特別」という確信で世界の中心に立ち、賞賛の視線こそを糧とする君臨者。',
      narrative:
        '舞台に立てば光を集める才があり、堂々と前に出られる強さはあなたの武器。' +
        'ただし、鏡が映すのはあなただけ。他者の拍手に酔い、孤独な玉座に気づけなくなることだけが弱点です。'
    },
    {
      id: 'cold_executioner',
      name: '氷血の執行者',
      en: 'The Cold Executioner',
      inspired:
        'アントン・シガー（『ノーカントリー』）／ ターミネーター／ ' +
        'パトリック・ベイトマン（『アメリカン・サイコ』）',
      profile: [3.2, 2.2, 4.8, 2.8],
      features: [
        'tall gaunt figure',
        'expressionless pale face',
        'dead black eyes, no emotion',
        'straight dark hair combed back',
        'thin colorless lips',
        'long black wool coat',
        'gloved hand holding an odd metallic device',
        'abandoned snowy street at dawn',
        'cinematic noir lighting',
        'photorealistic oil painting'
      ],
      tagline: '感情という回路が抜け落ちた、静かで精確な意思決定装置。',
      narrative:
        'プレッシャー下でもブレない冷静さと、同調圧力に屈しない胆力はあなたの長所。' +
        'ただし「自分には痛くない」という尺度で世界を測ると、他者の傷が視界から抜け落ちます。' +
        'あなたが気づかぬうちに誰かが静かに退場していないか、時々振り返ってみてください。'
    },
    {
      id: 'gleeful_tormentor',
      name: '歓喜の拷問者',
      en: 'The Gleeful Tormentor',
      inspired:
        'ジョーカー（『バットマン』）／ ラムジー・ボルトン（『ゲーム・オブ・スローンズ』）／ ' +
        'ケフカ（『FFVI』）／ アンブリッジ先生（『ハリー・ポッター』）',
      profile: [2.6, 3.1, 3.8, 4.8],
      features: [
        'deranged harlequin figure',
        'asymmetric painted face, one side white one side crimson',
        'maniacal wide grin with too many sharp teeth',
        'tattered motley of black and scarlet',
        'tiny silver bells on pointed hat',
        'one hand holding a small curved dagger',
        'other hand offering a rose',
        'blood-red theatrical curtain backdrop',
        'grotesque rococo nightmare',
        'baroque oil painting, ornate frame'
      ],
      tagline: '他者の狼狽と痛みそのものに、純粋な娯楽としての愉悦を見出す混沌の司祭。',
      narrative:
        '皮肉と毒舌、挑発と煽りに異様な切れ味を発揮するのがあなたのタイプ。' +
        '舞台上の役者としては強烈な魅力ですが、その笑みの裏で、何気ない一言が誰かの人生を削っていることがあります。' +
        '「これは目の前で本人に言えるか？」の一問が、最良のブレーキになります。'
    },
    {
      id: 'dark_sovereign',
      name: '闇の帝王',
      en: 'The Dark Sovereign',
      inspired:
        'ヴォルデモート（『ハリー・ポッター』）／ 皇帝パルパティーン（『スター・ウォーズ』）／ ' +
        'サウロン（『指輪物語』）／ ドラキュラ伯爵',
      profile: [4.6, 4.5, 4.5, 4.4],
      features: [
        'tall imposing hooded figure',
        'pale skeletal face',
        'glowing crimson eyes',
        'deep black cloak flowing',
        'withered hands clutching a staff topped with a cracked orb',
        'skull-motif throne behind',
        'dark storm clouds swirling',
        'gothic cathedral ruins',
        'dramatic fantasy oil painting',
        'ominous atmosphere, high contrast'
      ],
      tagline: '操作・支配・冷血・残虐 — ダークな四性質すべてを兼ね備えた完成された絶対者。',
      narrative:
        '緻密な戦略、揺るがぬ誇り、情に流されない決断、そして必要なら相手を壊す覚悟。' +
        'これらを同時に備えるあなたには、大きなものを動かす力があります。' +
        'ただしこの組み合わせは「王」にも「独裁者」にも転びます。自分を律する倫理の錨があるかどうかが、すべての分岐点です。'
    },
    {
      id: 'mirror_tyrant',
      name: '鏡の暴君',
      en: 'The Mirror Tyrant',
      inspired:
        'ジョフリー・バラシオン（『ゲーム・オブ・スローンズ』）／ カリギュラ／ ' +
        'エビル・クイーン（『白雪姫』）',
      profile: [3.1, 4.5, 3.0, 4.5],
      features: [
        'young cruel-eyed monarch',
        'arrogant curled sneer',
        'ornate jeweled crown',
        'blood-red royal mantle with ermine trim',
        'shattered gilded mirror reflecting a distorted sneering face',
        'gilded throne room',
        'decadent palace background with withering roses',
        'gothic opulence oil painting'
      ],
      tagline: '誇り高き自己像に背いた者には、楽しげに罰が降る — 自己愛と加虐の双子の王。',
      narrative:
        '自分の物語の中心に立ち、かつ他者の失態を娯楽として消費するタイプ。' +
        '華やかさ・存在感・言葉の鋭さは強みですが、「傷つけられた」という感覚が短絡的に報復衝動に変換されやすい点には注意が必要です。'
    },
    {
      id: 'silver_serpent',
      name: '銀舌の蛇',
      en: 'The Silver-Tongued Serpent',
      inspired:
        'ハンス・ランダ大佐（『イングロリアス・バスターズ』）／ スカー（『ライオン・キング』）／ ' +
        'サルマン（『指輪物語』）',
      profile: [4.5, 3.2, 3.0, 4.5],
      features: [
        'refined middle-aged gentleman',
        'slicked silver hair',
        'unsettling charming smile',
        'elegant black tailored suit',
        'serpent-shaped lapel pin in gold',
        'cobra eyes with faint vertical pupils',
        'one hand raised in polite gesture',
        'other hand quietly concealing a small blade',
        'aristocratic parlor with red drapery',
        'film-noir chiaroscuro oil painting'
      ],
      tagline: '社交場の貴賓、その内側では毒を選び抜いている鑑定眼の持ち主。',
      narrative:
        '言語の切れ味と人心への洞察は一級品。あなたが微笑むと、相手はなぜか情報を渡してしまいます。' +
        '同じ刃が、必要もない相手を弄ぶ道具になると、長期的に人は近寄らなくなります。' +
        '鋭さを「選別」ではなく「構築」に向けられるかが分かれ道です。'
    },
    {
      id: 'black_charismatic',
      name: '黒のカリスマ',
      en: 'The Black Charismatic',
      inspired:
        'ロキ（北欧神話／マーベル）／ 若きトム・リドル（『ハリー・ポッター』）／ ' +
        'ルシファー・モーニングスター／ マグニートー',
      profile: [4.4, 4.4, 3.0, 2.9],
      features: [
        'beautiful androgynous figure with raven hair',
        'piercing emerald eyes',
        'sly mischievous smirk',
        'jet-black leather long coat with golden filigree',
        'horned obsidian circlet',
        'flickering green flame cupped in one palm',
        'swirling dark energy around shoulders',
        'gothic throne hall with high arches',
        'romantic villain oil painting, dramatic portrait'
      ],
      tagline: '人を惹きつける引力と、己を特別と信じる確信が合わさった、反逆のカリスマ。',
      narrative:
        '求心力と語りの巧さを併せ持つタイプ。あなたの周りには物語が生まれやすく、支持者も出やすい。' +
        'ただし「自分は正しく特別である」という物語への没入が強まると、忠告が届かなくなります。' +
        '自分を相対化できる相棒を一人持つだけで、バランスが大きく変わります。'
    },
    {
      id: 'innocent_seeker',
      name: '無垢の探究者',
      en: 'The Innocent Seeker',
      inspired: '古典的な善なる主人公像（反転としての対照サンプル）',
      profile: [1.6, 2.1, 1.7, 1.6],
      features: [
        'youthful gentle face',
        'clear honest eyes',
        'simple traveling cloak of pale linen',
        'hands open in quiet welcome',
        'soft halo of golden dawn light',
        'a small songbird resting on shoulder',
        'forest clearing at sunrise, mist rising',
        'tender pre-raphaelite oil painting'
      ],
      tagline: '策謀も誇りも残虐性もほとんど持たず、他者の痛みに素直に揺れる、稀有な善性の持ち主。',
      narrative:
        'ダークな四性質がいずれも低く、誠実さ・共感・慎みが際立つタイプ。信頼を集めやすく、周囲に安心感を与えます。' +
        '一方で、利害のぶつかる交渉や悪意のある相手とのやり取りでは、押し切られやすい面も。' +
        '「時には自分を守るために怒ってよい」という許可を、自分に出してあげてください。'
    },
    {
      id: 'grey_pilgrim',
      name: '灰色の巡礼者',
      en: 'The Grey Pilgrim',
      inspired: '善悪の境界を歩む灰色の旅人 — セヴェルス・スネイプ ／ 古典的アンチヒーロー像',
      profile: [3.0, 3.0, 3.0, 3.0],
      features: [
        'hooded traveler of indeterminate age',
        'half face cast in shadow',
        'thoughtful pensive expression',
        'weathered grey wool robe',
        'ornate balance scale in one hand',
        'a raven perched on the other',
        'mist-covered crossroads at dusk',
        'symbolist oil painting, muted palette'
      ],
      tagline: '光と闇のどちらにも軸足を置かず、場面ごとに天秤を傾ける現実主義者。',
      narrative:
        'ダークな特性すべてが突出せず、場面に応じて冷徹にも、誠実にも振る舞える柔軟さがあなたの強み。' +
        '「頼れる大人」「話を聞いてくれる参謀」として重宝される反面、' +
        '八方美人と紙一重にもなります。自分の譲れない一線を言語化しておくと、軸がぶれません。'
    }
  ];

  /* ---------- State ---------- */
  const state = {
    current: 0,
    answers: new Array(QUESTIONS.length).fill(null),
    chart: null,
    villain: null
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
      // 逆転項目は 6 - 回答 に反転してから集計
      const v = q.reverse ? (6 - a) : a;
      sums[q.trait] += v;
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

  /* ---------- Villain matching ---------- */
  function pickVillain(means) {
    // 4次元ユークリッド距離で最も近いアーキタイプを選択
    let best = null;
    let bestDist = Infinity;
    VILLAINS.forEach((v) => {
      const [m, n, p, s] = v.profile;
      const d = Math.sqrt(
        (means.mach - m) ** 2 +
        (means.narc - n) ** 2 +
        (means.psyc - p) ** 2 +
        (means.sad  - s) ** 2
      );
      if (d < bestDist) { bestDist = d; best = v; }
    });
    return best;
  }

  // text-to-image: Puter.js (free, keyless, browser-side)
  //   puter.ai.txt2img(prompt, { model }) -> Promise<HTMLImageElement>
  //   特徴タグを結合して、元キャラそのものではなく「特徴を合成した」
  //   オリジナル肖像画をブラウザ側で生成する。
  function villainPrompt(v) {
    return [
      'dark gothic oil painting portrait of',
      v.features.join(', '),
      'ornate baroque composition, intricate fabric and jewellery detail',
      'cinematic chiaroscuro lighting, atmospheric, museum-quality painterly finish'
    ].join(', ');
  }

  async function generateVillainImage(v, portraitEl, skeletonEl) {
    if (typeof puter === 'undefined' || !puter.ai || typeof puter.ai.txt2img !== 'function') {
      throw new Error('image generation library not available');
    }
    const prompt = villainPrompt(v);
    // FLUX.1 schnell — 1〜2秒級の軽量・高画質モデル
    const imgEl = await puter.ai.txt2img(prompt, {
      model: 'black-forest-labs/FLUX.1-schnell'
    });
    imgEl.id = 'villain-img';
    imgEl.alt = `${v.name}の肖像（${v.features.slice(0, 3).join(', ')}）`;
    imgEl.classList.add('villain-img');
    // fade-in
    requestAnimationFrame(() => imgEl.classList.add('loaded'));
    portraitEl.insertBefore(imgEl, skeletonEl);
    skeletonEl.classList.add('hidden');
  }

  /* ---------- Result rendering ---------- */
  function renderResult() {
    const means = computeScores();

    state.villain = pickVillain(means);
    renderVillain(state.villain);
    renderScoreList(means);
    renderRadar(means);
    renderDetails(means);
  }

  function renderVillain(v) {
    const wrap = $('villain-card');

    wrap.innerHTML = `
      <div class="villain-frame">
        <div class="villain-portrait" id="villain-portrait">
          <div class="villain-skeleton" id="villain-skeleton">
            <span class="skl-line"></span>
            <span class="skl-line"></span>
            <span class="skl-line"></span>
          </div>
        </div>

        <div class="villain-body">
          <p class="villain-verdict-label">— Your Archetype —</p>
          <h2 class="villain-name">
            <span class="v-jp">あなたは「${v.name}」タイプ</span>
            <span class="v-en">${v.en}</span>
          </h2>

          <div class="ornate-divider ornate-divider-sm" aria-hidden="true">
            <svg viewBox="0 0 260 10">
              <line x1="0" y1="5" x2="110" y2="5" stroke="currentColor" stroke-width="0.6"/>
              <polygon points="120,2 130,5 120,8 110,5" fill="currentColor"/>
              <polygon points="140,2 150,5 140,8 130,5" fill="currentColor"/>
              <line x1="150" y1="5" x2="260" y2="5" stroke="currentColor" stroke-width="0.6"/>
            </svg>
          </div>

          <p class="villain-tagline">${v.tagline}</p>
          <p class="villain-narrative">${v.narrative}</p>

          <div class="villain-meta">
            <h4>特徴の参照元</h4>
            <p class="villain-inspired">${v.inspired}</p>
          </div>

          <div class="villain-meta">
            <h4>抽出した特徴タグ <span class="villain-meta-note">— 肖像は特徴を合成して新規生成</span></h4>
            <ul class="villain-tags">
              ${v.features.map((f) => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    const portrait = document.getElementById('villain-portrait');
    const skeleton = document.getElementById('villain-skeleton');

    // 画像は Puter.js (client-side FLUX) で生成
    generateVillainImage(v, portrait, skeleton).catch((err) => {
      console.warn('villain image generation failed:', err);
      skeleton.classList.add('error');
      skeleton.innerHTML =
        '<p class="skl-error">' +
        '肖像の生成ができませんでした。<br/>' +
        'ブラウザの拡張機能や通信環境により、<br/>画像生成サービスにアクセスできない場合があります。' +
        '</p>';
    });
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
