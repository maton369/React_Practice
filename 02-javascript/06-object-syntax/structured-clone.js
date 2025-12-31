/*
  ✅ このコードは `structuredClone` を使って、
  ネストを含むオブジェクトを “深いコピー（deep clone）” し、
  コピー先を変更しても元（patty）が影響を受けないことを示している。

  前の例（スプレッド）との違いはここ：
  - スプレッド `{ ...patty }` はシャローコピーなので address の参照を共有してしまう
  - structuredClone(patty) はネストも含めて複製するため参照共有が起きない

  ------------------------------------------------------------
  1) structuredClone のアルゴリズム（概念）
  ------------------------------------------------------------
  `structuredClone(value)` は、値を “構造として再帰的に複製” する。
  概念的には：

  - プリミティブ（数値/文字列/真偽値/null/undefined 等）はそのままコピー
  - オブジェクト/配列は「新しい入れ物」を作り、内部要素/プロパティも再帰的に複製
  - その結果、ネストしたオブジェクトも別インスタンスになり、
    元とコピー先で参照を共有しない状態になる

  今回の patty の場合：
    patty.address はオブジェクトなので、
    structuredClone は
      rolley.address として “別の address オブジェクト” を作って中身をコピーする。

  つまり
    rolley !== patty
    rolley.address !== patty.address
  が成立する（参照が完全に分離される）。

  ------------------------------------------------------------
  2) 実行の流れ：どの変更がどこに効くか
  ------------------------------------------------------------
  const rolley = structuredClone(patty);
    -> patty と同じ構造を持つ “別オブジェクト” を作る
    -> ネストの address も別物になる

  rolley.name = 'Rolley Cocker';
  rolley.email = 'rolley@palm.town';
    -> いずれも rolley 側のトップレベルプロパティの更新であり、
       patty には影響しない

  rolley.address.town = 'Palm Town';
    -> address も別オブジェクトなので、
       patty.address.town には影響しない

  ------------------------------------------------------------
  3) 最終的に console.log(patty) はどうなる？
  ------------------------------------------------------------
  patty は一切更新されていないため、初期状態のまま出力される。

    {
      name: 'Patty Rabbit',
      email: 'patty@maple.town',
      address: { town: 'Maple Town' }
    }

  ------------------------------------------------------------
  4) 注意点（実務）
  ------------------------------------------------------------
  structuredClone は便利だが万能ではない。
  例として、関数・DOMノードなどはクローンできない/想定外になり得る。

  また深いコピーはコストが高くなることがあるため、
  Reactの state 更新では「必要な部分だけをスプレッドでコピーする（部分的な不変更新）」
  という戦略を採ることも多い。
*/

const patty = {
  name: 'Patty Rabbit',
  email: 'patty@maple.town',
  address: { town: 'Maple Town' }, // ✅ ネストした参照型データ
};

// ✅ 深いコピー：ネストも含めて別オブジェクトを再帰的に複製する
const rolley = structuredClone(patty);

// ✅ 以降の変更はすべて rolley 側だけに反映され、patty は影響を受けない
rolley.name = 'Rolley Cocker';
rolley.email = 'rolley@palm.town';
rolley.address.town = 'Palm Town';

console.log(patty); // ✅ 初期状態のまま（town も 'Maple Town' のまま）