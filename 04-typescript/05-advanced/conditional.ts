// ✅ このコードは TypeScript の
// - intersection 型（&）で「既存型を上書き/強化した派生型」を作る
// - conditional type（T extends ... ? ... : ...）で「型に応じて別の型を返す」
// - インデックスアクセス型 T["id"] で「特定プロパティの型を抽出する」
// を組み合わせて、
// 「User 系の型から id の型だけを取り出すユーティリティ IdOf<T>」を定義する例である。
//
// アルゴリズム的には：
// - 入力型 T が User と互換なら（= 少なくとも id を持つなら）その id 型を返す
// - そうでなければ never（到達不能/無効）に落とす
// という “型レベル分岐” を行っている。

{
    // ------------------------------------------------------------
    // 1) User：id の型が未確定（unknown）なユーザーの基底形
    // ------------------------------------------------------------
    interface User {
        // ✅ unknown は「何でも入り得るが、そのままでは安全に扱えない」型
        // ここでは “ユーザーの id はまだ仕様が決まっていない/混在している” という状態を表している。
        id: unknown;
    }

    // ------------------------------------------------------------
    // 2) NewUser / OldUser：intersection で id を具体化する
    // ------------------------------------------------------------
    type NewUser = User & { id: string };
    type OldUser = User & { id: number };
    /*
      ✅ intersection（&）は “両方の要件を満たす” 型である。
  
      - User は id: unknown を要求
      - { id: string } は id: string を要求
  
      交差させると id は
        unknown & string
      となり、これは実質 string に収束する（unknown は「最上位」なので、交差すると具体側に寄る）。
  
      同様に OldUser の id は
        unknown & number
      となり、実質 number に収束する。
  
      つまり “基底の曖昧な id を、派生型で具体型へ絞り込む” という設計になっている。
    */

    // ------------------------------------------------------------
    // 3) Book：User ではない別の型（isbn を持つ）
    // ------------------------------------------------------------
    interface Book {
        isbn: string;
    }
    /*
      ✅ Book は id を持たないので、User 互換ではない。
      → 後で IdOf<Book> が never になることを確認するための対照例。
    */

    // ------------------------------------------------------------
    // 4) IdOf<T>：User 系なら id 型を取り出し、それ以外は never
    // ------------------------------------------------------------
    type IdOf<T> = T extends User ? T["id"] : never;
    /*
      ✅ conditional type（型レベル if）：
        - 条件：T extends User ?
          → “T は User として扱えるか（少なくとも id を持つ構造か）”
        - 真：T["id"]
          → インデックスアクセス型で id プロパティの型を抽出
        - 偽：never
          → “id を取り出す対象ではない” を型として表現（到達不能）
  
      アルゴリズムとしては：
        入力型 T を判定し、
          User 互換なら id 型を射影（projection）して返す
          そうでなければ除外（never）
      という “型フィルタ＋射影” を行っている。
    */

    // ------------------------------------------------------------
    // 5) 適用例：IdOf に NewUser / OldUser / Book を渡す
    // ------------------------------------------------------------
    type NewUserId = IdOf<NewUser>;
    /*
      評価（概念）：
      - NewUser extends User は true（id を持つので構造的に互換）
      - よって NewUser["id"] を返す
      - NewUser の id は unknown & string → string
      => NewUserId は string
    */

    type OldUserId = IdOf<OldUser>;
    /*
      - OldUser extends User は true
      - OldUser["id"] を返す
      - OldUser の id は unknown & number → number
      => OldUserId は number
    */

    type BookId = IdOf<Book>;
    /*
      - Book extends User は false（Book は id を持たない）
      - よって never
      => BookId は never
  
      ✅ never になることの意味：
      - “Book から id を抽出する” という操作が型的に不正であることを示す
      - union に混ぜた時に対象外を落とす用途（型フィルタ）にも使える
    */
}