// ✅ このコードは TypeScript のユーティリティ型 `NonNullable<T>` を使って、
// union 型から `null` と `undefined` を取り除いた型を作る例である。
//
// 重要ポイント：
// - NonNullable<T> は「T から null と undefined を除外する」型操作
// - これは実行時に値を変換する機能ではなく、あくまで “型” の制約を強めるだけ
// - そのため NonNullable を適用した後の型に null/undefined を代入すると型エラーになる
//
// アルゴリズム的には：
// - union を集合として見て {null, undefined} を差集合で取り除く
// という “型レベルのフィルタ” を行っている。

// ------------------------------------------------------------
// 1) T1：string | number | undefined から undefined を除外する
// ------------------------------------------------------------
type T1 = NonNullable<string | number | undefined>;
/*
  ✅ 評価（概念）：
  - 入力：string | number | undefined
  - NonNullable は null と undefined を除外する
  - ここでは undefined が含まれているので削除される
  => T1 は string | number

  ※ null は元の union に入っていないので影響なし
*/

// ------------------------------------------------------------
// 2) T2：number[] | null | undefined から null と undefined を除外する
// ------------------------------------------------------------
type T2 = NonNullable<number[] | null | undefined>;
/*
  ✅ 評価（概念）：
  - 入力：number[] | null | undefined
  - null と undefined を除外
  => T2 は number[]

  つまり “必ず配列が来る” 型になる。
*/

// ------------------------------------------------------------
// 3) 代入例：NonNullable 後の型に null/undefined を入れると型エラー
// ------------------------------------------------------------
const text: T1 = undefined;
/*
  ❌ これは TypeScript 的に不正（型エラーになるのが正しい）：
  - text の型 T1 は string | number
  - undefined は許可されていない
*/

const figure: T2 = null;
/*
  ❌ これも TypeScript 的に不正（型エラーになるのが正しい）：
  - figure の型 T2 は number[]
  - null は許可されていない
*/

// ✅ まとめ：
// - NonNullable は “null/undefined を除いた型” を作る（型安全を強める）
// - その後は null/undefined を代入できなくなる
// - 実行時に値が勝手に補完されるわけではないので、値側の制御（初期化・チェック）も必要