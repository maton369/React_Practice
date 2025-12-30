/*
  ✅ このコードは「オブジェクトの分割代入」と「残余プロパティ（rest properties）...」を使って、
  - 特定のプロパティ（id）だけを取り出し
  - 残りのプロパティをまとめた新しいオブジェクト（userWithoutId）を作る
  というパターンを示している。

  Reactやフロント開発では、API送信時に不要なキーを除外したり、
  props から特定の値だけ取り出して残りをまとめて渡したりする場面で頻出。

  ------------------------------------------------------------
  1) 結果（何が出力される？）
  ------------------------------------------------------------
  user は
    { id:1, name:'Patty Rabbit', email:'patty@maple.town', age:8 }

  分割代入：
    const { id, ...userWithoutId } = user;

  により、

  - id = 1
  - userWithoutId = { name:'Patty Rabbit', email:'patty@maple.town', age:8 }

  となるので、console には概ね
    1 { name: 'Patty Rabbit', email: 'patty@maple.town', age: 8 }
  が表示される（表示形式は環境で多少異なる）。

  ------------------------------------------------------------
  2) アルゴリズム観点：rest properties の動作（“除外→収集”）
  ------------------------------------------------------------
  `{ id, ...userWithoutId } = user` の処理は概念的に次の順で進む。

  (1) まず user から id を取り出して id に束縛する
      - id = user.id

  (2) 次に “残り” を userWithoutId にまとめる
      - user の列挙可能な自前プロパティ（enumerable own properties）を走査する
      - ただし、すでに取り出したキー（ここでは 'id'）は除外する
      - 除外後のキーと値を新しいオブジェクトにコピーする（シャローコピー）

  つまり、概念的には：

    const id = user.id;
    const userWithoutId = {};
    for (const key of Object.keys(user)) {
      if (key !== 'id') userWithoutId[key] = user[key];
    }

  のような “除外フィルタ + コピー” に近い。

  ------------------------------------------------------------
  3) 注意点：これはシャローコピー
  ------------------------------------------------------------
  userWithoutId は新しいオブジェクトだが、コピーはシャローである。
  もし user の中にネストしたオブジェクトがある場合、
  その内側は参照が共有される（深いコピーではない）。

  ------------------------------------------------------------
  4) Reactでよくある使い方（イメージ）
  ------------------------------------------------------------
  - API送信時に id だけ除外して payload を作る
  - props から特定のプロパティだけ抜き出し、残りをまとめて下位コンポーネントへ渡す
    例：const { className, ...restProps } = props; <div {...restProps} />

  「欲しいものだけ抜く / 不要なものだけ捨てる」を宣言的に書けるのが利点。
*/

const user = {
  id: 1,
  name: 'Patty Rabbit',
  email: 'patty@maple.town',
  age: 8,
};

// ✅ id を取り出し、残りのプロパティを userWithoutId にまとめる（id は除外される）
const { id, ...userWithoutId } = user;

console.log(id, userWithoutId);
// -> 1 { name: 'Patty Rabbit', email: 'patty@maple.town', age: 8 }