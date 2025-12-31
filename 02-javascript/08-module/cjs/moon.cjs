/*
  ✅ このコードは Node.js の CommonJS 形式で「1つのオブジェクトをモジュールとして公開」している例である。

  ------------------------------------------------------------
  1) 何をしているコードか（結論）
  ------------------------------------------------------------
  - `moon` というオブジェクトを作り、
    - modifier という状態（プロパティ）
    - transform という振る舞い（メソッド）
    を持たせている。
  - それを `module.exports` に代入することで、
    このファイルを require(...) した側に `moon` を渡せるようにしている。

  ------------------------------------------------------------
  2) transform() の this バインディングの仕組み
  ------------------------------------------------------------
  `transform()` は「メソッド呼び出し」で使われることを想定している。

    const moon = require('./moon');
    moon.transform();

  のように `moon.transform()` の形で呼ぶと、
  JS の呼び出し規則により transform 内の `this` は `moon` を指す。

  つまり
    this.modifier  -> moon.modifier -> 'prism'
  となり、ログは
    "Moon prism power, make up!"
  になる。

  ⚠️ 注意：this は “関数をどう呼ぶか” で決まる
  ------------------------------------------------------------
  例えば

    const { transform } = moon;
    transform();

  のようにメソッドを取り出して単独で呼ぶと、
  `this` は moon ではなく undefined（strict mode）や global になる可能性がある。
  その場合 this.modifier が読めずエラーになり得る。

  なので「this を使うメソッド」は基本 `obj.method()` の形で呼ぶのが安全。

  ------------------------------------------------------------
  3) CommonJS の export アルゴリズム（概念）
  ------------------------------------------------------------
  Node.js では各ファイルは “モジュール” として評価され、
  `module.exports` に代入された値が、そのモジュールの公開値になる。

  - 初期状態：module.exports は空オブジェクト {}
  - `module.exports = moon;` により公開値が moon に置き換わる
  - require(...) した側は、その公開値（moon）を受け取る

  つまり、このファイルは “moon という単一オブジェクトを export するモジュール” になる。

  ------------------------------------------------------------
  4) 参考：ES Modules との対比
  ------------------------------------------------------------
  近年は `export default moon;` のような ES Modules も多いが、
  このコードは CommonJS なので Node.js の `require` / `module.exports` とセットで使う。

  例：
    const moon = require('./moon');
*/

const moon = {
  // ✅ 状態（プロパティ）：this.modifier で参照される
  modifier: 'prism',

  // ✅ メソッド：moon.transform() の形で呼ぶと this は moon を指す
  transform() {
    console.log(`Moon ${this.modifier} power, make up!`);
  },
};

// ✅ CommonJS のエクスポート：このモジュールの公開値を moon にする
module.exports = moon;