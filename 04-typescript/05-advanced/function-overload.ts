// ✅ このコードは TypeScript の「関数オーバーロード（呼び出し側の型を複数定義）」と、
// 実装側での「型ガード（instanceof / undefined 判定）」を組み合わせて、
// 引数の種類に応じて処理を分岐する例である。
//
// 重要ポイント：
// - TypeScript のオーバーロードは “実装が1つ + 宣言が複数” という形になる
//  （複数のシグネチャ宣言で呼び出し可能性を定義し、最後に実体関数でまとめて実装する）
// - 実装関数の引数は union で受ける（Brooch | Compact | undefined）
// - 実行時に型情報を持つのはクラス（Brooch, CosmicCompact, CrisisCompact）だけ
//   → interface（Compact）は実行時には存在しないため、instanceof Compact はできない
// - そのため分岐は「クラスで判定できるものは instanceof」「それ以外は undefined 判定や else」に落とす
//
// アルゴリズム的には：
// 1) コンパイル時：与えられた引数に合うオーバーロード宣言があるかをチェックする（型で入口を制限）
// 2) 実行時：実装関数で instanceof / undefined 判定を使って分岐し、適切な処理（ログ）を行う

// ------------------------------------------------------------
// 1) Brooch：実行時に判定できる “クラス”
// ------------------------------------------------------------
class Brooch {
    // ✅ インスタンスが持つプロパティ
    // ここでは変身アイテムの識別子のようなもの
    pentagram = "Silver Crystal";
}

// ------------------------------------------------------------
// 2) Compact：実行時には消える “インターフェース”
// ------------------------------------------------------------
interface Compact {
    // ✅ 「silverCrystal を持つこと」を要求する契約
    // interface は型チェック専用で、JS 実行時には存在しない（消える）
    silverCrystal: boolean;
}

// ------------------------------------------------------------
// 3) CosmicCompact / CrisisCompact：Compact を実装するクラス
// ------------------------------------------------------------
class CosmicCompact implements Compact {
    // ✅ Compact の契約を満たす（必須プロパティ）
    silverCrystal = true;

    // ✅ CosmicCompact 固有の追加要素
    cosmicPower = true;
}

class CrisisCompact implements Compact {
    silverCrystal = true;
    moonChalice = true;
}
/*
  ✅ implements Compact の意味：
  - これらのクラスは「Compact として扱える形状を持つ」ことをコンパイル時に保証する
  - ただし実行時には Compact という型情報は残らないので、
    “Compact かどうか” を instanceof では判定できない
  - その代わり CosmicCompact / CrisisCompact という “クラス” なら instanceof で判定できる
*/

// ------------------------------------------------------------
// 4) transform のオーバーロード宣言（呼び出し側の型）
// ------------------------------------------------------------
function transform(): void;
function transform(item: Brooch): void;
function transform(item: Compact): void;
/*
  ✅ ここは “宣言” だけで実装は無い。
  TypeScript が呼び出し側をチェックするための入口（API仕様）になる。

  - transform()：引数なしもOK
  - transform(item: Brooch)：Brooch を渡すのもOK
  - transform(item: Compact)：Compact を満たすもの（例：CosmicCompact / CrisisCompact）もOK

  ✅ 注意：
  - ここに書いた宣言が “許可リスト” になる。
  - 例えば transform(123) のような呼び出しは宣言に合わず、コンパイルエラーになる。
*/

// ------------------------------------------------------------
// 5) transform の実装（1つだけ）：union で受けてランタイム分岐する
// ------------------------------------------------------------
function transform(item?: Brooch | Compact): void {
    /*
      ✅ 実装側ではオーバーロード宣言をまとめて処理するため、
      引数を union（Brooch | Compact | undefined）で受ける。
  
      アルゴリズム：
      - item の実体（ランタイムの値）を見て、最も具体的なケースから順に判定していく
      - どれにも当てはまらなければ “偽物” とみなす
    */

    // ----------------------------------------------------------
    // 5-1) Brooch 判定：Brooch はクラスなので instanceof で判定できる
    // ----------------------------------------------------------
    if (item instanceof Brooch) {
        console.log("Moon crystal power💎, make up!!");

        // ----------------------------------------------------------
        // 5-2) CosmicCompact 判定：こちらもクラスなので instanceof が使える
        // ----------------------------------------------------------
    } else if (item instanceof CosmicCompact) {
        console.log("Moon cosmic power💖, make up!!!");

        // ----------------------------------------------------------
        // 5-3) CrisisCompact 判定：こちらもクラス判定が可能
        // ----------------------------------------------------------
    } else if (item instanceof CrisisCompact) {
        console.log("Moon crisis🏆, make up!");

        // ----------------------------------------------------------
        // 5-4) 引数なし判定：undefined の場合（transform() 呼び出し）
        // ----------------------------------------------------------
    } else if (item === undefined) {
        console.log("Moon prism power🌙, make up!");

        // ----------------------------------------------------------
        // 5-5) それ以外：宣言上は Compact を受け取れるが、実行時に判定不能なケースを拾う
        // ----------------------------------------------------------
    } else {
        console.log("Item is fake...😖");
    }

    /*
      ✅ “Item is fake” に落ちる代表例：
      - transform({ silverCrystal: true }) のように、interface Compact を満たす “プレーンオブジェクト”
        → これは型的には Compact として渡せるが、instanceof CosmicCompact/CrisisCompact には一致しない
        → つまり実行時の分岐ができず、この else に落ちる
  
      もし “Compact なら OK” という扱いをしたいなら、
      instanceof ではなくプロパティ存在チェックを使う（例：'silverCrystal' in item）などの
      ランタイム型ガードが必要になる。
    */
}

// ------------------------------------------------------------
// 6) 呼び出し例：オーバーロードと分岐の確認
// ------------------------------------------------------------
transform();                  // item === undefined → prism
transform(new Brooch());      // instanceof Brooch → crystal
transform(new CosmicCompact()); // instanceof CosmicCompact → cosmic
transform(new CrisisCompact()); // instanceof CrisisCompact → crisis