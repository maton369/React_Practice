// ✅ このコードは TypeScript の class 継承（extends）を使って、
// - Rectangle（長方形）を基底クラスとして定義し
// - Square（正方形）を派生クラスとして拡張する
// という OOP（オブジェクト指向）の基本構造を示している。
//
// 観察ポイント：
// - extends により Square は Rectangle のフィールド/メソッド（getArea など）を継承する
// - super(...) は “親クラスの constructor” を呼び、基底クラス側の初期化を行う
// - name フィールドの上書き（override）と readonly の扱い
// - getArea をアロー関数プロパティで持つため this が固定されやすい
//
// ⚠️ 注意：このコードは name の宣言と代入の整合がやや危うい。
// Square 側で `readonly name = "square";` としているのに、constructor 内で `this.name = "square";` と再代入している。
// readonly は “再代入禁止” なので TypeScript では通常エラーになる（または設定次第で警告/エラー）。
// ここでは “継承で name を上書きしたい” という意図は分かるので、コメントで挙動を解説する。

{
    // ------------------------------------------------------------
    // 1) 基底クラス Rectangle：長方形
    // ------------------------------------------------------------
    class Rectangle {
        // ✅ name はインスタンスの種別ラベル（ただし readonly ではないので再代入可能）
        name = "rectangle";

        // ✅ 長方形の辺の長さ（幅・高さ）
        sideA: number;
        sideB: number;

        // ✅ constructor：new Rectangle(a, b) のときに a,b を状態として保持する
        constructor(sideA: number, sideB: number) {
            this.sideA = sideA;
            this.sideB = sideB;
        }

        // ✅ 面積アルゴリズム：長方形の面積 = sideA * sideB
        // アロー関数プロパティなので this が外側（生成されたインスタンス）に束縛されやすい
        getArea = () => this.sideA * this.sideB;
    }

    // ------------------------------------------------------------
    // 2) 派生クラス Square：正方形（Rectangle を継承）
    // ------------------------------------------------------------
    class Square extends Rectangle {
        // ✅ name を "square" に固定したい意図（readonly）
        // ただし親クラスにも name があり、ここで “上書き（override）” している。
        readonly name = "square";

        // ✅ 正方形は side だけ持てば十分（本質は一辺が同じ）
        side: number;

        constructor(side: number) {
            /*
              ✅ super(side, side)：
              - Square は Rectangle の constructor を持つので、
                派生クラスの constructor では super(...) を最初に呼ぶ必要がある（JS のルール）
              - super(side, side) は “長方形の2辺が同じ” として親を初期化する
                → 結果的に sideA = side, sideB = side となり、getArea がそのまま使える
      
              アルゴリズム的には：
              - 正方形の面積 = side^2
              - それを「長方形の面積計算 sideA * sideB」に帰着させて再利用している
                (sideA=sideB=side にすることで同じ計算式になる)
            */
            super(side, side);

            // ✅ 正方形専用のプロパティ side を保持
            // これにより “正方形らしい表現” として一辺が明示できる
            this.side = side;

            // ⚠️ この行は readonly と衝突し得る：
            // Square で readonly name を宣言しているため、一般には再代入できない。
            // さらに、親クラス側にも name があるため、設計としては
            // - 親を readonly にして override で確定する
            // - あるいは getter にする
            // - あるいは name を親に置かず派生ごとに持つ
            // など、どちらかに統一するのが安全。
            this.name = "square";
        }
    }

    // ------------------------------------------------------------
    // 3) インスタンス生成：Square を作って面積を出す
    // ------------------------------------------------------------
    const sq = new Square(5);

    // ✅ sq は Rectangle を継承しているので getArea() を持つ
    // super(5,5) により sideA=5, sideB=5 となるため、
    // getArea() = 5 * 5 = 25
    console.log(sq.getArea());
}