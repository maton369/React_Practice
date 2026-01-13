// ✅ このコードは「再帰的な型（Resident が mom として Resident を参照する）」と
// 「optional プロパティ mom?: Resident を安全に扱わないと実行時に壊れる」ことを示す例である。
//
// 重要ポイント：
// - interface Resident の mom?: Resident は “存在しない可能性がある”
// - にもかかわらず getMomName で resident.mom.lastName と直接参照しているため、
//   mom が undefined のとき実行時に TypeError になる
// - TypeScript でも `strictNullChecks` が有効なら、通常この行はコンパイル時に警告/エラーになる
//   （mom が undefined かもしれないため）
//
// また、最後の patty は `const patty = { ... }` としており、mom を持たない。
// したがって getMomName(patty) を呼ぶと “母がいない” 状態を参照して落ちる。

// ------------------------------------------------------------
// 1) Resident：住人（家族関係を持つ人物）の型
// ------------------------------------------------------------
interface Resident {
    // ✅ 姓（家の名前のようなもの）
    familyName: string;

    // ✅ 名（ここでは lastName と書いているが実質 “個人名” を想定している）
    lastName: string;

    // ✅ mom は optional
    // - mom?: Resident は “mom が存在しない” 可能性を許す
    // - さらに型が Resident なので「母にも母がいて…」という再帰構造を表現できる
    mom?: Resident;
}

// ------------------------------------------------------------
// 2) getMomName：母の lastName を取り出す関数（ただし危険）
// ------------------------------------------------------------
const getMomName = (resident: Resident): string => resident.mom.lastName;
/*
  ⚠️ ここが問題点：
  - resident.mom は optional なので、型としては Resident | undefined を取り得る
  - mom が undefined の場合、resident.mom.lastName は
      undefined.lastName
    を評価しようとして実行時例外になる（TypeError）

  アルゴリズム的には：
  - “ツリー/連結構造の1段参照” をしているが、
  - 中間ノード（mom）が欠損しているケースを考慮していないため、
    欠損入力に対して壊れる関数になっている。

  実務では次のいずれかが必要：
  - オプショナルチェイニング：resident.mom?.lastName ?? '(unknown)'
  - 事前チェック：if (!resident.mom) throw ... / return ...
  - 型で保証：mom を必須にする（mom: Resident）など
*/

// ------------------------------------------------------------
// 3) patty：mom を持たない Resident 相当のオブジェクト
// ------------------------------------------------------------
const patty = { familyName: "Hope-Rabbit", lastName: "patty" };
/*
  ✅ TypeScript の構造的型付けにより、
  - familyName:string
  - lastName:string
  を持っているので Resident として扱える（mom は optional なので無くてもOK）
*/

// ------------------------------------------------------------
// 4) 呼び出し：母がいないのに母の名前を取りに行くので落ちる
// ------------------------------------------------------------
console.log(getMomName(patty));
/*
  実行時の流れ：
  1) getMomName(patty) が呼ばれる
  2) patty.mom は存在しない → undefined
  3) undefined.lastName を参照しようとして TypeError で停止する

  つまり、このコードは “optional を安全に扱わないと壊れる” ことのデモになっている。
*/