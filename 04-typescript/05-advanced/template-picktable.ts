// ✅ このコードは TypeScript のテンプレートリテラル型 + conditional type + infer を使って、
// 「SQL 文字列（型）から FROM 以降のテーブル名部分だけを抽出する」例である。
//
// 重要ポイント：
// - 文字列リテラル（q1, q2, q3）を “型” として扱う（typeof q1 など）
// - PickTable<T> は T が "SELECT ... FROM <table>" 形式なら <table> を infer で取り出す
// - union 型（typeof q1 | typeof q2 | typeof q3）に対して conditional type を適用すると、
//   各要素に分配されて結果が union で返る（distributive conditional types）
// - その結果 Tables は 'users' | 'posts' | 'comments' になる

// ------------------------------------------------------------
// 1) SQL クエリ文字列（ここでは const なので文字列リテラル型になる）
// ------------------------------------------------------------
const q1 = 'SELECT * FROM users';
const q2 = 'SELECT id, body, createdAt FROM posts';
const q3 = 'SELECT userID, postID FROM comments';
/*
  ✅ const で宣言されているので、型は string ではなく
  - typeof q1 = 'SELECT * FROM users'
  - typeof q2 = 'SELECT id, body, createdAt FROM posts'
  - typeof q3 = 'SELECT userID, postID FROM comments'
  のような “具体文字列そのもの” のリテラル型になる。

  もし let にすると型が string に広がり、後段で抽出できなくなるので、
  ここは const であることが重要。
*/

// ------------------------------------------------------------
// 2) PickTable<T>：SQL 形式にマッチしたら FROM の後ろを infer で抜き出す
// ------------------------------------------------------------
type PickTable<T extends string> =
    T extends `SELECT ${string} FROM ${infer U}` ? U : never;
/*
  ✅ これは型レベルのパターンマッチ（条件分岐）である。

  - 条件：T extends `SELECT ${string} FROM ${infer U}` ?
    → “T は 'SELECT ... FROM ...' の形に合うか？” を判定する

  - `${string}`：
    → SELECT の後ろのカラム部分を “何でもよい文字列” として受け取る
       （'*' でも 'id, body' でもOK）

  - `${infer U}`：
    → FROM の後ろの部分を “U という型変数” に推論して束縛する
       → ここがテーブル名抽出に相当する

  - true の場合：U を返す（テーブル名を返す）
  - false の場合：never を返す（パターン不一致は除外）

  アルゴリズム的には：
  - “SQL テキストを型として解析して、特定のトークン（FROM 以降）を射影する”
  という処理を型レベルでやっている。
*/

// ------------------------------------------------------------
// 3) Tables：複数クエリの union に対して PickTable を適用し、テーブル名 union を得る
// ------------------------------------------------------------
type Tables = PickTable<typeof q1 | typeof q2 | typeof q3>;  // 'users' | 'posts' | 'comments'
/*
  ✅ ここが面白いポイント（分配則）：

  PickTable<T> の T に union を入れると、
  TypeScript は概ね次のように “各要素に分配” して評価する：

    PickTable<A | B | C>
    = PickTable<A> | PickTable<B> | PickTable<C>

  したがって
    PickTable<typeof q1> = 'users'
    PickTable<typeof q2> = 'posts'
    PickTable<typeof q3> = 'comments'
  が union されて

    Tables = 'users' | 'posts' | 'comments'

  となる。

  ✅ まとめ：
  - const リテラルで “文字列を型として固定”
  - テンプレートリテラル型で “SQL 形式にマッチ”
  - infer で “テーブル名を抽出”
  - union に対して分配して “抽出結果も union 化”
  という流れになっている。
*/