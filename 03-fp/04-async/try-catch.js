// ✅ このコードは、try/catch/finally の制御フロー（例外伝播と return の関係）と、
// Null 合体演算子 ?? によるフォールバックを同時に確認する例である。
//
// 観察ポイント：
// - try ブロック内で throw すると、以降の try の処理は中断され catch へジャンプする
// - catch は例外を受け取り、ここでは「値と型」を出力する
// - finally は成功でも失敗でも必ず実行される（return があっても実行される）
// - throw する値は Error でなくてもよい（ここでは number の 1234 を投げている）
// - catch 内で return していないため、例外が起きた場合 doIt の戻り値は undefined になる
// - `doIt() ?? ""` は doIt() が null または undefined のときだけ "" に置き換える

function doIt() {
  try {
    // ✅ 乱数で成功/失敗を決める
    // Math.random() は [0,1) の値を返し、0.5 未満なら成功扱い
    const isSucceeded = Math.random() < 0.5;

    if (isSucceeded) {
      // ✅ 成功ルート：例外は投げず、ログを出すだけ
      console.log("Fulfilled");
    } else {
      // ✅ 失敗ルート：例外を投げる（throw）
      //
      // 重要：throw は Error オブジェクトに限らない。
      // JS では任意の値（number, string, object など）を投げられる。
      // ここでは 1234（number）を投げている。
      throw 1234;
    }

    // ✅ ここまで到達するのは「成功ルート」だけ
    // try の中で return すると、関数は返ろうとするが、
    // その前に finally が必ず実行される。
    return "Returned";
  } catch (e) {
    /*
      ✅ catch に来る条件：
      - try 内で throw が実行された場合
      - または try 内で実行された処理が例外を投げた場合

      e は throw された値そのもの。
      ここでは e = 1234 で、typeof e は "number" になる。

      console.error(e, ":", typeof e);
      → 例：1234 : number
    */
    console.error(e, ":", typeof e);

    /*
      ⚠️ ここで return していない点が重要：
      - catch ブロックが終わると、関数 doIt は “何も返さず終了” する
      - JS の関数は return が無いと暗黙に undefined を返す
      つまり失敗ルートの doIt() の戻り値は undefined になる。
    */
  } finally {
    /*
      ✅ finally の性質：
      - try が正常終了しても
      - catch に入っても
      - try/catch 内で return しようとしても
      常に最後に実行される（後処理の保証）

      ここでは必ず "Completed" が出る。
    */
    console.log("Completed");
  }
}

// ------------------------------------------------------------
// doIt() の結果を result に入れて表示する
// ------------------------------------------------------------

// ✅ doIt() の戻り値は分岐で変わる：
// - 成功ルート： "Returned"（文字列）
// - 失敗ルート： undefined（catch が return しないため）
//
// Null 合体演算子 ?? は、左辺が null または undefined のときだけ右辺を採用する。
// よって：
// - 成功時： "Returned" ?? "" → "Returned"
// - 失敗時： undefined ?? "" → ""
const result = doIt() ?? "";

// ✅ 最終的に result を表示
// 成功時：Returned
// 失敗時：（空文字が表示される、見た目は何も出ないこともある）
console.log(result);

/*
  ✅ 出力パターン（概念）

  成功した場合：
  Fulfilled
  Completed
  Returned

  失敗した場合：
  1234 : number   （console.error のため表示形式は環境差あり）
  Completed
  （空文字なので何も見えないこともある）
*/