// ✅ このコードは TypeScript で「既存の型（Currency）を拡張して Payment 型を作る」方法を
// interface と type の2通りで比較する例である。
//
// 重要ポイント：
// - Unit は文字列リテラル union で、通貨単位を有限集合に制限する
// - Currency は “通貨” の基本形（unit + amount）
// - Payment は “通貨 + 日付(date)” という合成データ
// - interface 拡張：`interface IPayment extends Currency { date: Date }`
// - type 合成：`type TPayment = Currency & { date: Date }`（intersection で AND 合成）
//
// アルゴリズム的には：
// - Currency という基底のデータ構造（unit, amount）に、date を “足して” 新しい構造（Payment）を作る
// - その結果、Payment は「支払い金額」と「発生日時」が必ずセットで存在する契約になる

{
    // ------------------------------------------------------------
    // 1) Unit：通貨単位を有限集合に制限（typo 防止）
    // ------------------------------------------------------------
    type Unit = "USD" | "EUR" | "JPY" | "GBP";

    // ------------------------------------------------------------
    // 2) Currency：通貨データの最小構造
    // ------------------------------------------------------------
    interface Currency {
        // ✅ unit は Unit のどれかでなければならない
        unit: Unit;

        // ✅ amount は金額（number）
        // 実務なら最小通貨単位で整数管理する設計もあるが、ここでは number として扱う。
        amount: number;
    }

    // ------------------------------------------------------------
    // 3-A) IPayment：interface extends による拡張
    // ------------------------------------------------------------
    interface IPayment extends Currency {
        // ✅ 支払い日時（Date オブジェクト）
        // Currency の unit/amount に加えて date を必須にする。
        date: Date;
    }
    /*
      ✅ extends の意味：
      - IPayment は Currency の要件（unit, amount）をすべて引き継ぐ
      - さらに date を追加要件として課す
      - “Currency を満たす” ことが “IPayment の一部条件” になる
    */

    // ------------------------------------------------------------
    // 3-B) TPayment：type の intersection（&）による合成
    // ------------------------------------------------------------
    type TPayment = Currency & {
        // ✅ Currency の構造に date: Date を AND 条件で合体させる
        date: Date;
    };
    /*
      ✅ intersection（&）の意味：
      - TPayment は「Currency であり、かつ { date: Date } でもある」型
      - つまり unit/amount/date をすべて持つ必要がある
  
      ✅ この例では IPayment と TPayment は “同じ形状” を表すため、
      利用側の感覚はほぼ同等になる。
    */

    // ------------------------------------------------------------
    // 4) date：支払い日時を作る
    // ------------------------------------------------------------
    const date = new Date("2022-09-01T12:00+0900");
    /*
      ✅ new Date(...) は与えた日時文字列から Date オブジェクトを生成する。
      "2022-09-01T12:00+0900" は JST(+0900) を明示しているので、
      タイムゾーンを含めた日時として解釈される。
    */

    // ------------------------------------------------------------
    // 5) payA / payB：それぞれ interface 版 / type 版の Payment を作る
    // ------------------------------------------------------------
    const payA: IPayment = { unit: "JPY", amount: 10000, date };
    /*
      ✅ IPayment の契約：
      - unit: Unit
      - amount: number
      - date: Date
      をすべて満たす必要がある
    */

    const payB: TPayment = { unit: "USD", amount: 100, date };
    /*
      ✅ TPayment（Currency & {date}）の契約も同じく
      unit/amount/date が必須
    */

    // ------------------------------------------------------------
    // 6) 出力：実行時にはただの JS オブジェクトとして表示される
    // ------------------------------------------------------------
    console.log(payA);
    console.log(payB);

    /*
      補足（extends と & の使い分けの観点）：
      - interface extends：
        - “オブジェクトの形状” を拡張していく設計（階層化）と相性が良い
        - 宣言マージも使える
      - type intersection：
        - 複数の型を AND 合成したいときに強力（union/intersection など型演算に強い）
  
      この例のように単純な合成なら、どちらでもほぼ同じ結果になる。
    */
}