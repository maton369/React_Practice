// ✅ このコードは前のモジュール（currency-export）から `Currency` を import し、
// 1) 通貨オブジェクト（100 USD）を作る
// 2) それを `Currency.exchange` で別通貨（JPY）へ換算する
// という利用例である。
//
// ここで重要なのは `Currency` という名前が2つの意味を持っている点：
// - 型としての Currency（interface Currency）
// - 値としての Currency（exchange メソッドを持つオブジェクト）
//
// TypeScript では “型空間” と “値空間” が別なので同名が成立する。
// このコードはそれを利用して、
// - `const dollars: Currency = ...` では型を参照
// - `Currency.exchange(...)` では値（オブジェクト）を参照
// している。

import { Currency } from './currency-export';
/*
  ✅ import しているのは “値” の Currency（exchange を持つオブジェクト）。
  ただし、もし ./currency-export 側で `interface Currency` も export しているなら、
  ここで `Currency` を型としても参照できる（型と値が同名でも矛盾しない）。

  ⚠️ 注意：
  - もし export されていない型をここで `: Currency` と書くとコンパイルエラーになる。
  - 逆に export されていれば、同じ import 名で型/値の両方に使える。
*/

// ------------------------------------------------------------
// 1) dollars：100 USD の通貨オブジェクトを生成
// ------------------------------------------------------------
const dollars: Currency = {
    unit: "USD",
    amount: 100,
};
/*
  ✅ ここでの Currency は “型” としての Currency。
  - unit は Unit（例："USD" | "EUR" | ...）のどれか
  - amount は number

  ✅ 型注釈を付ける意味：
  - unit に存在しないコード（例："AUD"）を入れようとするとコンパイルで弾ける
  - amount に文字列などを入れるミスも弾ける
*/

// ------------------------------------------------------------
// 2) そのまま表示（入力の確認）
// ------------------------------------------------------------
console.log(dollars);
/*
  期待される出力イメージ：
    { unit: 'USD', amount: 100 }
*/

// ------------------------------------------------------------
// 3) 換算：USD → JPY
// ------------------------------------------------------------
console.log(Currency.exchange(dollars, 'JPY'));
/*
  ✅ ここでの Currency は “値” としての Currency（exchange メソッドを持つオブジェクト）。

  ✅ exchange のアルゴリズム（前モジュールの前提）：
  - rate["USD"] = 1
  - rate["JPY"] = 108（例）

  計算：
    amount = (100 / rate["USD"]) * rate["JPY"]
           = (100 / 1) * 108
           = 10800

  期待される出力イメージ：
    { unit: 'JPY', amount: 10800 }

  ✅ 重要：
  - exchange は新しいオブジェクトを返す（入力 dollars は破壊しない）
  - そのため dollars をあとで再利用しても安全
*/