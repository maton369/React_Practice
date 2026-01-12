// ✅ このコードは「継承（extends）ではなく合成（composition）」で “正方形の面積” を実装する例である。
// Square は Rectangle を継承せず、自分の状態（side）だけを持ち、
// 面積計算のときだけ Rectangle を生成してロジックを再利用している。
//
// 重要ポイント：
// - Rectangle は「長方形」の一般形として、面積 = sideA * sideB を提供する
// - Square は「正方形」なので 1 辺 side のみ持てば十分
// - Square.getArea は「正方形を長方形（side, side）として扱う」という “帰着” により面積を求める
// - ただしこの実装は毎回 new Rectangle(...) を作るので、計算だけなら直接 side*side の方が軽い
//   → ここは「設計の見本（合成による再利用）」としての意義が大きい

{
    // ------------------------------------------------------------
    // 1) Rectangle：長方形のクラス（面積計算の一般形）
    // ------------------------------------------------------------
    class Rectangle {
        // ✅ クラス識別用の固定ラベル
        // readonly なので、生成後に rect.name = ... の再代入は TypeScript 上禁止される。
        readonly name = "rectangle";

        // ✅ 長方形の2辺（幅・高さ）
        sideA: number;
        sideB: number;

        // ✅ constructor：2辺を受け取り、インスタンスの状態として保持
        constructor(sideA: number, sideB: number) {
            this.sideA = sideA;
            this.sideB = sideB;
        }

        // ✅ 面積アルゴリズム：長方形の面積 = sideA * sideB
        // アロー関数プロパティなので this がインスタンスに束縛されやすい。
        getArea = () => this.sideA * this.sideB;
    }

    // ------------------------------------------------------------
    // 2) Square：正方形のクラス（Rectangle を継承しない）
    // ------------------------------------------------------------
    class Square {
        // ✅ クラス識別用ラベル（固定）
        readonly name = "square";

        // ✅ 正方形は一辺 side だけで十分（本質的状態）
        side: number;

        // ✅ constructor：一辺を受け取り保持する
        constructor(side: number) {
            this.side = side;
        }

        // ✅ 面積アルゴリズム（合成による再利用）
        // 正方形の面積は side^2 だが、ここでは
        //   「正方形 = (side, side) の長方形」
        // と見なして Rectangle の面積計算を使う。
        //
        // 手順（概念）：
        // 1) Rectangle(this.side, this.side) を作る
        // 2) その getArea() を呼ぶ
        // 3) sideA*sideB = side*side が返る
        //
        // ✅ 注意（設計上のコスト）：
        // - getArea を呼ぶたびに Rectangle インスタンスを生成する（オブジェクト生成コスト）
        // - 面積だけが目的なら `this.side * this.side` の方がシンプルで高速
        // - それでもこの形を選ぶ理由は「ロジックを1箇所に集約して再利用する」設計例として分かりやすいから
        getArea = () => new Rectangle(this.side, this.side).getArea();
    }

    // ------------------------------------------------------------
    // 3) 実行：Square を作って面積を出す
    // ------------------------------------------------------------
    const sq = new Square(5);

    // ✅ sq.getArea():
    // - new Rectangle(5,5) を作る
    // - getArea() が 5*5 = 25 を返す
    console.log(sq.getArea());
}