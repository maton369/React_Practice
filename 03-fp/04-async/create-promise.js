// ✅ このコードは JavaScript の Promise の基本的な実行モデル（状態遷移）と、
// then/catch/finally による “非同期処理のパイプライン（チェーン）” を示している。
//
// 重要ポイント：
// - Promise には 3 状態がある：pending（未確定）→ fulfilled（成功） or rejected（失敗）
// - resolve が呼ばれると fulfilled に確定し、その値が then に渡る
// - reject が呼ばれると rejected に確定し、その理由（エラー）が catch に渡る
// - then は「前段が成功したときだけ」実行され、戻り値は次段へ引き継がれる
// - catch は「チェーン途中で失敗が起きたとき」実行される（エラーを捕捉する）
// - finally は成功・失敗どちらでも必ず実行され、値の変換には基本関与しない
// - then/catch/finally のコールバックは “同期的に直ちに実行される” のではなく、
//   Promise の解決後にマイクロタスクとしてスケジュールされる（イベントループ上の実行順序の話）

// ------------------------------------------------------------
// 1) 成功か失敗かの乱数フラグ
// ------------------------------------------------------------
// ✅ Math.random() は [0, 1) の乱数を返す。
// 0.5 未満なら true（成功扱い）、それ以外は false（失敗扱い）。
const isSucceeded = Math.random() < 0.5;

// ------------------------------------------------------------
// 2) Promise の生成：executor（(resolve, reject) => {...}）が即時実行される
// ------------------------------------------------------------
// ✅ new Promise(executor) を呼ぶと、executor 関数は “その場で同期的に実行される”。
// ただし then/catch の実行は後で（解決後に）行われる点が重要。
const promise = new Promise((resolve, reject) => {
  /*
    ✅ Promise の状態遷移アルゴリズム（概念）
    - 初期状態：pending
    - resolve(value) が最初に呼ばれたら → fulfilled(value) に確定
    - reject(reason) が最初に呼ばれたら → rejected(reason) に確定
    - 一度確定したら、その後の resolve/reject 呼び出しは無視される（単発確定）

    この例では isSucceeded によってどちらか一方が選ばれる。
  */
  if (isSucceeded) {
    // ✅ 成功ルート：fulfilled に確定し、'Success' が “成功値” になる
    resolve('Success');
  } else {
    // ✅ 失敗ルート：rejected に確定し、Error('Failure') が “失敗理由” になる
    reject(new Error('Failure'));
  }
});

// ------------------------------------------------------------
// 3) Promise チェーン：then → then → catch → finally
// ------------------------------------------------------------
// ✅ Promise チェーンは「前段の結果を次段へ渡すパイプライン」。
// - then は成功時に呼ばれるハンドラ
// - catch は失敗時に呼ばれるハンドラ（途中で投げられた例外も含む）
// - finally は成功/失敗に関係なく最後に呼ばれる
//
// そして各 then/catch/finally は新しい Promise を返すため、チェーンできる。

promise
  .then((value) => {
    /*
      ✅ ここに来る条件：
      - promise が fulfilled のとき（resolve されたとき）
      value は resolve に渡された値（ここでは 'Success'）

      ✅ ログ出力：1. Success
    */
    console.log('1.', value);

    /*
      ✅ then の戻り値のアルゴリズム
      - then コールバックが “普通の値” を return すると、
        次の then にその値が渡る（次段は fulfilled）
      - もし Promise を return すると、その Promise の解決を待って次段へ渡る
      - もし例外を throw すると、以降は rejected として catch に流れる

      ここでは文字列を返しているので、次段の value は 'Success again' になる。
    */
    return 'Success again';
  })
  .then((value) => {
    /*
      ✅ ここに来る条件：
      - 前段 then が成功し、何らかの値で fulfilled になったとき
      value は前段の return 値（ここでは 'Success again'）

      ✅ ログ出力：2. Success again
    */
    console.log('2.', value);
  })
  .catch((error) => {
    /*
      ✅ ここに来る条件：
      - 最初の promise が reject された場合
      - または then の中で例外が投げられた場合（throw/new Error など）
      error は reject の理由（ここでは Error('Failure')）

      ✅ ログ出力：3. Error: Failure（環境によって表示形式は多少異なる）
    */
    console.error('3.', error);

    /*
      補足：
      - catch の中で値を return すると、その後のチェーンは “回復” して成功扱いに戻せる
      - ここでは return していないので undefined を返すのと同等で、次段へ進む
      （ただし finally は成功/失敗を問わず走るので、この例では目立たない）
    */
  })
  .finally(() => {
    /*
      ✅ finally のアルゴリズム
      - 成功でも失敗でも必ず最後に呼ばれる（クリーンアップ用）
      - 引数は受け取らない（成功値/失敗理由を直接扱わない）
      - 基本的にチェーンの最終的な成功値/失敗理由を変換する用途ではなく、
        “後始末” を行うための段にする

      ✅ ログ出力：4. Completed
    */
    console.log('4.', 'Completed');
  });

// ------------------------------------------------------------
// 4) 出力パターン（isSucceeded によって分岐）
// ------------------------------------------------------------
// ✅ 成功した場合（resolve された場合）
// 1. Success
// 2. Success again
// 4. Completed
//
// ✅ 失敗した場合（reject された場合）
// 3. Error: Failure
// 4. Completed
//
// ※ いずれの場合も finally は必ず出る点が確認できる。