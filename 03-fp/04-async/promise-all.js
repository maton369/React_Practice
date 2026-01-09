/*
  ✅ このコードは「時間差で settle（resolve / reject）する Promise を複数作って」、
  Promise コンビネータ（all / allSettled / any / race）の挙動差を観察するための実験である。

  重要ポイント（全体の実行モデル）：
  - promiseN(n) は setTimeout により「n 秒後に resolve または reject」される Promise を返す
  - promises = [promiseN(3), promiseN(2), promiseN(1)] の生成時点で、各 Promise の executor が即時実行される
    → つまり “start ログ” はすぐに 3,2,1 の順で出る（配列を左から評価するため）
  - ただし settle（解決/拒否）の順序は遅延時間に依存する
    → 1秒 → 2秒 → 3秒 の順で settle する（通常）
  - await Promise.xxx(...) は「xxx のルールで決まるタイミングまで待つ」

  ⚠️ これは top-level await を使っているので、実行環境は ES Modules（type="module" など）前提になる。
*/

// ------------------------------------------------------------
// 0) rejectList：どの n を reject させるかの設定（今は空なので全て resolve）
// ------------------------------------------------------------
const rejectList = [];
/*
  rejectList に例えば [2] を入れると promiseN(2) が reject になる。

  ⚠️ アルゴリズム観点：
  - rejectList.includes(n) は線形探索（O(K)）で、要素数が増えると遅くなる
  - 多数判定するなら Set を使うと平均 O(1) にできる（ここでは学習用なのでOK）
*/

// ------------------------------------------------------------
// 1) promiseN(n)：n秒後に resolve(n) か reject(Error) する Promise を返す
// ------------------------------------------------------------
function promiseN(n) {
  return new Promise((resolve, reject) => {
    /*
      ✅ new Promise(executor) の executor は「Promise 生成時に同期的に即実行」される。
      ここでは start ログがその場で出る。
    */
    console.log(`--- promise(${n}) start ---`);

    /*
      ✅ setTimeout は「指定ミリ秒後にコールバックを 1 回だけ実行する」非同期タイマー。
      - 1000 * n ミリ秒 = n 秒後に実行される。
      - このタイマーコールバックは “タスク（macrotask）” として後で実行される。
    */
    setTimeout(() => {
      /*
        ✅ ここが Promise の settle（確定）点。
        - rejectList に n が含まれていれば reject → rejected に確定
        - そうでなければ resolve(n) → fulfilled に確定

        Promise は「一度確定したら二度と状態が変わらない（単発確定）」ので、
        resolve/reject はどちらか一度だけ効く。
      */
      if (rejectList.includes(n)) {
        // ✅ 失敗ルート：rejected に確定し、Error が “拒否理由” になる
        reject(new Error(`*** promise(${n}) rejected ***`));
      } else {
        // ✅ 成功ルート：fulfilled に確定し、値 n が “解決値” になる
        resolve(n);

        /*
          ✅ resolve の直後にログを出している点が観察ポイント：
          - resolve(n) は Promise の状態を確定させ、then/await の再開を「マイクロタスク」に登録する
          - ただしこの console.log は “今このタイマーコールバック内で同期実行” される
          なので、一般にこのログは（その tick の中では）then の処理より先に出やすい。
        */
        console.log(`=== promise(${n}) resolved ===`);
      }
    }, 1000 * n);
  });
}

// ------------------------------------------------------------
// 2) 3つの Promise を同時に開始する（生成した時点でタイマーが走り始める）
// ------------------------------------------------------------
const promises = [promiseN(3), promiseN(2), promiseN(1)];
/*
  ✅ “開始ログ” の順序：
  - 配列リテラルの評価順は左→右なので、start は 3,2,1 の順で出る。

  ✅ settle の順序（rejectList が空の場合）：
  - 1秒後に promise(1) が resolve
  - 2秒後に promise(2) が resolve
  - 3秒後に promise(3) が resolve
*/

let results = null;

// ------------------------------------------------------------
// 3) Promise コンビネータで “いつ完了とみなすか” を変える
// ------------------------------------------------------------
try {
  // ----------------------------------------------------------
  // A) Promise.all(promises)
  // ----------------------------------------------------------
  // ✅ アルゴリズム（all）：
  // - 全てが fulfilled になるまで待つ
  // - 1つでも reject したら、その瞬間に全体が reject（短絡）する
  // - 成功した場合、結果配列は「入力順」を保つ（解決順ではない）
  //
  // 今回 promises = [promiseN(3), promiseN(2), promiseN(1)] なので、
  // 全て成功なら results は [3, 2, 1] になる（1→2→3秒の順で解決しても順序は固定）。
  results = await Promise.all(promises);

  // ----------------------------------------------------------
  // B) Promise.allSettled(promises)
  // ----------------------------------------------------------
  // ✅ アルゴリズム（allSettled）：
  // - 全てが settle（fulfilled または rejected）するまで待つ
  // - 結果は入力順の配列で、各要素は {status, value} or {status, reason}
  //
  // results = await Promise.allSettled(promises);

  // ----------------------------------------------------------
  // C) Promise.any(promises)
  // ----------------------------------------------------------
  // ✅ アルゴリズム（any）：
  // - “最初に fulfilled したもの” を返して終了
  // - 全て reject した場合のみ reject（AggregateError）になる
  //
  // 今回全て成功なら、最初に fulfilled するのは n=1（1秒後）なので results は 1 になりやすい。
  //
  // results = await Promise.any(promises);

  // ----------------------------------------------------------
  // D) Promise.race(promises)
  // ----------------------------------------------------------
  // ✅ アルゴリズム（race）：
  // - “最初に settle したもの”（fulfilled でも rejected でも）で終了
  //
  // 今回全て成功なら最初に settle するのは n=1（1秒後）なので results は 1 になりやすい。
  // もし rejectList に 1 を入れると、1秒後に reject して catch に入る。
  //
  // results = await Promise.race(promises);

} catch (error) {
  /*
    ✅ Promise.all / any / race などが reject した場合にここへ来る。
    - all：どれか1つが reject したら即 reject
    - any：全てが reject したら reject（AggregateError）
    - race：最初に settle したものが reject なら reject
  */
  console.error("Error: " + error.message);
}

// ------------------------------------------------------------
// 4) results の確認
// ------------------------------------------------------------
console.log(results);
/*
  ✅ rejectList が空で、Promise.all を使っている場合：
  - 約 3 秒後（最も遅い promise(3) が終わるタイミング）に
    results = [3, 2, 1] が出力される。

  ✅ どれかを reject させた場合（例：rejectList = [2]）：
  - Promise.all は 2 秒後に reject して catch に入り、results は null のままになり得る
  - ただし他の Promise（1や3）はタイマーで動作し続け、後から resolved ログは出ることがある
    （“all が失敗した” ことと “他の Promise が止まる” ことは別）
*/