// ✅ このコードは TypeScript の
// - `as const` によるリテラル化（配列→タプル扱い）
// - インデックスアクセス `T[number]` による “要素 union” の抽出
// - テンプレートリテラル型による “文字列フォーマット（SQL）” の型表現
// を組み合わせて、
// 「許可されたテーブル名だけで SELECT 文を生成し、生成されるクエリ文字列の形も型で保証する」例である。
//
// 重要ポイント：
// - tables を `as const` にすることで 'users'|'posts'|'comments' の有限集合が得られる
// - Table = typeof tables[number] は “配列要素の union 型” を取り出す定石
// - AllSelect / LimitSelect は SQL 文字列パターンをテンプレートリテラル型で表す
// - createQuery は引数 table を Table に制限し、limit がある場合だけ LIMIT 付き文字列を返す
//
// ⚠️ 注意：この型保証は “文字列の形” と “許可テーブル名” を担保するが、
// SQL の完全な正当性や SQL インジェクション対策を自動で保証するわけではない。
// （ここでは table が有限集合なので注入面は狭いが、一般にはプレースホルダ等が必要）

// ------------------------------------------------------------
// 1) テーブル名の定義：as const で “リテラル配列” に固定
// ------------------------------------------------------------
const tables = ['users', 'posts', 'comments'] as const;
/*
  ✅ `as const` の効果：
  - 型が string[] に広がらず、
    readonly ['users','posts','comments'] のような “タプル” として扱われる
  - 各要素は string ではなく、それぞれの文字列リテラル型になる
*/

// ------------------------------------------------------------
// 2) Table：配列要素の union 型を抽出する（'users'|'posts'|'comments'）
// ------------------------------------------------------------
type Table = typeof tables[number];
/*
  ✅ typeof tables
    => readonly ['users','posts','comments']（のような型）

  ✅ [number]
    => “配列/タプルの全要素” を取り出すインデックスアクセス
       tables[0] | tables[1] | tables[2] ... の union になる

  よって Table は 'users' | 'posts' | 'comments'
  → 引数 table をこの3つに限定できる
*/

// ------------------------------------------------------------
// 3) SQL 文字列の “型フォーマット” をテンプレートリテラル型で定義
// ------------------------------------------------------------
type AllSelect = `SELECT * FROM ${Table}`;
type LimitSelect = `${AllSelect} LIMIT ${number}`;
/*
  ✅ AllSelect：
  - "SELECT * FROM users" のような文字列だけを許す型
  - ${Table} の部分は 'users'|'posts'|'comments' に限定される

  ✅ LimitSelect：
  - AllSelect に " LIMIT <数値>" を付けた形
  - ${number} は任意の数値文字列なので、20 や 0 や 999 などが入る

  アルゴリズム的には：
  - “許可されたテーブル集合” を使って
    “許可されたクエリ文字列集合” を型として生成している
*/

// ------------------------------------------------------------
// 4) createQuery：Table と optional limit からクエリを生成する関数
// ------------------------------------------------------------
const createQuery = (table: Table, limit?: number): AllSelect | LimitSelect =>
    limit ? `SELECT * FROM ${table} LIMIT ${limit}`
        : `SELECT * FROM ${table}`;
/*
  ✅ 実装の分岐：
  - limit が truthy なら LIMIT 付き
  - そうでなければ LIMIT なし

  ⚠️ 注意（truthy 判定の落とし穴）：
  - limit=0 を渡した場合、0 は falsy なので LIMIT なしになってしまう
    → “0 も有効な limit” としたいなら
       limit !== undefined
       のような判定にするのが安全

  ✅ 戻り値型：
  - LIMIT なしの文字列は AllSelect に一致
  - LIMIT ありの文字列は LimitSelect に一致
  - そのため union（AllSelect | LimitSelect）で表現している
*/

// ------------------------------------------------------------
// 5) 呼び出し：許可テーブル名＋LIMIT 付き
// ------------------------------------------------------------
const query = createQuery('users', 20);
console.log(query);
/*
  ✅ 'users' は Table の要素なので OK
  ✅ 返る文字列は "SELECT * FROM users LIMIT 20" の形になり、LimitSelect に一致する

  もし createQuery('accounts', 20) のように未許可テーブル名を渡すと
  コンパイル時に弾かれる（テーブル名のホワイトリスト化が型で実現できる）。
*/