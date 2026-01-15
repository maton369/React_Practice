// ✅ このコードは TypeScript の
// - async 関数の戻り値（Promise<...>）
// - ReturnType<F> による戻り値型の抽出
// - Awaited<T> による “Promise を await した結果の型” の抽出
// を組み合わせて、
// 「fetchPost を await したときに得られる型」を自動で取得する例である。
//
// アルゴリズム的には：
// - fetchPost の型シグネチャを単一の真実（source of truth）にして、
//   そこから “出力の最終形（解決後の値）” を型レベルで正規化して取り出す、という流れになっている。

// ------------------------------------------------------------
// 1) Post：API から受け取る投稿データの期待形（型の契約）
// ------------------------------------------------------------
interface Post {
    id: number;
    userId: string;
    title: string;
    body: string;
}
/*
  ✅ Post は「こういう形のオブジェクトが返ってくるはず」という期待値。
  ただし注意点として、これは TypeScript の静的型なので、
  実際にサーバがこの形で返すかどうかは実行時には保証されない。
  （実運用ではバリデーションやスキーマ検証を組み合わせることが多い）
*/

// ------------------------------------------------------------
// 2) fetchPost：id を受け取り、JSON を取得して返す async 関数
// ------------------------------------------------------------
async function fetchPost(id: string): Promise<Post> {
    // ✅ 文字列テンプレートで URL を組み立てる
    const url = `https://jsonplaceholder.typicode.com/posts/${id}`;

    // ✅ fetch は Promise<Response> を返す
    // await により、ネットワーク I/O が完了して Response を受け取る
    const response = await fetch(url);

    // ✅ response.json() は “本文を JSON としてパースする” 非同期処理
    // これも Promise を返すため await が必要
    const data = await response.json();

    // ✅ ここでは data をそのまま返している
    // 関数シグネチャ上は Promise<Post> を返す契約だが、
    // data の実体が本当に Post と一致するかは実行時には未検証
    return data;
}
/*
  ✅ async 関数の性質（アルゴリズム）：
  - async を付けた関数は、内部で return した値を自動的に Promise で包む
  - つまり `return data;` は呼び出し側から見ると Promise<Post> の解決値（Post）になる

  概念的には：
    fetchPost(id)  // Promise<Post>
    await fetchPost(id)  // Post
*/

// ------------------------------------------------------------
// 3) FetchPostResult：fetchPost を await した結果の型を自動導出
// ------------------------------------------------------------
type FetchPostResult = Awaited<ReturnType<typeof fetchPost>>;
/*
  ✅ 評価の流れ（型レベル）：

  1) typeof fetchPost
     => 関数 fetchPost の型（(id: string) => Promise<Post>）

  2) ReturnType<typeof fetchPost>
     => 戻り値型を抽出
     => Promise<Post>

  3) Awaited<Promise<Post>>
     => Promise を “await で解決した後の型” に正規化
     => Post

  よって FetchPostResult は Post になる。

  ✅ Awaited を使う意味：
  - async 関数は戻り値が Promise になるので、
    “呼び出し側が実際に使う値の型（await 後）” を取りたい場面が多い
  - Awaited は Promise のネストにも対応し得るため、
    単純な Promise<...> 以外でも “最終的な解決値” を得やすい
*/