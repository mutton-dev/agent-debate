# agent-debate

> 3 つの Claude が議論し、合意を自動合成するターミナル TUI

議題を投げると **賛成・反対・中立** の 3 役が複数ラウンドにわたって議論し、
4 役目の Claude Judge が合意点・残存する反論・確信スコアを JSON で合成します。

```
agent-debate "AIは人間の仕事を奪うか" --rounds 2
```

```
agent-debate  •  Topic: AIは人間の仕事を奪うか
Rounds 1/2  (q: quit, s: stop & synthesize)

🟢 PROPONENT (round 1)
AI automation is already displacing routine cognitive tasks across
industries. Historical parallels with industrial revolutions suggest
net job creation, but the transition period will cause significant
displacement...

🔴 OPPONENT (round 1)
The "job displacement" framing ignores labor market adaptability.
Every previous automation wave created more jobs than it destroyed.
Current AI lacks the general reasoning required to replace...

🟡 NEUTRAL (round 1)
Both sides conflate short-term disruption with long-term equilibrium.
The empirical evidence shows sector-specific variance rather than...

[thinking… 🟢 PROPONENT round 2]
```

```
╭──────────────────────────────────────────────────╮
│ CONSENSUS                                        │
│ AI will transform work rather than eliminate it. │
│ Transition periods will create displacement      │
│ requiring policy intervention.                   │
│                                                  │
│ Dissenting points:                               │
│ • Timeline of impact is disputed                 │
│ • Low-skilled job scope remains contested        │
│                                                  │
│ confidence — proponent 75 / opponent 60 / neutral 82 │
╰──────────────────────────────────────────────────╯
```

---

## インストール

```bash
npm install -g agent-debate
```

または npx で使い捨て実行:

```bash
npx agent-debate "議題" --rounds 2
```

---

## 使い方

```bash
agent-debate <topic> [options]
```

### オプション

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `--rounds <n>` | `2` | 議論ラウンド数 (1〜N) |
| `--help` | — | ヘルプを表示 |
| `--version` | — | バージョンを表示 |

### 環境変数

| 変数 | 説明 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー（必須） |

```bash
export ANTHROPIC_API_KEY=sk-ant-...
agent-debate "マイクロサービスとモノリス、どちらが適切か" --rounds 3
```

---

## キーバインド

| キー | 動作 |
|------|------|
| `s` | 現在のラウンドで議論を打ち切り、consensus 合成へ進む |
| `q` | 終了 |

`--rounds` を多めに設定し、十分な議論が出たと感じたら `s` で早期終了できます。

---

## 出力の読み方

### ロール

| ロール | 役割 |
|--------|------|
| 🟢 PROPONENT | 議題に対して積極的に賛成・推進する立場 |
| 🔴 OPPONENT | 批判・反証・リスク提示に特化した立場 |
| 🟡 NEUTRAL | 両論を整理し、客観的な視点を提供する立場 |

### Consensus

```
CONSENSUS
<summary>          ← 1〜3 文の合意点まとめ

Dissenting points: ← 合意に至らなかった残存論点
• ...
• ...

confidence — proponent <0-100> / opponent <0-100> / neutral <0-100>
```

- **summary** — 3 役が共通して認めた内容
- **dissentingPoints** — 意見が割れたまま解決しなかった論点（追加調査が必要なシグナル）
- **confidence** — 各ロールが議論を通じてどれだけ一貫した立場を保ったかのスコア (0–100)

---

## ユースケース

### 技術選定・アーキテクチャ判断

```bash
agent-debate "Next.js App Router vs Pages Router、新規プロジェクトに適しているのはどちらか"
agent-debate "GraphQL vs REST、このサービス規模での選択は正しいか"
agent-debate "PostgreSQL vs MongoDB、ユーザーデータの保存に適しているのはどちらか"
```

自分では見えていなかった反論・リスクが OPPONENT から出てくることが多く、
意思決定前の論点洗い出しとして有効です。

### 設計・コードレビューの補助

```bash
agent-debate "JWT をローカルストレージに保存する認証設計は妥当か"
agent-debate "このマイグレーション戦略: 無停止で ALTER TABLE を行う方針は安全か"
```

dissentingPoints が多いほど「まだ決着していない論点がある」サインです。

### 概念の多角的な理解

```bash
agent-debate "関数型プログラミングはオブジェクト指向より優れているか" --rounds 3
agent-debate "LLM の RAG と Fine-tuning、実用面でどちらが優れているか"
agent-debate "テスト駆動開発は本当に生産性を高めるか"
```

---

## 開発

```bash
git clone https://github.com/mutton-dev/agent-debate
cd agent-debate
npm install
npm run dev        # watch ビルド
npm test           # vitest (45 tests)
npm run typecheck  # tsc --noEmit
```

---

## ライセンス

MIT — [Mutton's AI Lab](https://mutton.dev/lab)
