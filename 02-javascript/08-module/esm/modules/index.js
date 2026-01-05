/*
  ✅ このファイルは ES Modules（ESM）の「再エクスポート（re-export）」を集約して、
  いわゆる “barrel module（窓口モジュール）” を作っている例である。

  目的はざっくり：
  - 複数ファイルに散った export を 1箇所に集約して import を簡単にする
  - 公開API名を揃える（plus を add にする等）
  - 特定モジュールを名前空間ごとにぶら下げる（German.* のように）

  ------------------------------------------------------------
  0) ESM の export は「値のコピー」ではなく「公開バインディング（live binding）」
  ------------------------------------------------------------
  re-export も同じで、元モジュールの export とリンクした “参照” を外に出す。
  元が（let などで）変化する場合、参照先の値も追従する。

  また、このモジュールを import したときブラウザ/Node は
  - import/export を静的解析して依存モジュールをロードし
  - 依存を評価してから
  - このモジュールの公開インターフェースを確定する
  という流れで動く。

  ------------------------------------------------------------
  1) export * from './constants.js';
  ------------------------------------------------------------
  これは「constants.js の named export を全部、ここからも再公開する」という宣言。

  アルゴリズム的には：
  - constants.js の公開名一覧（named exports）を列挙し
  - それらをこのモジュールの export 表面に “委譲” する（リンクを張る）

  ✅ 重要な注意：
  - `export *` は “default export” は再公開しない
    （default を出したいなら `export { default } from ...` が必要）

  ⚠️ もう1つの注意（衝突）：
  - 別の `export *` が同じ名前を持っている場合、衝突名は曖昧になり得る
    （その名前がこのモジュールから import できなくなる／エラーになるケースがある）
  - 意図的に公開したい名前は、次のように “明示的 re-export” にして衝突を避けるのが安全

  ------------------------------------------------------------
  2) export { plus as add, default as multiply } from './math.js';
  ------------------------------------------------------------
  これは “明示的 re-export（名前を指定して再公開）” で、2つのことを同時にやっている。

  (A) plus as add
    - math.js の named export `plus` を
    - このモジュールでは `add` という公開名にリネームして再公開する

    つまり外部からは：
      import { add } from './index.js';
    のように `add` で使える（plus という名前はこの窓口では出さない方針にできる）。

  (B) default as multiply
    - math.js の default export を
    - このモジュールでは `multiply` という “named export” として再公開する

    つまり外部からは：
      import { multiply } from './index.js';
    のように “名前付きで” default を使える。

  ✅ ここがポイント：
  - default export は「そのモジュールの代表値」だが、
    re-export するときに名前を付け直して “普通の named export として配れる”
  - barrel 側のAPI命名を統一しやすい（例：add/multiply のように意味で揃える）

  ------------------------------------------------------------
  3) export * as German from './constants2.js';
  ------------------------------------------------------------
  これは “名前空間（namespace）として再公開” する構文（namespace export）。

  アルゴリズム的には：
  - constants2.js の named exports をまとめた “名前空間オブジェクト” を作り
  - それを `German` という名前でこのモジュールから再公開する

  使う側は：
    import { German } from './index.js';
    German.SOMETHING
  のようにアクセスできる。

  ✅ ねらい：
  - constants2.js が提供する名前を、グローバルにばら撒かず “German.*” の下に閉じ込められる
  - 名前衝突を避けつつ、関連する定数群をグルーピングできる

  ------------------------------------------------------------
  4) まとめ：この barrel が提供する公開API
  ------------------------------------------------------------
  - constants.js の named exports 全部（default を除く）
  - math.js の `plus` を `add` として公開
  - math.js の default を `multiply` として公開
  - constants2.js の export を `German.*` としてまとめて公開

  つまり、利用側は “この1ファイルだけ import すれば良い” という構造になる。
*/

export * from './constants.js';
export { plus as add, default as multiply } from './math.js';
export * as German from './constants2.js';