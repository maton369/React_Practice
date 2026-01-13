// ✅ このコードは TypeScript の「interface による契約（構造の要件）」と、
// class による「実装（implements）」を組み合わせた例である。
//
// ポイント：
// - interface Shape は「名前（name）と面積関数（getArea）を持つこと」を要求する
// - interface Quadrangle は「四角形として辺の情報を持つこと」を要求する（sideA は必須、他は任意）
// - class Rectangle は implements Shape, Quadrangle により、両方の契約を満たす必要がある
// - getArea は長方形の面積（sideA * sideB）を返す純粋な計算
//
// “継承（extends）” ではなく “実装（implements）” なので、
// Rectangle は Shape/Quadrangle の「型契約」を満たすだけで、実装の継承は起きない。

{
    // ------------------------------------------------------------
    // 1) Shape：形状（図形）として最低限必要な機能を定義
    // ------------------------------------------------------------
    interface Shape {
        // ✅ 図形の種別名（識別ラベル）
        // readonly なので、一度作った図形の name を後から変えられない契約になる。
        readonly name: string;

        // ✅ 面積を返す関数
        // 戻り値は number（面積の数値）
        getArea: () => number;
    }

    // ------------------------------------------------------------
    // 2) Quadrangle：四角形として「辺の長さ情報」を定義
    // ------------------------------------------------------------
    interface Quadrangle {
        // ✅ sideA は必須：Quadrangle と名乗る以上、最低1辺は必ずある、という契約
        // （実務的には “四角形なら4辺欲しい” が、ここは例として “必須＋任意” の形にしている）
        sideA: number;

        // ✅ sideB〜sideD は任意（?）
        // - Rectangle では sideA/sideB だけを使う（長方形は2辺で表現できる）
        // - 他の四角形（一般四辺形）では必要に応じて sideC/sideD を使える
        //
        // optional は「無いことも許される」ので型としては number | undefined 的に扱われる。
        sideB?: number;
        sideC?: number;
        sideD?: number;
    }

    // ------------------------------------------------------------
    // 3) Rectangle：Shape と Quadrangle の契約を実装するクラス
    // ------------------------------------------------------------
    class Rectangle implements Shape, Quadrangle {
        // ✅ Shape の要求：readonly name: string を満たす
        readonly name = "rectangle";

        // ✅ Quadrangle の要求：sideA: number を満たす
        // Rectangle は “長方形” なので、必要十分な辺情報として sideA/sideB の2つを保持する。
        sideA: number;

        // ✅ Quadrangle の sideB? は任意だが、Rectangle では必須として持つ（より強い情報を持つのはOK）
        // ここで sideB を必須にしておくと、面積計算で undefined を考慮しなくて済む。
        sideB: number;

        // ✅ constructor：長方形の2辺を受け取り状態として保持する
        constructor(sideA: number, sideB: number) {
            this.sideA = sideA;
            this.sideB = sideB;
        }

        // ✅ getArea：Shape が要求する面積計算メソッド
        // ここでは “メソッド構文” で定義している（getArea() {...}）。
        //
        // アルゴリズム：
        // - 長方形の面積 = sideA * sideB
        //
        // 補足：
        // - Shape では getArea: () => number と “プロパティの関数型” で宣言しているが、
        //   class 側で getArea() メソッドとして実装しても互換になる（呼び出し可能性が一致するため）。
        getArea() {
            return this.sideA * this.sideB;
        }
    }

    // ------------------------------------------------------------
    // 4) 実行：Rectangle を作って面積を出す
    // ------------------------------------------------------------
    const rect = new Rectangle(6, 5);

    // ✅ 6 * 5 = 30 が表示される
    console.log(rect.getArea());

    /*
      型の効果：
      - rect は Rectangle だが、型として Shape として扱うこともできる：
          const s: Shape = rect;
        のように代入でき、getArea と name の契約だけに依存した設計ができる。
      - 同様に Quadrangle として扱えば、辺情報に依存した処理も書ける。
    */
}