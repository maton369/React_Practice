// ✅ このコードは async/await を使って HTTP API からユーザー情報を取得し、
// - 正常系：ユーザー情報を表示
// - 異常系：エラーを catch で表示
// - 最終処理：finally で完了ログを必ず表示
// という “非同期処理の直列化 + 例外処理” の基本パターンを示している。
//
// 核心は以下：
// - async 関数は常に Promise を返す（内部で return した値は Promise の解決値になる）
// - await は「Promise が解決/拒否されるまで待つ」構文糖で、非同期処理を同期っぽく書ける
// - throw は “Promise の reject” として外側に伝播し、try/catch で捕捉できる
// - fetch はネットワークI/Oで非同期（イベントループ上で待機）
// - console.log("--- Start ---") は main() より前に同期的に実行される

// ------------------------------------------------------------
// 1) getUser(userID)：HTTP 取得を行う async 関数
// ------------------------------------------------------------
async function getUser(userID) {
  /*
    ✅ async function の意味
    - この関数の戻り値は必ず Promise になる
    - return した値は Promise を fulfilled にする “解決値” になる
    - throw した例外は Promise を rejected にする “拒否理由” になる
  */

  // ✅ fetch は HTTP リクエストを投げ、Promise<Response> を返す
  // await により、Response が返ってくる（Promise が fulfilled になる）まで待つ
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${userID}`
  );
  /*
    ✅ await のアルゴリズム（概念）
    - ここで関数の実行は一旦中断される（ブロックはしない）
    - fetch の Promise が解決すると、再開されて response に値が入る
    - もし fetch の Promise が reject されたら、await は例外を投げたのと同様になり、
      外側の try/catch へ伝播する（この getUser 内で catch していない場合）
  */

  // ✅ response.ok は HTTP ステータスが 200〜299 のとき true
  // API が 404 や 500 を返した場合、fetch 自体は成功（通信は成功）でも ok は false になり得る
  if (!response.ok) {
    // ✅ throw は async 関数において “Promise の reject” を発生させる
    // 例：404 Error, 500 Error のようなメッセージ
    throw new Error(`${response.status} Error`);
  }

  // ✅ response.json() はレスポンスボディを JSON として解析し、Promise<オブジェクト> を返す
  // return すると、その Promise が “この getUser の返り値（外側へ渡る Promise）” に連鎖する
  // つまり getUser は「JSON がパースされてオブジェクトになるまで」待つ形になる
  return response.json();
}

// ------------------------------------------------------------
// 2) 同期ログ：main() を呼ぶ前に必ず表示される
// ------------------------------------------------------------
console.log("--- Start ---");
/*
  ✅ これは同期実行されるので、ネットワーク処理の完了を待たずに必ず先に出る。
  ただし、その後の非同期ログ（user や Completed）は、通信の完了後に出る。
*/

// ------------------------------------------------------------
// 3) main()：非同期処理を直列化し、例外を捕捉し、後処理を保証する
// ------------------------------------------------------------
async function main() {
  /*
    ✅ main も async なので Promise を返す。
    - main() を呼ぶと、その場で Promise が返るが、
      中身の await があるので処理の続きは後で再開される。
  */

  try {
    // ✅ getUser(2) は Promise を返すが、await により “解決されたユーザーオブジェクト” を得る
    // ここでは jsonplaceholder の /users/2 の JSON が user に入る想定
    const user = await getUser(2);

    // ✅ 取得できたユーザーオブジェクトを表示
    console.log(user);
  } catch (error) {
    /*
      ✅ ここに来る条件：
      - fetch がネットワーク的に失敗して reject した
      - response.ok が false で getUser が throw した
      - response.json() のパースが失敗して reject した
      など、await が例外として伝播したケース

      error には Error オブジェクトが入るのが一般的。
    */
    console.error(error);
  } finally {
    /*
      ✅ finally の性質：
      - try が成功しても、catch に入っても、必ず実行される
      - “後処理（クリーンアップ）や完了通知” を保証するための構造

      この例では完了ログを必ず出す。
    */
    console.log("--- Completed ---");
  }
}

// ------------------------------------------------------------
// 4) main() の起動：非同期処理が開始される
// ------------------------------------------------------------
main();
/*
  ✅ main() を呼ぶと Promise が返るが、このコードでは await も then も付けていない。
  そのため “呼びっぱなし（fire-and-forget）” になるが、内部で console.log するので結果は見える。

  実行順のイメージ（概念）：
  1) "--- Start ---" が同期的に表示
  2) main() が開始し、getUser の fetch で一旦待機
  3) 通信が終わると user が表示、または error が表示
  4) 最後に "--- Completed ---" が必ず表示
*/