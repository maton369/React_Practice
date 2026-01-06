// ✅ このコードは「Promise チェーン（then/catch/finally）」で
// HTTP API からユーザー情報を取得し、
// - 成功：ユーザー情報を表示
// - 失敗：エラーを表示
// - 最後：完了ログを必ず表示
// という非同期処理の制御フローを構築している。
//
// async/await 版と等価な処理を、Promise の “パイプライン（チェーン）” として書いた形である。
// 核心は以下：
// - fetch は Promise<Response> を返す
// - then は成功（fulfilled）経路で値を変換し、次段へ渡す
// - then の中で throw すると、チェーンは rejected になり catch に流れる
// - response.ok を見て「HTTP として成功か」を判定し、失敗なら例外化する
// - finally は成功/失敗どちらでも必ず実行される

// ------------------------------------------------------------
// 1) getUser(userID)：Promise を返す関数（fetch → 検証 → json 変換）
// ------------------------------------------------------------
function getUser(userID) {
  // ✅ fetch はネットワークリクエストを投げて Promise<Response> を返す
  // ここで返される Promise は、通信が完了して Response が得られたら fulfilled になる。
  return fetch(`https://jsonplaceholder.typicode.com/users/${userID}`)
    .then((response) => {
      /*
        ✅ then のアルゴリズム（概念）
        - 直前の Promise が fulfilled のときだけ実行される
        - 引数 response は fetch が解決した Response

        ⚠️ 注意：
        - fetch は「通信レベルで成功した」場合は fulfilled になり得る
          （HTTP 404/500 でも Response は返る）
        - そのため response.ok を見て HTTP として成功かどうかを別途判定するのが定石
      */

      // ✅ response.ok は HTTP ステータスが 200〜299 のとき true
      if (!response.ok) {
        /*
          ✅ throw の意味（Promise チェーンにおける例外化）
          - then の中で例外を throw すると、
            この then が返す Promise は rejected になる
          - そして、その rejected が次の catch に伝播する

          例：404 Error / 500 Error など
        */
        throw new Error(`${response.status} Error`);
      } else {
        /*
          ✅ response.json() は Promise<オブジェクト> を返す
          - then から Promise を return すると、
            “その Promise の解決結果” が次段へ渡る（チェーンが平坦化される）

          つまりこの return により getUser 全体としては
          「JSON のパースが完了してユーザーオブジェクトが得られるまで」
          待つ Promise になる。
        */
        return response.json();
      }
    });
  // ✅ ここで getUser が返すのは、
  // - 成功時：ユーザーオブジェクトで fulfilled される Promise
  // - 失敗時：Error で rejected される Promise
}

// ------------------------------------------------------------
// 2) 同期ログ：非同期処理より先に必ず出る
// ------------------------------------------------------------
console.log("--- Start ---");
/*
  ✅ これは同期実行なので、ネットワーク完了を待たずに先に表示される。
*/

// ------------------------------------------------------------
// 3) 呼び出し側のチェーン：then → catch → finally
// ------------------------------------------------------------
getUser(2)
  .then((user) => {
    /*
      ✅ ここに来る条件：
      - getUser(2) が fulfilled した場合
      user は response.json() が解決した “ユーザーオブジェクト”
    */
    console.log(user);
  })
  .catch((error) => {
    /*
      ✅ ここに来る条件（代表例）：
      - fetch 自体が reject（ネットワーク障害など）
      - response.ok が false で throw した
      - response.json() が reject（JSON パース失敗など）
      いずれも “rejected が伝播して最初に見つかった catch に到達する”
    */
    console.error(error);
  })
  .finally(() => {
    /*
      ✅ finally のアルゴリズム：
      - 成功でも失敗でも必ず実行される
      - 主用途はクリーンアップ・完了通知
      - ここでは完了ログを保証する
    */
    console.log("--- Completed ---");
  });

// ------------------------------------------------------------
// 4) 出力パターン（概念）
// ------------------------------------------------------------
// ✅ 成功時：
// --- Start ---
// { user object... }
// --- Completed ---
//
// ✅ 失敗時：
// --- Start ---
// Error: xxx Error
// --- Completed ---
//
// ※ finally が必ず実行されるので Completed は常に出る。