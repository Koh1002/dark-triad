# ダークトライアド診断 / Dark Tetrad Self-Check

ダークトライアド（マキャベリアリズム・ナルシシズム・サイコパシー）にサディズムを加えた
いわゆる「ダークテトラッド」の4指標を、Webブラウザ上でセルフチェックできるシンプルなアプリです。

## 特徴

- 全28問（各指標7問）の5件法アセスメント
- 学術尺度 SD3 / SD4 / Dirty Dozen / SSIS を参考にしつつ、日本語話者に自然な文言へ適応
- 結果はレーダーチャート（Chart.js）で可視化
- 各指標について「概要 / あなたの傾向 / 注意点・活かし方」を個別に表示
- 静的ファイルのみ（HTML / CSS / JS）なので GitHub Pages にそのままデプロイ可能

## ローカルで動かす

```bash
# どのディレクトリでもよいので、このリポジトリ直下で簡易HTTPサーバを立ち上げ
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## 参考文献

- Jones, D. N., & Paulhus, D. L. (2014). *Introducing the Short Dark Triad (SD3): A brief measure of dark personality traits.* Assessment.
- Paulhus, D. L., Buckels, E. E., Trapnell, P. D., & Jones, D. N. (2021). *Screening for Dark Personalities: The Short Dark Tetrad (SD4).* European Journal of Psychological Assessment.
- Jonason, P. K., & Webster, G. D. (2010). *The Dirty Dozen: A concise measure of the Dark Triad.* Psychological Assessment.
- O'Meara, A., Davies, J., & Hammond, S. (2011). *The psychometric properties and utility of the Short Sadistic Impulse Scale (SSIS).* Psychological Assessment.

## 注意

本アプリは学習・エンタメ目的のセルフチェックです。臨床的なパーソナリティ診断ではありません。
