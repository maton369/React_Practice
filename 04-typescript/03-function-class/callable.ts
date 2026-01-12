// ✅ このコードは TypeScript で「関数の型（call signature）」を定義する3つの方法を比較する例である。
// どれも “(n: number, m: number) を受け取り number を返す関数” という同一の契約を表すが、
// - 型を再利用したい（名前を付けたい） → interface / type alias
// - その場限りで書きたい → インラインのオブジェクト型
// - 関数型として短く書きたい → (n: number, m: number) => number
// といった使い分けになる。
//
// また、各ブロック { ... } はスコープを分けるために置かれており、同名 add/subtract を衝突させない。

// ------------------------------------------------------------
// 1) インターフェースで定義（名前付きの関数型を作って再利用する）
// ------------------------------------------------------------
{
    // ✅ interface NumOp { (n: number, m: number): number; }
    // これは「オブジェクトのプロパティ」ではなく “呼び出し可能性” を表すシグネチャ（call signature）。
    // つまり NumOp 型の値は
    //   NumOp(n, m)
    // のように関数として呼べる必要がある。
    //
    // アルゴリズム的に言うと：
    // - NumOp は「入力（number, number）→ 出力（number）」という写像（関数）の型を固定する。
    interface NumOp {
        (n: number, m: number): number;
    }

    // ✅ add に NumOp を付けることで、
    // add は必ず (number, number) -> number の関数でなければならない、という契約を課す。
    // 右辺は function expression だが、引数型を書かなくても NumOp から推論される（文脈型付け）。
    const add: NumOp = function (n, m) {
        // ✅ アルゴリズム：加算（n + m）
        return n + m;
    };

    // ✅ subtract も NumOp を満たす必要がある。
    // アロー関数でも同様に契約が適用される。
    const subtract: NumOp = (n, m) => n - m;

    // ✅ 実行：add(1,2)=3、subtract(7,2)=5
    console.log(
        add(1, 2),
        subtract(7, 2),
    );
}

// ------------------------------------------------------------
// 2) インラインで定義（その場で call signature を書く）
// ------------------------------------------------------------
{
    // ✅ { (n: number, m: number): number } は “呼び出し可能なオブジェクト型” をその場で書いたもの。
    // 実質的には上の NumOp と同じ意味だが、名前がないので再利用はしづらい。
    //
    // 使いどころ：
    // - その1箇所だけで使う
    // - 名前を付けるほどではない
    const add: { (n: number, m: number): number } = function (n, m) {
        return n + m;
    };

    const subtract: { (n: number, m: number): number } = (n, m) => n - m;

    console.log(
        add(1, 2),
        subtract(7, 2),
    );
}

// ------------------------------------------------------------
// 3) インラインで “関数型構文” によって定義（最も短い表記）
// ------------------------------------------------------------
{
    // ✅ (n: number, m: number) => number は TypeScript の関数型（function type）構文。
    // これは「引数2つを取り number を返す関数」を最短で表せる。
    //
    // 上の2つ（NumOp / {call signature}）と表現は違うが、型としての意味は同じ。
    const add: (n: number, m: number) => number = function (n, m) {
        return n + m;
    };

    // ✅ subtract はアロー関数で自然に書ける（こちらが一般的）
    const subtract: (n: number, m: number) => number = (n, m) => n - m;

    console.log(
        add(1, 2),
        subtract(7, 2),
    );
}

/*
  ✅ まとめ（3方式の意味の差）
  - interface 方式：
    - 名前を付けて再利用できる（複数の演算関数に同じ型を付けるなど）
    - 拡張（interface merging 等）とも相性がある
  - インラインの call signature：
    - 1回限りで使うとき便利だが、冗長になりやすい
  - 関数型構文 (..)=>..：
    - 最短で読みやすく、実務で最もよく見かける書き方

  いずれも “(number, number) -> number の写像” を型として固定し、
  add/subtract が契約を満たしているかをコンパイル時に検証する、という目的は共通である。
*/