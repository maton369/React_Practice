/*
✅ このファイルは ESLint の “Flat Config” 形式（eslint/config の defineConfig）で、
JavaScript / TypeScript / React（+ Hooks + React Refresh）向けのルールセットを組み立てている設定である。

大枠のアルゴリズムは「複数の設定ブロックを配列で順番に適用し、対象ファイルを絞りつつ、
推奨ルール群（recommended）を合成して、最後にプロジェクト固有の微調整を重ねる」というもの。

ポイント：
- Flat Config は `.eslintrc` のようなネスト構造ではなく、
  “設定オブジェクトの配列” を上から順に適用していく設計になっている。
- このファイルでは
  1) 対象ファイルパターンの指定
  2) 無視パターンの指定
  3) グローバル変数（browser / es2025）の指定
  4) JS 推奨ルール
  5) TS 推奨ルール
  6) React/Hooks/Refresh 推奨ルール + 微調整
  を順に積み上げている。
*/

import globals from 'globals';
/*
  ✅ `globals` パッケージは環境ごとの “グローバル変数一覧” を提供する。
  - 例：browser なら window, document, fetch など
  - 例：es2025 なら Promise, Map, Set などの標準ビルトイン

  これを ESLint に渡すことで「未定義変数扱い」を避けられる。
*/

import pluginJs from '@eslint/js';
/*
  ✅ ESLint 公式の JavaScript 推奨設定が入っている。
  - `pluginJs.configs.recommended` は “まず入れておくべき” 基本ルール群。
*/

import tsEsLint from 'typescript-eslint';
/*
  ✅ TypeScript 用の ESLint 設定（typescript-eslint）。
  - `tsEsLint.configs.recommended` は TS の型システムと相性の良い推奨ルール群。
  - Flat Config 用にまとめて提供されている。
*/

import pluginReact from 'eslint-plugin-react';
/*
  ✅ React 向けの lint ルール集。
  - JSX の書き方、コンポーネントの慣習、props の扱いなどに関するルールを提供。
*/

import pluginHooks from 'eslint-plugin-react-hooks';
/*
  ✅ React Hooks 専用のルール集。
  - 代表例：Rules of Hooks（Hook を条件分岐で呼ばない等）
  - 代表例：useEffect の依存配列の漏れ検知（exhaustive-deps）
  フックを使う React では事実上必須。
*/

import pluginRefresh from 'eslint-plugin-react-refresh';
/*
  ✅ React Fast Refresh（Vite などの HMR）と相性良くするためのルール集。
  - “export の形” を制約して、ホットリロード時に state が壊れにくくする。
*/

import { defineConfig } from 'eslint/config';
/*
  ✅ Flat Config 用のヘルパー。
  - defineConfig([...]) の配列を ESLint が解釈して設定として読み込む。
*/

// ------------------------------------------------------------
// 1) React 用の設定ブロックを “再利用可能な塊” として定義
// ------------------------------------------------------------
const reactConfig = {
  name: 'React Config',
  /*
    ✅ name は設定ブロックに名前を付ける（ログやデバッグ時に分かりやすい）。
  */

  files: ['src/**/*.{js,ts,jsx,tsx}'],
  /*
    ✅ このブロックが適用されるファイル範囲。
    - React 関連の lint は src 配下の JS/TS/JSX/TSX のみに当てる、という意思表示。
    - これにより、設定ファイルやビルド成果物などに React ルールが誤適用されにくい。
  */

  settings: {
    react: { version: 'detect' },
  },
  /*
    ✅ eslint-plugin-react の設定。
    - version: 'detect' は、プロジェクト依存の React バージョンを自動検出して
      そのバージョンに合った lint を行う。
  */

  plugins: {
    react: pluginReact,
    'react-hooks': pluginHooks,
    'react-refresh': pluginRefresh,
  },
  /*
    ✅ Flat Config では plugins は “名前 → プラグイン本体” のマップで登録する。
    - 以後 rules で "react/..." や "react-hooks/..." のように参照できる。
  */

  rules: {
    // ------------------------------------------------------------
    // 2) recommended ルールを “合成” してベースラインを作る
    // ------------------------------------------------------------
    ...pluginReact.configs.flat.recommended.rules,
    ...pluginHooks.configs.recommended.rules,
    ...pluginRefresh.configs.recommended.rules,
    /*
      ✅ recommended ルール群をスプレッドで合成している。
      アルゴリズムとしては：
      - まず React 推奨ルールを取り込む
      - 次に Hooks 推奨ルールを取り込む
      - 次に Refresh 推奨ルールを取り込む
      という “ルール辞書のマージ” を行っている。

      注意：
      - 同じキー（ルール名）が重複した場合、後勝ちで上書きされる。
      - つまりこの順番が “優先順位” になる。
    */

    // ------------------------------------------------------------
    // 3) プロジェクト都合の微調整（React 17+ / new JSX transform 対応）
    // ------------------------------------------------------------
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    /*
      ✅ これらは昔の React（旧 JSX トランスフォーム）で必要だったルール。
      - 以前は JSX を使うときに `import React from 'react'` が必須だったため
        “React が未使用扱いにならないようにする” ルールが存在した。
      - しかし React 17+（および Vite + plugin-react の一般設定）では
        JSX の変換に React を明示 import しなくても良い（new JSX transform）。
      そのため、この2つは off にするのが自然。
    */
  },
};

