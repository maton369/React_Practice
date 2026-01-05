/*
  ✅ このコードは “barrel module（集約モジュール）” である `./modules/index.js` から、
  - 数学関数（add, multiply）
  - 定数（TWO, TEN）
  - 名前空間（German.*）
  をまとめて import して使う例である。

  前提として index.js 側が以下のような再エクスポートを提供している想定：
  - constants.js から export * で ONE/TWO/TEN などの named export を再公開
  - math.js から `plus` を `add` として再公開し、default を `multiply` として再公開
  - constants2.js を `export * as German` で名前空間として再公開

  ------------------------------------------------------------
  1) import のアルゴリズム：再エクスポートされた公開名を束縛する
  ------------------------------------------------------------
  import { add, multiply, TWO, TEN, German } from './modules/index.js';

  ESM は実行前に import/export を静的に解析し、
  - index.js の公開インターフェースを確定
  - その中から add/multiply/TWO/TEN/German の “公開バインディング” を束縛する
  という手順でロードされる。

  ここで重要なのは、index.js 自身が値を生成しているとは限らず、
  多くが “他モジュールへのリンク（re-export）” になっている点。
  つまり import 側からは index.js を入り口にして、
  実体は constants.js / math.js / constants2.js の値へ到達している。

  ------------------------------------------------------------
  2) add と multiply の計算アルゴリズム（呼び出し）
  ------------------------------------------------------------
  add は（math.js の plus を add にリネームしたもの）で、
  - add(n, m) は n + m を返す（足し算）

  multiply は（math.js の default export を multiply という named にしたもの）で、
  - multiply(n, m) は n * m を返す（掛け算）

  ------------------------------------------------------------
  3) 実行結果（各行で何が起きるか）
  ------------------------------------------------------------
*/

import { add, multiply, TWO, TEN, German } from './modules/index.js';

/*
  console.log(add(5, TWO));

  - TWO は constants.js 由来の定数（2）
  - add(5, 2) = 7

  よって 7 が出力される。
*/
console.log(add(5, TWO));

/*
  console.log(multiply(4, TEN));

  - TEN は constants.js 由来の定数（10）
  - multiply(4, 10) = 40

  よって 40 が出力される。
*/
console.log(multiply(4, TEN));

/*
  console.log(multiply(German.FUNF, German.DREI));

  - German は constants2.js の export 群を束ねた名前空間オブジェクト
  - German.FUNF は 5
  - German.DREI は 3
  - multiply(5, 3) = 15

  よって 15 が出力される。

  ✅ 名前空間にまとめる利点：
  - “German.*” の下に閉じ込めることで名前衝突を避けられる
  - どの系列の定数かが一目で分かる（グルーピング）
*/
console.log(multiply(German.FUNF, German.DREI));

/*
  まとめ：出力は概ね
    7
    40
    15
  となる。
*/