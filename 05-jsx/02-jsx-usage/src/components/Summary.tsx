// ✅ この Summary コンポーネントは「見出し付きの折りたたみ領域」を提供する。
// HTML の <details>/<summary> をラップして、
// - title を見出し（<summary>）として表示
// - children を本文として中に差し込む（コンテンツ投影）
// - folded（折りたたみ初期状態）を props で制御する
// という役割になっている。
//
// アルゴリズム的な本質は：
// 1) 親から受け取った入力（title, folded, children）を正規化（folded のデフォルト）
// 2) folded を “open 属性” に変換して初期表示状態を決める（folded -> !folded）
// 3) children（ReactElementツリー）をそのまま DOM ツリーに合成して出力する
//
// つまり「UI の枠（details/summary）＋可変な中身（children）」を合成するテンプレート関数である。

import './Summary.css';
/*
  ✅ CSS の副作用 import。
  - Vite が CSS をバンドルし、`.story` などのクラスにスタイルを適用する。
  - React のロジックというより “モジュールとして CSS を読み込む” バンドラ機能。
*/

// ------------------------------------------------------------
// 1) Props：このコンポーネントが受け取る入力の型
// ------------------------------------------------------------
interface Props {
  title: string;
  /*
    ✅ title は必須の見出しテキスト。
    - <summary>{title}</summary> に表示される。
  */

  folded?: boolean;
  /*
    ✅ folded? は省略可能。
    - “初期状態で折りたたまれているか” を表すフラグとして使う想定。
    - 省略時は後段で false（= 折りたたまない）に正規化する。
  */

  children: React.ReactNode;
  /*
    ✅ children は React の “入れ子要素” を受け取るための標準的な props。
    - React.ReactNode はかなり広い集合で、
      JSX要素、文字列、数値、配列、null/undefined などを含む。
    - Summary は `{children}` を描画するだけなので、
      内容の型を厳密に縛らず柔軟に受け入れるのに向いている。

    ⚠️ 注意：
    - このコードでは `React.ReactNode` を使っているが、
      `import React from 'react'` をしていない。
      ただし tsconfig の `jsx: react-jsx` + React の型定義が入っていると、
      型名前 `React` がグローバルに使える設定になっている場合がある。
      環境によっては `import type { ReactNode } from 'react'` が必要になることもある。
  */
}

// ------------------------------------------------------------
// 2) Summary：props を分割代入しつつデフォルト値で正規化
// ------------------------------------------------------------
function Summary({ title, folded = false, children }: Props) {
  /*
    ✅ 引数の分割代入 + folded のデフォルト値
    - folded が undefined のとき、folded = false となる
    - つまり “指定しない限り開いた状態” が初期値になる

    アルゴリズムとしては：
    foldedNormalized = (folded === undefined) ? false : folded
  */

  console.log(children);
  /*
    ✅ children の中身をデバッグ出力。
    - children は “ReactElementツリー（や文字列など）” の値なので、
      ここでコンソールに出すと、親が渡した JSX の構造が確認できる。
    - 実運用ではログがノイズになるので、検証が終わったら削除するのが一般的。
  */

  // ----------------------------------------------------------
  // 3) 折りたたみUI：<details>/<summary> を使う
  // ----------------------------------------------------------
  return (
    <details className="story" open={!folded}>
      <summary>{title}</summary>
      {children}
    </details>
  );
  /*
    ✅ <details> は HTML 標準の折りたたみ要素。
    - <summary> が “見出し（クリック対象）”
    - その下が “展開される内容”

    ✅ open={!folded} のロジック（ここが変換のコア）：
    - folded が true なら「折りたたみたい」ので open=false にする
    - folded が false なら「開きたい」ので open=true にする
    - つまり folded と open は真偽が逆の関係になる

      open = !folded

    ✅ ここでの “アルゴリズム” は非常に単純で、
    folded という抽象フラグを、HTML の open 属性へ写像しているだけ。

    ⚠️ 状態管理に関する重要ポイント：
    - `open` 属性は “初期状態” の指定に近い。
    - ユーザーがクリックして開閉した後の状態はブラウザ（DOM）が持つ。
    - このコンポーネントは React state を使って open を制御していないため、
      “ユーザー操作で状態が変わるが、React 側の状態は持たない” という設計になる。
    - もし folded の変更に追従して強制的に開閉させたい（controlled にしたい）なら、
      `open` の扱い方や onToggle で state を管理する設計が必要になる。

    ✅ children の合成（コンテンツ投影）：
    - `{children}` により、親が渡した JSX（段落など）がそのまま差し込まれる。
    - Summary は「枠だけ提供して中身は親に任せる」ため、
      再利用性が高い（どんな内容でも入れられる）。
  */
}

// ------------------------------------------------------------
// 4) export：外部から <Summary> として利用可能にする
// ------------------------------------------------------------
export default Summary;