// ✅ このコードは TypeScript における
// - 文字列リテラル union による “有限集合（列挙）” の表現
// - interface によるデータ構造の定義
// - 述語関数（predicate）による分類ロジック
// - ES Modules の export による公開APIの構成
// をまとめた小さなモジュールである。
//
// アルゴリズム的には：
// 1) Species を “種別の取り得る値の集合” として型で固定する
// 2) Resident は species に Species を要求し、データの整合性を静的に確保する
// 3) isCanine は species をキーに「犬科かどうか」を判定する分類関数
//    - 判定は “集合 membership（所属判定）” として実装されている
// 4) これらを export して、他モジュールから再利用できるようにする

// ------------------------------------------------------------
// 1) Species：種別の有限集合（文字列リテラル union）
// ------------------------------------------------------------
type Species = 'rabbit' | 'bear' | 'fox' | 'dog';
/*
  ✅ Species は集合で言えば { 'rabbit', 'bear', 'fox', 'dog' }。
  ここに含まれない文字列は、species として代入できないため、
  入力データの取り得る値をコンパイル時に制限できる。
*/

// ------------------------------------------------------------
// 2) Resident：住人のデータ構造（species は Species に制約される）
// ------------------------------------------------------------
interface Resident {
    name: string;
    age: number;
    species: Species; // ✅ ここが “列挙型” を効かせるポイント
}
/*
  ✅ Resident は “型の契約”：
  - name は string
  - age は number
  - species は Species（上で定義した有限集合のどれか）

  これにより、species が 'cat' のような未知の値になっているデータは
  そもそも Resident として扱えず、早期にバグを防げる。
*/

// ------------------------------------------------------------
// 3) isCanine：犬科かどうかの分類関数（predicate）
// ------------------------------------------------------------
const isCanine = (resident: Resident): boolean =>
    ['dog', 'fox'].includes(resident.species);
/*
  ✅ これは “所属判定（membership test）” の実装である。

  アルゴリズム：
  - 犬科とみなす Species の部分集合 S = { 'dog', 'fox' } を用意し、
  - resident.species が S に含まれるかを判定する
  - 含まれるなら true、含まれないなら false

  実装詳細：
  - ['dog', 'fox'] は配列（リスト）で、includes は線形探索（O(k), ここでは k=2）で判定する
  - 要素数が非常に小さいので、実用上は十分高速
  - 大規模な集合で頻繁に判定する場合は Set を使うと平均 O(1) で判定できる

  ✅ 型の観点：
  - 戻り値型は boolean
  - もし「true のとき resident は species が dog|fox に絞られる」までやりたいなら、
    戻り値を `resident is Resident & { species: 'dog' | 'fox' }` のような
    “型ガード” にする設計も可能（ここでは単純な boolean 判定としている）
*/

// ------------------------------------------------------------
// 4) export：公開APIとして他ファイルから利用可能にする
// ------------------------------------------------------------
export { Species, Resident, isCanine };
/*
  ✅ これにより、別モジュールから
    import { Resident, isCanine } from '...';
  のように再利用できる。

  「型（Species/Resident）＋ロジック（isCanine）」を
  1つのモジュールとしてまとめて配布する、よくある設計パターンである。
*/