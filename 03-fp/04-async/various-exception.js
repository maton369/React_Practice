// ✅ このコードは「カスタム Error クラスを複数定義し、throw して、catch 側で型（instanceof）により分岐する」例である。
// “例外をエラーコードではなく型で表す” ことで、呼び出し側が原因ごとにハンドリングしやすくなる。
// また、予期しない型の例外は `cause` 付きで包んで再 throw し、原因連鎖（エラーの文脈）を保持する。

// ------------------------------------------------------------
// 1) カスタム Error クラス定義
// ------------------------------------------------------------

// ✅ DoubleError / TripleError / QuintupleError はそれぞれ Error を継承したカスタム例外。
// 「2で割り切れる」「3で割り切れる」「5で割り切れる」ケースを型で区別するためのクラスである。
class DoubleError extends Error {
  // ✅ static ブロックは「クラス定義時に1回だけ実行される初期化コード」。
  // ここでは prototype.name を "DoubleError" に設定している。
  //
  // 目的：
  // - 例外オブジェクト e の e.name を分かりやすい名前にする（ログ表示用）
  //
  // 補足：
  // - 通常、Error の name は "Error" になりがちなので、独自名を付けたい場合に設定する。
  // - より一般的には `constructor` 内で `this.name = 'DoubleError'` とする書き方もある。
  static {
    this.prototype.name = "DoubleError";
  }
}

class TripleError extends Error {
  static {
    this.prototype.name = "TripleError";
  }
}

class QuintupleError extends Error {
  static {
    this.prototype.name = "QuintupleError";
  }
}

// ✅ SomeError は「上記いずれの条件にも当てはまらない」場合の例外。
// こちらは name を明示的に変えていないので、環境によっては "Error" のままになることがある。
//（クラス名が name に反映される挙動は実装差があり得るため、確実にしたいなら同様に name を設定するとよい）
class SomeError extends Error {}

// ------------------------------------------------------------
// 2) try ブロック：乱数を生成し、条件に応じて例外を投げる
// ------------------------------------------------------------
try {
  // ✅ num は 0〜99 の整数（Math.random()*100 を floor）
  // - Math.random() ∈ [0,1)
  // - *100 で [0,100)
  // - floor で 0..99 の整数
  const num = Math.floor(Math.random() * 100);
  console.log(num);

  /*
    ✅ 分岐アルゴリズム（重要：評価順が意味を持つ）
    - if / else if は上から順に条件を評価し、最初に true になった分岐だけ実行される。
    - この順序により「複数条件に当てはまる数」の扱いが決まる。

    例：num=30 の場合
      - 30 % 2 === 0 は true なので DoubleError が投げられ、
        3や5で割り切れる判定には到達しない。

    つまりこの設計は「2で割り切れること」を最優先に分類するルールになっている。
  */

  if (num % 2 === 0) {
    // ✅ 2で割り切れる → DoubleError を投げる（throw）
    // throw により try の残り処理は中断され、catch に制御が移る
    throw new DoubleError();
  } else if (num % 3 === 0) {
    // ✅ 3で割り切れる（ただし 2 では割り切れない）→ TripleError
    throw new TripleError();
  } else if (num % 5 === 0) {
    // ✅ 5で割り切れる（ただし 2,3 では割り切れない）→ QuintupleError
    throw new QuintupleError();
  } else {
    // ✅ どれにも該当しない → SomeError
    throw new SomeError();
  }
} catch (e) {
  // ------------------------------------------------------------
  // 3) catch ブロック：instanceof による型判定でハンドリングを分岐
  // ------------------------------------------------------------
  /*
    ✅ instanceof のアルゴリズム（概念）
    - e のプロトタイプチェーン上に DoubleError.prototype が存在するか？
      → 存在すれば e instanceof DoubleError は true
    - つまり「e が DoubleError（またはその派生）として生成されたか」を判定できる

    このコードは「例外の型に応じた処理」を if/else で実装している。
    言い換えると、例外を “値” ではなく “型” で分類している。
  */

  if (e instanceof DoubleError) {
    // ✅ DoubleError の場合
    // e.name は static ブロックで "DoubleError" に設定されている想定
    console.error(`${e.name}: divisible by 2`);
  } else if (e instanceof TripleError) {
    // ✅ TripleError の場合
    console.error(`${e.name}: divisible by 3`);
  } else if (e instanceof QuintupleError) {
    // ✅ QuintupleError の場合
    console.error(`${e.name}: divisible by 5`);
  } else {
    /*
      ✅ それ以外（想定外）：
      - ここに来るのは SomeError のケースも含み得るが、
        このコードでは SomeError を “想定外” 扱いにしている。
        （= SomeError をハンドリングしない設計）

      ✅ 例外のラッピング（原因連鎖）
      - new Error("unexpected error", { cause: e }) として、
        元の例外 e を cause として保持しつつ、新しい文脈の Error を投げ直す。
      - これにより「上位層で unexpected error を見つつ、根本原因は cause で辿れる」。
    */
    throw new Error("unexpected error", { cause: e });
  }
}

/*
  ✅ 実行結果のパターン（概念）
  - num が偶数：DoubleError を投げ → catch で divisible by 2
  - num が奇数かつ 3 の倍数：TripleError → divisible by 3
  - num が奇数かつ 3 の倍数ではなく 5 の倍数：QuintupleError → divisible by 5
  - それ以外：SomeError → catch の else に入り、unexpected error を cause 付きで再 throw
*/