// ✅ これは Vite + React のテンプレ App に、Vite 環境変数（import.meta.env）を読み出して
// タイトル表示に使う処理を追加した版である。
//
// アルゴリズム的な本質は：
// 1) Vite がビルド/起動時に `.env` 等の値を読み取り、`import.meta.env` としてクライアントへ注入する
// 2) その注入済みオブジェクトから `VITE_APP_TITLE` を取り出し、静的値として appTitle に束縛する
// 3) React は state（count）を useState で管理し、イベント入力で状態遷移→再レンダー→差分DOM反映を行う
// 4) JSX は appTitle と count を “入力値” として表示し、再レンダーのたびに評価される
//
// つまり「ビルド時注入（環境変数）＋実行時状態（count）」の2種類の入力を UI に反映する例である。

import { useState } from 'react'
/*
  ✅ useState: 関数コンポーネントに state を持たせる Hook。
  - state が更新されると再レンダーがスケジュールされる。
*/

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
/*
  ✅ アセットと CSS の import。
  - Vite がビルド時に URL 解決と CSS バンドルを行う。
*/

// ------------------------------------------------------------
// 1) 環境変数の読み出し（Vite が import.meta.env を注入）
// ------------------------------------------------------------
const appTitle = import.meta.env.VITE_APP_TITLE;
/*
  ✅ ここは “React の外” で実行されるトップレベルコード。

  - import.meta.env は Vite が注入する環境変数オブジェクト。
  - VITE_APP_TITLE は（前に定義した型宣言があれば）string として扱える。

  ✅ アルゴリズム観点：
  - appTitle は起動時に 1 回評価され、以降は同じ値が使われる（通常は変化しない）。
  - これは state のように再レンダーで変化する値ではなく、
    “ビルド/起動時に確定する設定値” として扱うのが自然。
*/

console.dir(import.meta.env);
/*
  ✅ import.meta.env の中身をコンソールに出すデバッグ用。
  - VITE_ 系以外の環境変数は基本的にクライアントへ露出しない設計が多い。
  - 実運用ではログがノイズになるため、確認後に削除するのが一般的。

  ✅ なお、トップレベルなので App の再レンダーとは無関係に、
    モジュールが評価されるタイミングで実行される。
*/

// ------------------------------------------------------------
// 2) App：状態（count）を持ち、UI を返す関数コンポーネント
// ------------------------------------------------------------
function App() {
  const [count, setCount] = useState(0)
  /*
    ✅ count は “レンダー間で保持される値”。
    - 初期値 0
    - setCount により更新され、更新があると再レンダーが走る
  */

  return (
    <>
      {/* ロゴリンクはテンプレそのまま */}
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      {/* --------------------------------------------------------
          3) 環境変数由来のタイトル表示
         -------------------------------------------------------- */}
      <h1>{appTitle}</h1>
      {/*
        ✅ ここで appTitle を表示している。

        アルゴリズム的には：
        - appTitle はトップレベルで確定した定数なので、
          App の再レンダーが何回走っても基本的に同じ値が表示される。
        - つまり UI 入力としては “静的設定値”。
      */}

      <div className="card">
        {/* --------------------------------------------------------
            4) 状態遷移：クリックで count をインクリメント
           -------------------------------------------------------- */}
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {/*
          ✅ setCount((count) => count + 1) は関数アップデート。
          - 直前の state を引数で受け取り、次 state を計算する。
          - バッチ更新などがあっても古い count を掴みにくい安全な書き方。

          状態遷移関数として見ると：
            f(s) = s + 1
          をクリックイベントに結び付けている。
        */}

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
/*
  ✅ default export により、main.tsx 等からルートとして読み込まれる。

  ✅ 全体まとめ（入力の種類）：
  - appTitle: ビルド/起動時に注入される “静的設定値”
  - count: 実行中にイベントで変化する “動的状態”
  これらを JSX に埋め込み、React が再評価→差分更新で UI を保つ。
*/