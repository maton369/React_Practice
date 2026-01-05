/*
  ✅ このコードは ES Modules（ESM）における
  - named import（名前付きインポート）
  - import 時の別名（as によるリネーム）
  - デフォルト引数（default parameter）
  - named export と default export の併用
  をまとめて扱う例である。

  ------------------------------------------------------------
  1) import のアルゴリズム：公開バインディングを名前で束縛する（live binding）
  ------------------------------------------------------------
  import { ONE, TWO as ZWEI } from './constants.js';

  これは constants.js が公開している named export のうち、
  - ONE を同名で受け取る
  - TWO を “ZWEI” というローカル名で受け取る（リネーム）
  という宣言である。

  ここで重要なのは、import は “値のコピー” ではなく
  「相手モジュールの公開バインディングへの参照（live binding）」を束縛するモデルであること。
  （ただし今回の ONE/TWO は const なので変化しないが、仕組みとしては参照。）

  ------------------------------------------------------------
  2) named export：plus を外部に公開する
  ------------------------------------------------------------
  export const plus = (n, m = ONE) => n + m;

  これは
  - plus という関数を定義し
  - それを named export として公開する
  という意味。

  関数の中身は単純だが、注目はデフォルト引数：

    (n, m = ONE)

  - 呼び出し側が第2引数 m を渡さなかった場合、m は ONE（= 1）になる
  - m を渡した場合は、その値が優先される

  アルゴリズムとしては「関数呼び出し時に引数が undefined ならデフォルト式を評価して代入」
  というルールで動く。
  ※ `null` は undefined ではないのでデフォルトは発動しない点に注意。

  ------------------------------------------------------------
  3) times はモジュール内ローカル関数（ただし後で default export する）
  ------------------------------------------------------------
  const times = (n, m = ZWEI) => n * m;

  - times はこのモジュール内で定義される関数
  - デフォルト引数に ZWEI（= TWO の別名）を使っているため、
    第2引数を省略すると “2倍” の関数になる（m=2）

  ------------------------------------------------------------
  4) default export：このモジュールの“代表値”として times を公開
  ------------------------------------------------------------
  export default times;

  ESM では
  - named export は複数持てる（plus など）
  - default export は各モジュール1つ（代表の公開値）
  という構造を取れる。

  require 的な “このモジュールを読み込んだらこれ” に近いのが default export。

  import 側では次のように受け取れる：

    import times, { plus } from './math.js';
    // times は default、plus は named

  ------------------------------------------------------------
  5) このモジュールが提供するAPI（外部から見えるもの）
  ------------------------------------------------------------
  - named export：plus(n, m=1)   -> n + m（デフォルトは 1）
  - default export：times(n, m=2) -> n * m（デフォルトは 2）
*/

import { ONE, TWO as ZWEI } from './constants.js'; // ✅ TWO を ZWEI というローカル名で受け取る

// ✅ named export：plus を外部へ公開（第2引数省略時は m=ONE=1）
export const plus = (n, m = ONE) => n + m;

// ✅ ローカル関数：times（第2引数省略時は m=ZWEI=2）
const times = (n, m = ZWEI) => n * m;

// ✅ default export：このモジュールの代表として times を公開
export default times;