// ------------------------------------------------------------
// 4) defineConfig：設定ブロックを配列で順番に積む（Flat Config の本体）
// ------------------------------------------------------------
export default defineConfig([
  // ------------------------------------------------------------
  // (A) 対象ファイルの “大枠” を指定
  // ------------------------------------------------------------
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'] },
  /*
    ✅ この設定オブジェクトは “解析対象となる拡張子” を広めに宣言している。
    - JS/TS だけでなく、mjs/cjs/mts/cts などのモジュール形式も含めている。
    - Flat Config では files で対象を絞るのが基本動線。
  */

  // ------------------------------------------------------------
  // (B) 無視するファイル・ディレクトリ
  // ------------------------------------------------------------
  { ignores: ['{dist,build,public,node_modules}/**', '**/*.config.*'] },
  /*
    ✅ ビルド成果物や依存、公開資材など lint 対象外にしたいものを除外する。
    - dist/build: 生成物（触っても直すべきでない）
    - node_modules: 依存（対象外）
    - public: 生成物/静的資材が混ざりやすい
    - **/*.config.*: 設定ファイルは別ポリシーにしたい場合が多い
  */

  // ------------------------------------------------------------
  // (C) languageOptions：グローバル変数を環境に合わせて登録
  // ------------------------------------------------------------
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
      },
    },
  },
  /*
    ✅ ここでは ESLint に「このプロジェクトはブラウザ + 最新 ECMAScript 環境だ」と教えている。
    - browser を入れると window/document/fetch 等が未定義扱いになりにくい
    - es2025 を入れると最新 built-ins を認識できる

    アルゴリズム的には “許可済み識別子の集合” を globals に登録している。
  */

  // ------------------------------------------------------------
  // (D) JS 推奨ルールを適用
  // ------------------------------------------------------------
  pluginJs.configs.recommended,
  /*
    ✅ ESLint 公式の JavaScript recommended を追加。
    - これにより一般的なバグ（未使用変数、危険な比較など）を早期に検知できる。
  */

  // ------------------------------------------------------------
  // (E) TS 推奨ルールを適用
  // ------------------------------------------------------------
  tsEsLint.configs.recommended,
  /*
    ✅ TypeScript recommended を追加。
    - TS の型情報に基づく lint を含む。
    - ただし “型情報が必要な重いルールセット” は recommended とは別にあることも多い。
      （ここではまず基本セットを入れている設計）
  */

  // ------------------------------------------------------------
  // (F) React + Hooks + Refresh を src 配下に適用（reactConfig）
  // ------------------------------------------------------------
  reactConfig,
  /*
    ✅ 最後に React 関連の塊を足す。
    - files: src 配下限定なので、設定ファイル等には適用されない。
    - recommended 群をまとめて入れつつ、React 17+ の JSX transform で不要なルールは off にしている。

    “最後に置く” ことで、必要なら前段のルールを上書きして最終形を作れる（後勝ち）。
  */
]);

/*
✅ まとめ（この設定の設計意図）：
- Flat Config の “配列を上から順に適用” というアルゴリズムに沿い、
  1) 対象範囲 → 2) 無視 → 3) 環境 → 4) JS → 5) TS → 6) React
  の順に積み上げている。
- recommended をベースにしつつ、React 17+ に不要な2ルールを off にしている。
- React/Hooks/Refresh を 1つの reactConfig にまとめて、責務を見通し良くしている。
*/