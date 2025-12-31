/*
  ✅ このコードは、実務で頻出の「不完全なデータ（null / 欠損プロパティ）を安全に扱う」
  ための演算子を組み合わせた例である。

  使っているのは主にこの2つ：
  - Nullish Coalescing（??）: null / undefined のときだけフォールバックする
  - Optional Chaining（?.） : 途中が null/undefined ならそこで止めて undefined を返す

  これらにより、null や address 未定義でも例外を出さずに文字列を生成できる。

  ------------------------------------------------------------
  1) データの状態
  ------------------------------------------------------------
  users は次のように “揺れ” がある：
  - users[0]: address.town まで揃っている
  - users[1]: address はあるが town がない
  - users[2]: そもそも null

  ------------------------------------------------------------
  2) for...of のアルゴリズム：配列の要素を順番に取り出す
  ------------------------------------------------------------
  `for (u of users)` は配列の要素を左から順に u に束縛してループする。

  ※ 厳密には `for (const u of users)` と書くのが推奨（暗黙のグローバル変数化を防ぐため）。
     ただしここでは動作説明を優先し、現状コードのまま解説する。

  ------------------------------------------------------------
  3) user の決定：u ?? { name: '(Somebody)' }
  ------------------------------------------------------------
*/

const users = [
  {
    name: 'Patty Rabbit',
    address: {
      town: 'Maple Town',
    },
  },
  {
    name: 'Rolley Cocker',
    address: {},
  },
  null,
];

for (u of users) {
  /*
    ✅ Nullish Coalescing（??）
    ------------------------------------------------------------
    const user = u ?? { name: '(Somebody)' };

    - u が null または undefined のときだけ、右側のデフォルトを採用する
    - u が “それ以外” の値なら、そのまま u を採用する

    つまり、
    - 1回目 u はオブジェクト → user はそのオブジェクト
    - 2回目 u はオブジェクト → user はそのオブジェクト
    - 3回目 u は null → user は { name: '(Somebody)' }

    ⚠️ `||` との違い：
    `||` は 0 や '' も falsy とみなしてフォールバックしてしまうが、
    `??` は null/undefined だけを欠損扱いするため、意図がブレにくい。
  */
  const user = u ?? { name: '(Somebody)' };

  /*
    ✅ Optional Chaining（?.） + Nullish Coalescing（??）
    ------------------------------------------------------------
    const town = user?.address?.town ?? '(Somewhere)';

    アルゴリズム的には次の流れ：

    (1) user?.address
        - user が null/undefined なら、そこで止めて undefined を返す
        - そうでなければ user.address を評価する（存在しなければ undefined）

    (2) (1) の結果に対して ?.town
        - address が null/undefined なら、そこで止めて undefined
        - そうでなければ address.town を評価（無ければ undefined）

    (3) 最後に ?? '(Somewhere)'
        - (2) の結果が null/undefined なら '(Somewhere)' を採用
        - そうでなければ town の値を採用

    つまり「途中で欠損しても落ちずに、最後にデフォルトへ逃がす」構造になっている。

    各ループでの結果：
    - 1回目：user.address.town = 'Maple Town' → town = 'Maple Town'
    - 2回目：user.address は {} で town が無い → user.address.town は undefined → town = '(Somewhere)'
    - 3回目：user は { name:'(Somebody)' } で address が無い → user.address は undefined → town = '(Somewhere)'
  */
  const town = user?.address?.town ?? '(Somewhere)';

  /*
    ✅ 文字列生成
    - user.name は user が必ずオブジェクトになるようにしているため安全に参照できる
    - town も必ず文字列になるようにしているため安全に埋め込める
  */
  console.log(`${user.name} lives in ${town}`);
}

/*
  ------------------------------------------------------------
  4) 実際の出力
  ------------------------------------------------------------
  1回目：Patty Rabbit lives in Maple Town
  2回目：Rolley Cocker lives in (Somewhere)
  3回目：(Somebody) lives in (Somewhere)
*/