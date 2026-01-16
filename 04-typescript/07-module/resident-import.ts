// ✅ このコードは `resident-export` から Resident を import して、
// 1) class Resident のインスタンスを new で生成する（resident）
// 2) Resident 型としてオブジェクトリテラルを代入する（patty）
// という2パターンを並べて示している。
//
// ただし重要な注意点がある：
// - 直前の定義が `export type { Species, Resident }` だった場合、
//   それは “型としての Resident” しか公開していないため、
//   `new Resident()` のように “値としての Resident（コンストラクタ）” を import できずエラーになる。
// - `new Resident()` をしたいなら、輸出側で `export { Resident }`（値としての export）が必要になる。
//
// アルゴリズム的には：
// - TypeScript は “型空間” と “値空間” を分けて扱う
// - import は「値として使うのか」「型として使うのか」で要件が変わる
// - class は「型でもあり値でもある（コンストラクタという値を持つ）」が、
//   export 側が type だけだと値が伝播しない、という構造になっている。

import { Resident } from "./resident-export";
/*
  ✅ ここでの Resident は、書き方だけを見ると “値としての import” である。
  - つまり実行時に存在するもの（コンストラクタなど）を取り込む形。

  ⚠️ もし resident-export 側が `export type { Resident }` だけだと：
  - “型” は import できても “値” は export されていない
  - したがって `new Resident()` は実行時に存在しないものを呼ぼうとしてエラーになる

  ✅ 正しくするなら（代表例）：
  - export 側：`export { Resident };`（値として export）
  - import 側：`import { Resident } from "./resident-export";`
*/

// ------------------------------------------------------------
// 1) new Resident()：クラスのインスタンス生成（値としての Resident が必要）
// ------------------------------------------------------------
const resident = new Resident()
/*
  ✅ ここは class コンストラクタ呼び出し（インスタンス生成）。
  アルゴリズム的には：
  - new により空のオブジェクトを生成し、prototype を Resident.prototype に設定
  - クラス本体のフィールド初期化を実行して、
      name = ""
      age = 0
      species = null
    の初期状態を作る
  - 生成されたインスタンスを resident に束縛する

  つまり resident は「デフォルト値を持った Resident の実体」になる。
*/

// ------------------------------------------------------------
// 2) patty: Resident：型注釈を付けてオブジェクトリテラルを代入
// ------------------------------------------------------------
const patty: Resident = {
    name: "Patty Rabbit",
    age: 8,
    species: "rabbit",
};
/*
  ✅ ここでの Resident は “型” として使われている（型注釈の位置）。
  アルゴリズム的には：
  - 右辺のオブジェクトリテラルが Resident の構造を満たすかをコンパイル時に検査する
  - name が string、age が number、species が Species | null のどれか
    （= "rabbit" | "bear" | "fox" | "dog" | null）
  を満たしているので OK になる

  ✅ 重要：patty は class のインスタンスではなく “ただのオブジェクト” である
  - class Resident 由来のメソッド（もし今後追加しても）は patty には付かない
  - つまり `patty instanceof Resident` は false になり得る
  - ここは「クラスの実体として扱いたい」のか「構造だけ一致していればいい」のかで設計が分かれる

  （TypeScript の型システムは基本的に structural typing：形が合えば同じ型扱い）
*/

// ------------------------------------------------------------
// 3) 出力：作ったデータを確認
// ------------------------------------------------------------
console.log(patty);
/*
  期待される表示：
    { name: 'Patty Rabbit', age: 8, species: 'rabbit' }

  ※ resident（new した方）は出力していないが、出すと
    { name: '', age: 0, species: null }
  のような初期状態が確認できる。
*/