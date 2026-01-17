// ✅ この App コンポーネントは、2つの子コンポーネント
// - <Greet />（挨拶の表示）
// - <Summary />（タイトル + 子要素（children）をまとめて表示）
// を組み合わせて UI を構築している “コンポジション（合成）” の例である。
//
// アルゴリズム的な本質は：
// 1) App は「画面をどう構成するか」だけを宣言し、表示の詳細は子へ委譲する（責務分割）
// 2) データは Props として上から下へ流れる（トップダウンの一方向データフロー）
// 3) Summary は children を受け取り、可変長の中身を “スロット” 的に埋め込める（コンテンツ投影）
// 4) state を持たない純粋（に近い）コンポーネントなので、同じ props なら同じ UI になる
//    → 入力（props）→ 出力（UI）の写像として捉えられる

import Greet from './components/Greet.tsx';
/*
  ✅ Greet コンポーネントを import（default import）。
  - 期待される役割：name と times を props で受け取り、挨拶を一定回数表示する等。
  - `times={4}` のような数値 props が渡されているので、
    ループ（配列生成 + map）などで “回数分の UI を生成する” 実装になっている可能性が高い。
*/

import Summary from './components/Summary.tsx';
/*
  ✅ Summary コンポーネントを import（default import）。
  - 期待される役割：title を表示し、children（入れ子の要素）を本文として表示する等。
  - React の children は「親から子へ渡される JSX の塊」で、コンポジションの中核。
*/

import './App.css';
/*
  ✅ CSS の副作用 import。
  - Vite が CSS をバンドルして、App に関係するスタイルを適用する。
*/

function App() {
  /*
    ✅ App は state や副作用がない “プレゼンテーション寄り” なコンポーネント。
    アルゴリズム的には：
    - props を受け取らない（入力なし）
    - ただ子コンポーネントを並べて UI ツリーを構築する
    - React はこの JSX を評価して仮想DOMツリーを作り、差分を DOM に反映する
  */

  return (
    <>
      {/*
        ✅ Fragment：余計な DOM ノードを作らずに複数要素を返す。
      */}

      {/* --------------------------------------------------------
         1) Greet：Props によるパラメータ化
         -------------------------------------------------------- */}
      <Greet name="Patty" times={4} />
      {/*
        ✅ ここは “関数呼び出し” に近い発想で捉えられる：

          UI = Greet({ name: "Patty", times: 4 })

        - name は文字列リテラル
        - times は数値（JSX では波括弧で式として渡す）
        - 親（App）→ 子（Greet）へデータが流れる

        ✅ アルゴリズムの期待形：
        - times=4 に応じて 4回分の挨拶 UI を生成するなら、
          子側では
            Array.from({ length: times }).map(...)
          のように “回数 → 要素列” を生成して描画する実装が考えられる。

        ※ 実際の動作は Greet.tsx の中身次第だが、
           props で “回数” を渡している時点で、繰り返し生成系のロジックを示唆している。
      */}

      {/* --------------------------------------------------------
         2) Summary：children によるコンテンツ投影（スロット）
         -------------------------------------------------------- */}
      <Summary title="Maple Town">
        {/*
          ✅ <Summary> ... </Summary> の中身は children として Summary に渡される。

          children の性質：
          - JSX は “値” として扱える（ReactElement のツリー）
          - 親が組み立てた UI 断片を、子が任意の位置に埋め込める
          - これにより「枠（レイアウト）と中身（コンテンツ）」を分離できる

          アルゴリズムで言うと：
          - Summary は title（メタ情報）と children（本文）を受け取り、
            それらを一定のテンプレートに当てはめて出力する “テンプレート関数” になる
        */}
        <p>
          Patty Hope-rabbit, along with her family, arrives in Maple Town, a
          smalltown inhabited by friendly animals.
        </p>
        <p>
          Soon, the Rabbit Family settles in Maple Town as mail carriers and the
          bitter, yet sweet friendship of Patty and Bobby begins to blossom.
        </p>
        {/*
          ✅ children は複数の <p> 要素（配列相当の子要素）として渡される。
          - Summary 側が `{children}` をレンダーすれば、この2段落が表示される。
          - これにより Summary は “段落数が増減しても” 同じ枠組みで扱える（可変長入力に強い）。
        */}
      </Summary>
    </>
  );
}

export default App;
/*
  ✅ default export なので、エントリポイント（main.tsx 等）で
    import App from './App';
  としてルートコンポーネントとして描画される。

  ✅ 全体のデータフローまとめ：
  - App（親）が props と children を用いて UI ツリーを構築
  - Greet/Summary（子）は受け取った入力（props/children）から UI を生成
  - state が無いので “入力が同じなら出力も同じ” な純粋関数的モデルで理解できる
*/