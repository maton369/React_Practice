// ✅ このコードは「JSON文字列を JSON.parse でオブジェクトに変換し、
// その結果に対してネストしたプロパティアクセスを行う」例である。
// ただし、このままだと実行時エラーになる可能性が非常に高い（ほぼ確実）点が重要である。
//
// なぜ危険か：
// - JSON.parse の戻り値は “どんな形か” を実行時まで保証できない
// - この JSON には address が存在しない（id と username しかない）
// - そのため user.address は undefined になり、undefined.zipCode を読もうとして例外になる
//
// つまりここは「型/構造を検証しないまま深いプロパティへアクセスすると壊れる」典型例である。

{
    // ✅ JSON形式の文字列
    // ここに含まれるキーは "id" と "username" のみで、"address" は存在しない。
    const str = `{ "id": 1, "username": "patty" }`;

    // ✅ JSON.parse は文字列を JavaScript の値に変換する
    // 実行結果は { id: 1, username: "patty" } というオブジェクトになる。
    //
    // ⚠️ TypeScript で型注釈を付けない場合、TS は user を any 扱いにしやすい。
    // any だと「何でもできる」のでコンパイルは通るが、実行時安全性は何も守られない。
    const user = JSON.parse(str);

    // ------------------------------------------------------------
    // ここが危険ポイント：ネストしたプロパティアクセス
    // ------------------------------------------------------------
    console.log(user.id, user.address.zipCode);
    /*
      ✅ この行の評価手順（アルゴリズム的に何が起きるか）
  
      1) user.id を読む
         - user は { id: 1, username: "patty" } なので user.id は 1
  
      2) user.address を読む
         - user には address が無いので user.address は undefined
  
      3) undefined.zipCode を読もうとする
         - undefined に対してプロパティアクセスはできないため、ここで例外が発生する
  
      典型的なエラー：
        TypeError: Cannot read properties of undefined (reading 'zipCode')
  
      ✅ 結果として console.log は最後まで実行されず、プログラムは例外で中断する。
    */

    // ------------------------------------------------------------
    // ✅ 安全に書くなら（概念）
    // ------------------------------------------------------------
    /*
      (A) オプショナルチェイニング + フォールバック
        console.log(user.id, user.address?.zipCode ?? '(no zip)');
  
      (B) address が存在するかを事前に検証
        if (user.address && user.address.zipCode) { ... }
  
      (C) TypeScript なら unknown で受け、型ガード/スキーマ検証してから使う
        const user: unknown = JSON.parse(str);
        ...検証...
    */
}