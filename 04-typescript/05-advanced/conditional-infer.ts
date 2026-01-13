// ✅ このコードは TypeScript の conditional type と `infer` を使って、
// 「配列なら要素型を取り出し、配列でなければそのまま返す」ユーティリティ型 Each<T> を定義する例である。
//
// 重要ポイント：
// - `T extends Array<infer U> ? U : T` は型レベルの if
// - `infer U` は “配列要素型” を推論して U に束縛する仕組み
// - `typeof` は「値から型を取る（型クエリ）」
// - `typeof numArr` から Each を通すと、配列要素型（number）を取り出せる
// - `typeof num` は number なので、そのまま number が返る

// ------------------------------------------------------------
// 1) Each<T>：配列なら要素型、そうでなければ T を返す
// ------------------------------------------------------------
type Each<T> = T extends Array<infer U> ? U : T;
/*
  ✅ 条件分岐（conditional type）の読み方：

  - 条件：T extends Array<infer U> ?
    → “T は Array<...> として扱えるか？”（= 配列型か？）

  - true の場合：U
    → infer U によって Array の中身（要素型）を取り出して返す

  - false の場合：T
    → 配列でないなら、その型をそのまま返す

  ✅ infer の役割：
  - “型のパターンマッチ” をして、パターン内の一部（ここでは要素型）を自動抽出する。
  - T が number[] なら U は number に推論される。
*/

// ------------------------------------------------------------
// 2) 値：num（数値）と numArr（数値配列）
// ------------------------------------------------------------
let num = 5;
/*
  ✅ num は number
  - let なので、型推論は “リテラル 5” ではなく number に広がるのが一般的。
*/

const numArr = [3, 6, 9];
/*
  ✅ numArr は number[] と推論される
  - const でも配列の各要素は通常 number に広がり、全体は number[] になる。
  - もし `[3,6,9] as const` にすると readonly [3,6,9] のタプル型になり、
    Each の結果も 3|6|9 の union になる（用途によって使い分け）。
*/

// ------------------------------------------------------------
// 3) 型への適用：typeof で値から型を取り、Each で変換する
// ------------------------------------------------------------
type NA = Each<typeof numArr>;
/*
  評価の流れ（概念）：
  - typeof numArr は number[]
  - number[] extends Array<infer U> は true
  - U は number と推論される
  => NA は number（配列の要素型）
*/

type N = Each<typeof num>;
/*
  - typeof num は number
  - number extends Array<infer U> は false（配列ではない）
  - よってそのまま T を返す
  => N は number
*/

// ✅ まとめ：
// - Each<number[]>  => number
// - Each<number>    => number
// “配列なら1段 unwrap（要素型抽出）する” 型ユーティリティになっている。