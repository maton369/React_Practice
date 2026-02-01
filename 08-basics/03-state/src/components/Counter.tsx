// ✅ Counter は “状態（count）” を持つ最小のインタラクティブ UI コンポーネントである。
// - useState で count を保持し、ボタン操作で状態遷移させる
// - その状態を JSX に投影して表示する
// - shadcn/ui（Button, Card）を使って見た目（レイアウト/スタイル）を統一する
//
// アルゴリズム的な本質は：
// 1) state を 1 つ用意する：count ∈ ℤ（初期値 0）
// 2) イベントに状態遷移関数を割り当てる：
//      increment: f(c) = c + 1
//      reset:     g(c) = 0
// 3) React が「状態が変わったら再レンダーする」ことで、
//    表示（count の文字列）を最新状態へ同期する
//
// つまり「有限状態機械（FSM）的な状態更新 + 宣言的UI + 差分DOM反映」という構造である。

import { useState } from "react";
/*
  ✅ useState: 関数コンポーネントに “状態（state）” を持たせる Hook。
  - setCount が呼ばれると React は再レンダーをスケジュールする。
*/

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
/*
  ✅ shadcn/ui の UI 部品。
  - これらは「見た目」と「一貫したスタイル」を提供するコンポーネント。
  - ロジック（状態遷移）とは分離されているので、UI の責務を薄く保てる。
*/

function Counter() {
  // ------------------------------------------------------------
  // 1) 状態の定義：count と、その更新関数 setCount
  // ------------------------------------------------------------
  const [count, setCount] = useState(0);
  /*
    ✅ count: 現在の状態（数値）
    ✅ setCount: 状態更新を要求する関数

    アルゴリズム観点：
    - count はレンダー間で保持されるメモリ（状態）。
    - setCount により状態が変化すると、React が再レンダーを実行し UI を更新する。
  */

  // ------------------------------------------------------------
  // 2) 状態遷移関数：increment / reset
  // ------------------------------------------------------------
  function increment() {
    setCount((c) => c + 1);
    /*
      ✅ 関数アップデート形式で +1 する。
      - (c) => c + 1 は “直前の state” を入力に取り “次の state” を返す遷移関数。

      なぜこれが良いか（アルゴリズム的理由）：
      - state 更新が連続したりバッチ処理されても、
        「最新の c」から次状態を計算できるため古い値を掴みにくい。
      - つまり状態遷移の合成（複数回更新）に強い書き方。
    */
  }

  function reset() {
    setCount(0);
    /*
      ✅ 状態を初期値に戻す遷移。
      - ここは “前の状態に依存しない” ので、直接 0 を渡すのが自然。
    */
  }

  // ------------------------------------------------------------
  // 3) 描画：状態を JSX に投影（render）する
  // ------------------------------------------------------------
  return (
    <Card className="min-w-96 gap-2 pt-4 shadow-md">
      {/*
        ✅ Card は外枠コンテナ。
        - min-w-96: 最小幅を確保して UI を安定させる
        - gap-2, pt-4, shadow-md: 見た目の調整
        ※ レイアウト/スタイルであり、状態遷移アルゴリズムには影響しない。
      */}

      <CardHeader>
        {/* タイトル表示（静的テキスト） */}
        <div className="text-center text-xl font-medium">Count</div>
      </CardHeader>

      <CardContent className="flex justify-center pb-2">
        {/* --------------------------------------------------------
            4) 状態の表示：count を “現在値” として投影
           -------------------------------------------------------- */}
        <div className="text-4xl font-semibold">{count}</div>
        {/*
          ✅ {count} はレンダー時点の state を表示する。
          - increment/reset により state が変わるたびに再レンダーされ、
            この部分が最新値に更新される。

          アルゴリズム的には：
          - UI = render(state)
          を満たす（宣言的 UI）。
        */}
      </CardContent>

      <CardContent className="mx-4 flex gap-2">
        {/* --------------------------------------------------------
            5) 入力（イベント）→ 状態遷移の接続
           -------------------------------------------------------- */}

        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={increment}
        >
          +1
        </Button>
        {/*
          ✅ onClick で increment を呼び出す。
          - クリックイベント → 状態遷移 f(c)=c+1 → 再レンダー
          という一連のデータフローが成立する。
        */}

        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={reset}>
          Reset
        </Button>
        {/*
          ✅ onClick で reset を呼び出す。
          - クリックイベント → 状態遷移 g(c)=0 → 再レンダー
        */}
      </CardContent>
    </Card>
  );
}

export default Counter;
/*
  ✅ default export して、任意のページ/親コンポーネントから <Counter /> として使用できる。

  ✅ 全体まとめ（状態機械として）：
  - state: count
  - transitions:
      increment: count := count + 1
      reset:     count := 0
  - view: state をそのまま UI に投影する（Count 数字表示）
*/