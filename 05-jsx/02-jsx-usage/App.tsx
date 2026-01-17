// ✅ これは Vite + React テンプレの App コンポーネントで、
// React の状態（state）を useState で管理し、ボタン押下でカウントを増やして再描画する最小例である。
// UI には Vite/React のロゴリンクと、カウンターボタン、説明テキストが配置されている。
//
// アルゴリズム的な本質は：
// 1) 初期レンダー時に `useState(0)` で state を生成し、値 count と更新関数 setCount を得る
// 2) イベント（onClick）で setCount を呼ぶ
// 3) setCount に “関数アップデート” を渡し、直前の state から新しい state を計算する
// 4) React が state 変更を検知して再レンダーをスケジュールし、
//    JSX を再評価して count を表示している部分だけ DOM を差分更新する
//
// つまり「状態（データ）→ 描画（ビュー）」の写像を保ちつつ、
// 入力イベントに応じて状態を更新し、その結果を UI に反映する一方向データフローの例である。

import { useState } from "react";
/*
  ✅ useState は React Hooks のひとつで、関数コンポーネントに状態を持たせる仕組み。
  - 呼ぶと [state, setState] を返す
  - state が変わるとコンポーネントが再レンダーされる

  アルゴリズム的には：
  - React が「このコンポーネントの何回目の useState 呼び出しか」を内部で記録し、
    そのスロットに state を保持している（Hooks の順序が重要になる理由）。
*/

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
/*
  ✅ 画像の import。
  - Vite はビルド時にこれらのアセットを処理して、適切な URL に変換してくれる。
  - `/vite.svg` は public 直下などから参照されるパスであることが多い（テンプレ由来）。
*/

import "./App.css";
/*
  ✅ CSS を import すると、副作用としてスタイルが適用される（side-effect import）。
  - React というより Vite のモジュール処理で CSS がバンドルされ、ページに反映される。
*/

function App() {
  // ------------------------------------------------------------
  // 1) state の生成：count と setCount
  // ------------------------------------------------------------
  const [count, setCount] = useState(0);
  /*
    ✅ useState(0) の意味：
    - 初回レンダー時の count の初期値を 0 にする
    - setCount を呼ぶと新しい値が保存され、再レンダーが走る

    ✅ 重要：state は “レンダー間で保存される値”
    - ただのローカル変数なら再レンダーごとにリセットされるが、
      state は React が保持しているので維持される。

    ✅ setCount の呼び出し方がこの後のアルゴリズムのカギになる。
  */

  // ------------------------------------------------------------
  // 2) return JSX：state に基づいて UI を宣言的に描く
  // ------------------------------------------------------------
  return (
    <>
      {/*
        ✅ <>...</> は React Fragment。
        - 余計な div を増やさずに複数要素を返すための“ラッパー”。
      */}
      <div>
        {/* ✅ Vite のサイトへ飛ぶリンク。target="_blank" は別タブで開く */}
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
          {/*
            ✅ <img> は viteLogo の URL を使って画像を表示。
            className は CSS クラス指定。React では class ではなく className を使う。
            alt はアクセシビリティ向上（画像が表示できない時の代替テキスト）。
          */}
        </a>

        {/* ✅ React のサイトへ飛ぶリンク */}
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      {/* ✅ 見出し */}
      <h1>Vite + React</h1>

      <div className="card">
        {/* --------------------------------------------------------
           3) ボタン：クリックで state を更新する
           -------------------------------------------------------- */}
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {/*
          ✅ onClick の中身がこのコードの中心アルゴリズム：

          onClick={() => setCount((count) => count + 1)}

          - クリックされたら setCount を呼ぶ
          - setCount に “関数” を渡している（functional update）
              (count) => count + 1

          ✅ なぜ関数アップデートを使うのか：
          - state 更新は非同期にまとめられる（batching）ことがある
          - そのとき「今見えている count」を直接使うと、
            複数回更新が連続した場合に “古い値” を参照する事故が起きうる
          - 関数アップデートなら、React が管理する “最新の直前 state” を引数で受け取り、
            そこから次の state を決められるため、更新が安全になる

          つまりこの一行は「イベント入力 → 状態遷移」を
          競合しにくい形で書いたものになっている。

          ✅ 表示部分：count is {count}
          - JSX の {count} は式展開。
          - 再レンダーのたびに最新 count が評価され、UI に反映される。
        */}

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {/*
          ✅ HMR（Hot Module Replacement）の説明文。
          - Vite はファイル変更を検知すると、ページ全体をリロードせずに
            変更部分だけ差し替える（ホットリロード）仕組みを持つ。
          - React 側は Fast Refresh 等で状態を保ったまま更新できる場合がある。
        */}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
/*
  ✅ default export にしているので、他ファイルから
    import App from "./App";
  のように読み込める。

  アプリ全体の流れ（超要約）：
  - App がレンダーされると useState で count を用意
  - JSX で count を表示
  - クリックで setCount が呼ばれ、count が 1 増える
  - React が再レンダーし、{count} 部分が最新値に更新される
*/