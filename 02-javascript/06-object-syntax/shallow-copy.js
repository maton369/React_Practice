/*
  ✅ このコードは「オブジェクトスプレッドはシャローコピー（浅いコピー）である」ことを示す例である。
  見た目は “コピーして別オブジェクトを作った” ように見えるが、
  ネストしたオブジェクト（address）は参照が共有されるため、
  片方を変更するともう片方にも影響が出る。

  React の state 更新でも同じ落とし穴があるので重要。

  ------------------------------------------------------------
  1) 初期状態：patty はネストを含むオブジェクト
  ------------------------------------------------------------
  patty = {
    name: 'Patty Rabbit',
    email: 'patty@maple.town',
    address: { town: 'Maple Town' }
  }

  ここで address は “別オブジェクト” であり、
  patty.address はそのオブジェクトへの参照（ポインタのようなもの）を持っている。

  ------------------------------------------------------------
  2) rolley の生成：{ ...patty, name: 'Rolley Cocker' }
  ------------------------------------------------------------
  const rolley = { ...patty, name: 'Rolley Cocker' };

  これは概念的に次の処理：

  (1) 新しい空オブジェクト target を作る
  (2) patty の列挙可能な自前プロパティを target にコピーする（シャロー）
      - name: 'Patty Rabbit'
      - email: 'patty@maple.town'
      - address: (⚠️ ここは address オブジェクト“そのもの”ではなく参照がコピーされる)
  (3) name: 'Rolley Cocker' を適用して name を上書きする（後勝ち）

  結果：
  - rolley は patty とは別オブジェクト
  - しかし rolley.address と patty.address は “同じ address オブジェクト” を参照している

  ------------------------------------------------------------
  3) その後の更新：どれが共有され、どれが共有されないか
  ------------------------------------------------------------
  rolley.email = 'rolley@palm.town';
  - email は “プリミティブ（文字列）” なので、
    rolley.email というプロパティ値が更新されるだけ
  - patty.email には影響しない（別々のプロパティ）

  rolley.address.town = 'Palm Town';
  - address は参照共有されている “同一オブジェクト”
  - その中の town を変更すると、共有先である patty.address.town も同じ変更を観測する

  ------------------------------------------------------------
  4) 最終的に console.log(patty) はどうなる？
  ------------------------------------------------------------
  - patty.name は変更されない（name は rolley 側で上書きされたが別プロパティ）
      'Patty Rabbit'
  - patty.email も変更されない（rolley.email の更新は patty に影響しない）
      'patty@maple.town'
  - patty.address.town は変更される（address オブジェクトを共有しているため）
      'Palm Town'

  よって patty は最終的に概ねこう表示される：

    {
      name: 'Patty Rabbit',
      email: 'patty@maple.town',
      address: { town: 'Palm Town' }
    }

  ------------------------------------------------------------
  5) 実務上の教訓（Reactの不変更新での注意）
  ------------------------------------------------------------
  ネストした state を安全に更新したいなら、
  “ネストしたオブジェクトも新しく作る（深いレベルまでコピーする）” 必要がある。

  例（1段だけ深い場合）：
    const rolley = {
      ...patty,
      name: 'Rolley Cocker',
      address: { ...patty.address } // address も別オブジェクトにする
    };

  こうすると rolley.address と patty.address の参照共有が切れる。
*/

const patty = {
  name: 'Patty Rabbit',
  email: 'patty@maple.town',
  address: { town: 'Maple Town' }, // ✅ ネストしたオブジェクト（参照型）
};

// ✅ シャローコピー：トップレベルのプロパティは新オブジェクトにコピーされるが、address は参照がコピーされる
const rolley = { ...patty, name: 'Rolley Cocker' };

// ✅ email は文字列（プリミティブ）なので rolley 側だけが更新される
rolley.email = 'rolley@palm.town';

// ⚠️ address は参照共有なので、ネスト先を変更すると patty 側の address も同じ変更が見える
rolley.address.town = 'Palm Town';

console.log(patty); // address.town が 'Palm Town' に変わって表示される