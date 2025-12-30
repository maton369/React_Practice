/*
  ✅ このコードは「ES6 class 構文を使わずに」、
  古典的な JavaScript の仕組み（関数コンストラクタ + this + prototype）で
  クラスっぽい振る舞い（インスタンス生成、メソッド、静的メソッド、継承）を作っている例である。

  特に重要なのは次の3点：
  - `new` のインスタンス生成アルゴリズム
  - 「メソッドをインスタンスに直接持たせる」設計（各インスタンスに関数が複製される）
  - 継承を `call` と prototype チェーンで実現している点

  ------------------------------------------------------------
  1) new Bird(name) の生成アルゴリズム（概念）
  ------------------------------------------------------------
  `new Bird("ペンギン")` は、概念的に以下の手順で動く。

  (1) 空オブジェクト obj を作る
  (2) obj.[[Prototype]] = Bird.prototype を設定する
  (3) Bird 関数を this=obj として呼ぶ（Bird.call(obj, "ペンギン") 相当）
  (4) Bird がオブジェクトを return したらそれを採用し、
      そうでなければ obj を返す

  このコードでは Bird の最後で `return this;` しているので、
  実質的に (4) は this（= obj）を返すことになる。

  ※ ただし “コンストラクタで return this; は不要” で、一般的には書かない。
     new は暗黙に this を返すためである（オブジェクトを明示 return する特殊ケースを除く）。

  ------------------------------------------------------------
  2) className は private 相当（クロージャで隠蔽される）
  ------------------------------------------------------------
  Bird コンストラクタ内で `const className = "鳥類";` を定義している。

  これはインスタンスのプロパティではなく、
  - Bird が呼ばれたときに生成される “ローカル変数”
  - そして introduce メソッドがその変数を参照し続ける（クロージャ）
  という形で隠蔽される。

  つまり、ES2022 の `#private` フィールドのような “言語機能としてのprivate” ではないが、
  「外から className を直接触れない」という意味で private 相当のデータになる。

  ただし注意：
  - Bird を呼ぶたびに className 変数の領域も生成される
  - introduce 関数も毎回生成され、その className を閉じ込める
  → つまりインスタンスごとにメモリを消費する（後述）

  ------------------------------------------------------------
  3) インスタンスメソッドを this に直接付けている（複製される）
  ------------------------------------------------------------
  Bird 内で

    this.cry = function(...) { ... }
    this.introduce = function() { ... }

  としているため、Bird を new するたびに
  - 新しい関数オブジェクトが2つ生成され
  - それがインスタンスのプロパティとして格納される

  アルゴリズム的に言うと、
  「メソッド探索（プロトタイプチェーン）」は不要で、
  常にインスタンス自身のプロパティから関数が見つかる。

  これは分かりやすい一方で、
  大量にインスタンスを作ると、同じ処理の関数が大量複製されメモリ効率が悪くなる。

  クラス構文（または prototype にメソッドを置く流儀）では
  - Bird.prototype.cry = function(...) { ... }
  のようにして「関数を共有」するのが一般的。

  ------------------------------------------------------------
  4) 静的メソッド Bird.explain（クラス側の関数）
  ------------------------------------------------------------
  `Bird.explain = function(){...}` は Bird 関数オブジェクトのプロパティであり、
  インスタンスではなく “クラス相当” に付く機能である。

  - Bird.explain() は呼べる
  - penguin.explain() は通常呼べない（インスタンス側に explain がない）

  ------------------------------------------------------------
  5) FlyableBird の継承アルゴリズム：call による親コンストラクタ実行
  ------------------------------------------------------------
  FlyableBird の中で

    Bird.call(this, name);

  を実行している。

  これは “親クラスの初期化処理を、このインスタンスに対して実行する” という意味で、
  class 構文でいう `super(name)` の役割に相当する。

  - Bird の中で this.name, this.cry, this.introduce が設定され
  - FlyableBird で this.fly が追加される
  ことで、1つのインスタンスが「親の機能 + 子の機能」を持つ。

  ------------------------------------------------------------
  6) prototype チェーンの設定：Object.setPrototypeOf(...)
  ------------------------------------------------------------
  最後の

    Object.setPrototypeOf(FlyableBird.prototype, Bird.prototype);

  は、
  - FlyableBird.prototype の親（[[Prototype]]）を Bird.prototype にする
  という設定であり、メソッド探索経路（プロトタイプチェーン）を繋ぐための処理である。

  ただし注意：
  このコードでは Bird のメソッドを prototype ではなく “インスタンスに直付け” しているので、
  実際には継承のための prototype チェーンは今の例だと効果が薄い。
  （hawk.cry は Bird.call(this, name) でインスタンスに直接作られているため）

  もし Bird.prototype にメソッドを置く設計にすると、
  この prototype チェーン設定が効いて「子インスタンスが親メソッドを共有して呼べる」ようになる。

  ------------------------------------------------------------
  7) 実行結果（何が出力されるか）
  ------------------------------------------------------------
  Bird.explain()
    -> これは鳥のクラスです

  penguin.introduce()
    -> 私は鳥類のペンギンです

  hawk.cry("ピィィー")
    -> タカが「ピィィー」と鳴きました

  hawk.fly()
    -> タカが飛びました
*/

function Bird(name) {
  // ✅ クロージャで隠蔽される private 相当データ（インスタンスプロパティではない）
  const className = "鳥類";

  // ✅ インスタンスの公開プロパティ（外から参照できる）
  this.name = name;

  // ✅ インスタンスにメソッドを直付け：new のたびに関数が生成される（共有されない）
  this.cry = function (sound) {
    console.log(`${this.name}が「${sound}」と鳴きました`);
  };

  // ✅ className を参照するため introduce はクロージャになる
  //    → 外から className を触れないが、インスタンスごとに関数が生成される
  this.introduce = function () {
    console.log(`私は${className}の${this.name}です`);
  };

  // ⚠️ new を使う場合、通常 return this は不要（暗黙に this が返る）
  return this;
}

// ✅ “静的メソッド” 相当：Bird（関数オブジェクト）に直接ぶら下がる
Bird.explain = function () {
  console.log(`これは鳥のクラスです`);
};

function FlyableBird(name) {
  /*
    ✅ 親コンストラクタを this に対して実行（super(name) 相当）
    ------------------------------------------------------------
    - Bird の初期化ロジックを流用し、
      this.name / this.cry / this.introduce をこのインスタンスに設定する。
  */
  Bird.call(this, name);

  // ✅ 子クラス独自の機能を追加（これもインスタンス直付けなので複製される）
  this.fly = function () {
    console.log(`${this.name}が飛びました`);
  };

  // ⚠️ これも通常不要（new が暗黙に this を返す）
  return this;
}

// ✅ プロトタイプチェーン接続：FlyableBird.prototype -> Bird.prototype
// ただし現状はメソッドがインスタンス直付けなので、効果が薄い（設計を prototype 共有にすると活きる）
Object.setPrototypeOf(FlyableBird.prototype, Bird.prototype);

// ✅ 静的メソッド呼び出し（クラス相当から）
Bird.explain();

// ✅ Bird インスタンス生成（new により this が作られ Bird が初期化する）
const penguin = new Bird("ペンギン");
penguin.introduce();

// ✅ FlyableBird インスタンス生成（内部で Bird.call により親の初期化を適用）
const hawk = new FlyableBird("タカ");
hawk.cry("ピィィー");
hawk.fly();