// ✅ このコードは TypeScript の「ユーザー定義型ガード（user-defined type guard）」を使って、
// unknown（外部入力）を実行時に検証し、成功した場合だけ安全に User として扱う例である。
//
// 重要ポイント：
// - JSON.parse の結果は “実行時には何でもあり得る” ので unknown で受けるのが安全
// - `function isUser(arg: unknown): arg is User` という戻り値型がポイント
//   → true のとき、TypeScript は「このブロック内の arg は User だ」と推論できる
// - 実装では optional chaining（?.）と typeof チェックで構造を確認している
//
// アルゴリズム的には：
// 1) 入力（unknown）を受け取る
// 2) “User に必要なプロパティが存在し、型が正しい” かを逐次チェックする（ランタイム検証）
// 3) 全条件を満たすなら true（User だと見なせる）
// 4) 呼び出し側は if (isUser(u)) により、u を User に絞り込んで安全に参照できる

// ------------------------------------------------------------
// 1) User：期待するデータ構造（型の契約）
// ------------------------------------------------------------
interface User {
    username: string;
    address: {
        zipcode: string;
        town: string;
    };
}

// ------------------------------------------------------------
// 2) isUser：unknown を User として扱って良いかを判定する関数
// ------------------------------------------------------------
function isUser(arg: unknown): arg is User {
    /*
      ✅ 戻り値型 `arg is User` が “型ガード” の正体：
      - 戻り値が true の場合、TypeScript は呼び出し側で arg を User に絞り込む
      - 戻り値が false の場合、User ではないものとして扱う
  
      これにより「検証 → 型の確定」を1箇所に閉じ込められる。
    */

    // ----------------------------------------------------------
    // 2-1) ここでの `as User` は “検証のための読み取り” に使っている
    // ----------------------------------------------------------
    const u = arg as User;
    /*
      ⚠️ 注意：
      - `as User` は値を変換しない（ただの型の付け替え）
      - しかしこの関数内では、型を付け替えた上で
        optional chaining + typeof で “実際に合っているか” を検証する
      - つまり「危険な as を単独で使う」のではなく、
        “検証ロジックにセットで使っている” のがポイント
    */

    // ----------------------------------------------------------
    // 2-2) 逐次チェック：必要条件を全て満たすか（AND）
    // ----------------------------------------------------------
    return (
        // ✅ username が存在し、string であること
        typeof u?.username === "string" &&

        // ✅ address が存在し、その中の zipcode が string であること
        typeof u?.address?.zipcode === "string" &&

        // ✅ address の中の town が string であること
        typeof u?.address?.town === "string"
    );

    /*
      ✅ optional chaining（?.）の役割：
      - u が null/undefined っぽい値でも落ちない
      - address が無い（undefined）場合でも u.address.zipcode で例外にならない
  
      ✅ typeof チェックの役割：
      - 値が存在するだけでなく “型が正しい” ことを保証する
    */
}

// ------------------------------------------------------------
// 3) テストデータ：JSON.parse の結果は unknown として扱う
// ------------------------------------------------------------
const u1: unknown = JSON.parse("{}");
/*
  実体：{}
  - username なし
  - address なし
  => User ではない
*/

const u2: unknown = JSON.parse(
    '{ "username": "patty", "address": "Maple Town" }'
);
/*
  実体：{ username: "patty", address: "Maple Town" }
  - address が文字列で、オブジェクトではない
  => User ではない（address.zipcode/town が取れない）
*/

const u3: unknown = JSON.parse(
    '{ "username": "patty", "address": { "zipcode": "111", "town": "Maple Town" } }'
);
/*
  実体：{ username: "patty", address: { zipcode: "111", town: "Maple Town" } }
  - User の要求構造を満たす
  => User として扱える
*/

// ------------------------------------------------------------
// 4) 利用側：isUser で絞り込み、成功したときだけ安全に参照する
// ------------------------------------------------------------
[u1, u2, u3].forEach((u) => {
    if (isUser(u)) {
        /*
          ✅ ここで TypeScript は u を User と推論する。
          - u.username は string
          - u.address.town は string
          が保証されるので、深い参照も安全に書ける。
        */
        console.log(`${u.username} lives in ${u.address.town}`);
    } else {
        /*
          ✅ ここでは u は User ではない（または不明）として扱う。
          したがって username/address を前提にした参照は書けない（書くべきでない）。
        */
        console.log("Not a User");

        // console.log(`${u.username} lives in ${u.address.town}`);
        /*
          ❌ これは型エラーになるのが正しい：
          - else ブロックでは u は User と確定していない
          - 深い参照は危険なのでコンパイラが止める
        */
    }
});

/*
  ✅ まとめ：
  - unknown を入口で受ける
  - 型ガード関数で構造検証する
  - true の場合だけ安全に型を確定して使う
  → 「型安全」と「実行時安全」を揃える基本パターンである
*/