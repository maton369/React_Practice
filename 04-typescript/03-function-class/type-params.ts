// ✅ このコードは TypeScript の「ジェネリクス（型パラメータ）」と「デフォルト型引数」を使って、
// “エラーを分類するためのラッパ型” を定義する例である。
//
// 目的：
// - error（例外そのもの）だけを投げる/返すのではなく、
//   そのエラーが「どの種類（syntax/logic/runtime）か」というメタ情報を一緒に持たせたい。
// - error の具体型は状況により変わり得るので、ジェネリクスで拡張可能にする。
//
// 重要ポイント：
// - interface CustomError<E = Error> の `E = Error` は「型引数を省略したら Error を使う」という意味
// - `type` は文字列リテラル union で、取り得る値が 'syntax' | 'logic' | 'runtime' に制限される
// - `error: E` により、error フィールドは “E 型のエラー” を必ず持つ契約になる

// ------------------------------------------------------------
// 1) CustomError<E>：分類情報 + 実エラーをまとめる型
// ------------------------------------------------------------
interface CustomError<E = Error> {
    // ✅ type は “有限集合” に制限された分類タグ（discriminant）
    // - 'syntax'   : 構文や入力形式の問題
    // - 'logic'    : ロジック上の矛盾・想定外条件
    // - 'runtime'  : 実行時エラー（I/O 失敗など）
    //
    // アルゴリズム的には：
    // - エラー処理を switch(type) で分岐しやすくするための “タグ” になっている。
    type: 'syntax' | 'logic' | 'runtime';

    // ✅ error はジェネリクス E 型
    // - E を指定すれば、error の中身の型を強く固定できる
    // - 指定しない場合はデフォルトで Error になる
    error: E;
}

// ------------------------------------------------------------
// 2) tokenError：CustomError の型引数を省略した例（= E は Error）
// ------------------------------------------------------------
const tokenError: CustomError = {
    /*
      ✅ ここで CustomError の型引数は省略されているので、
      tokenError の型は CustomError<Error> と同等になる。
      したがって error は Error 型である必要がある。
    */

    // ✅ type は union で許された値の1つでなければならない
    type: 'syntax',

    // ✅ error は Error 型の値
    // new Error(...) は標準の Error インスタンスを生成する
    error: new Error('Unexpected Token'),
};

// ------------------------------------------------------------
// 3) 出力：実行時にはただのオブジェクトとして表示される
// ------------------------------------------------------------
console.log(tokenError);

/*
  補足（拡張の仕方の例）：
  - もし独自のエラー型（例：class TokenizeError extends Error）を使いたいなら
    const e: CustomError<TokenizeError> = { type: 'syntax', error: new TokenizeError(...) }
    のように型引数 E を変えるだけで、error の型がより厳密になる。

  - さらに type を discriminant にした “判別可能なユニオン” に発展させると、
    type ごとに error の型や追加情報（line, column など）を変える設計もできる。
*/