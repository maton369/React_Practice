// ✅ この TextInput コンポーネントは「ボタンを押すとテキスト入力欄にフォーカスを当てる」機能を実装している。
// React の useRef を使って DOM 要素（<input>）への参照を保持し、
// クリックイベントで imperative（命令的）に `focus()` を呼ぶ例である。
//
// アルゴリズム的な本質は：
// 1) useRef で “DOMノードへの参照箱” を作る（初期値は null）
// 2) ref 属性で、その箱に実DOM（HTMLInputElement）を紐付ける（マウント後に current が埋まる）
// 3) ボタン押下で current を参照し、存在すれば focus() を呼ぶ（安全のため optional chaining）
// 4) state 更新を伴わないので再レンダーは不要、DOM 操作だけが起きる
//
// つまり「参照（ref）を介して DOM を直接操作する」ための最小パターンである。

import { useRef } from 'react';
/*
  ✅ useRef は React Hooks のひとつで、レンダー間で保持される “可変な入れ物” を作る。
  - useState と違い、ref.current を変更しても再レンダーは起きない（UI 更新トリガではない）。
  - 主用途は
    - DOM 要素参照
    - タイマーIDなどの mutable な値保持
    - 前回値の保持
    など。

  アルゴリズム観点では：
  - 「レンダーのたびに作り直さず、同じ箱を保持し続ける」ための仕組み。
*/

import './TextInput.css';
/*
  ✅ CSS の副作用 import。
  - `.input-item` などのクラスにスタイルを適用する。
*/

function TextInput() {
  // ------------------------------------------------------------
  // 1) DOM参照用の ref を用意
  // ------------------------------------------------------------
  const inputRef = useRef<HTMLInputElement>(null);
  /*
    ✅ 型引数 `<HTMLInputElement>` により、current の型を
      HTMLInputElement | null
    として扱えるようにしている。

    ✅ 初期値が null な理由：
    - 初回レンダー時点では DOM はまだ作られていないため参照できない。
    - マウント（DOM が実際に生成されて ref が割り当てられた後）に
      inputRef.current が HTMLInputElement を指すようになる。

    アルゴリズム的には：
    - ref は「後で埋まるポインタ」を保持する箱であり、
      ref 属性によって React がそのポインタを更新する。
  */

  // ------------------------------------------------------------
  // 2) ボタン押下時のイベントハンドラ
  // ------------------------------------------------------------
  const handleClick = () => {
    inputRef.current?.focus();
    /*
      ✅ optional chaining（?.）で null 安全に focus を呼ぶ。

      - inputRef.current が null の場合（まだマウントされていない、など）：
        → `?.` により何もせずに終了（例外が起きない）
      - inputRef.current が HTMLInputElement の場合：
        → DOM API の focus() が呼ばれ、入力欄にカーソルが当たる

      アルゴリズムで言うと：
      - “参照が存在するなら命令を実行する” というガード付き実行。
    */
  };

  // ------------------------------------------------------------
  // 3) JSX：ref を DOM に結び付け、ボタンで handleClick を呼ぶ
  // ------------------------------------------------------------
  return (
    <div className="input-item">
      <input type="text" ref={inputRef} />
      {/*
        ✅ ref={inputRef} が核心：
        - React がこの <input> DOM を生成したあと、
          inputRef.current にその DOM ノードを代入する。
        - アンマウント時には current を null に戻す。

        つまり ref を通じて、
        “宣言的 UI（JSX）” から “命令的 DOM 操作（focus）” へ橋渡ししている。
      */}

      <input type="button" value="フォーカス" onClick={handleClick} />
      {/*
        ✅ onClick={handleClick}：
        - ボタンがクリックされると handleClick が呼ばれ、
          inputRef.current が指すテキスト入力に focus() が実行される。

        ✅ state を使っていない点が重要：
        - フォーカスは DOM の内部状態（フォーカス管理）であり、
          UI の描画結果（文字列など）を変える必要がない。
        - そのため、React の再レンダーではなく “必要最小限の命令的操作” で達成している。
      */}
    </div>
  );
}

export default TextInput;
/*
  ✅ default export なので、他コンポーネントから
    import TextInput from './TextInput';
  のように使用できる。
*/