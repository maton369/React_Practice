// ✅ このコードは TypeScript で「為替レート表（辞書）」を元に通貨換算を行うモジュール例である。
// ポイントは、レート表 `rate` から `keyof typeof rate` を使って Unit（通貨単位）を自動導出し、
// `Currency.unit` をその Unit に制約することで「存在しない通貨コード」を型レベルで排除している点にある。
//
// アルゴリズム的には：
// 1) rate を “通貨コード → 基準通貨に対するレート” の辞書として持つ
// 2) 換算したい通貨 currency を、まず基準通貨（ここでは USD=1 を基準とする想定）へ正規化する
// 3) 基準通貨金額に、目標通貨 unit のレートを掛けて変換する
//    - USD へ：amount / rate[from]
//    - target へ：(...)* rate[to]
// 4) { unit, amount } を返す（純粋関数っぽく入力を壊さない）

// ------------------------------------------------------------
// 1) rate：通貨コード→レート の辞書（連想配列）
// ------------------------------------------------------------
const rate: { [unit: string]: number } = {
    USD: 1,
    EUR: 0.9,
    JPY: 108,
    GBP: 0.8,
};
/*
  ✅ rate の意味（前提）：
  - ここでは USD を基準（USD: 1）として、
    他通貨が “1 USD あたりいくらか” のようなスケールで定義されている想定。

  例：
  - EUR: 0.9 なら「1 USD = 0.9 EUR」という関係
  - JPY: 108 なら「1 USD = 108 JPY」という関係

  ⚠️ 注意：
  - これは固定値の例であり、実際の為替は変動する
  - 精度や丸め（小数点）などは用途に応じて設計が必要
*/

// ------------------------------------------------------------
// 2) Unit：rate のキーから通貨コード union を自動導出
// ------------------------------------------------------------
type Unit = keyof typeof rate;
/*
  ✅ keyof typeof rate のアルゴリズム：
  - typeof rate で “rate の型（オブジェクト型）” を取得
  - keyof でそのキー集合を union にする

  期待されるイメージ：
    Unit = "USD" | "EUR" | "JPY" | "GBP"

  ✅ ねらい：
  - rate に新しい通貨を追加したら Unit も自動で増える
  - Unit に存在しない文字列（例："AUD"）を currency.unit に入れられない

  ⚠️ ただし重要な落とし穴：
  - rate の型注釈が `{ [unit: string]: number }` になっているため、
    コンパイラ的にはキーが “任意の string” と解釈されやすく、
    Unit が string になってしまう可能性がある。
  - 本当に "USD" | "EUR" | ... の union を得たいなら、
    `as const` を付けてキーをリテラルとして固定するのが定石。
*/

// ------------------------------------------------------------
// 3) Currency：通貨オブジェクトの型（単位 + 金額）
// ------------------------------------------------------------
interface Currency {
    unit: Unit;      // ✅ 通貨単位は Unit（rate に存在するものだけ）
    amount: number;  // ✅ 金額（数値）
}

// ------------------------------------------------------------
// 4) Currency（値としてのオブジェクト）：exchange メソッドを提供
// ------------------------------------------------------------
const Currency = {
    // ✅ exchange は「通貨オブジェクトを別単位へ換算」する操作
    exchange(currency: Currency, unit: Unit): Currency {
        /*
          ✅ 換算アルゴリズム（2段階）：
    
          from = currency.unit
          to   = unit
    
          1) 入力金額を “基準通貨（USD）” に戻す：
             baseAmount = currency.amount / rate[from]
    
             例）108 JPY を USD に戻す（rate["JPY"]=108）：
               baseAmount = 108 / 108 = 1 USD
    
          2) 基準通貨金額を “目的通貨（to）” に変換する：
             converted = baseAmount * rate[to]
    
             例）1 USD を EUR に変換（rate["EUR"]=0.9）：
               converted = 1 * 0.9 = 0.9 EUR
    
          よって：
            converted = (amount / rate[from]) * rate[to]
        */
        const amount = (currency.amount / rate[currency.unit]) * rate[unit];

        // ✅ 返り値は新しいオブジェクト（入力を破壊しない）
        return { unit, amount };
    },
};
/*
  ✅ 設計意図：
  - Currency は型（interface）と、値（換算機能を持つオブジェクト）で同名になっている
  - TypeScript では “型空間” と “値空間” が別なので、同名でも成立する

  ⚠️ ただし読み手には混乱しやすいので、
  例：CurrencyType / CurrencyUtil のように分ける設計もよく使われる
*/

// ------------------------------------------------------------
// 5) export：このモジュールが提供する API
// ------------------------------------------------------------
export { Currency };
/*
  ✅ 他ファイルから
    import { Currency } from './...';
  として exchange を使えるようになる。
*/