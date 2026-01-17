// ✅ これは Vite の設定ファイル（vite.config.ts）で、
// - React 用の公式プラグイン（@vitejs/plugin-react）
// - tsconfig の paths（パスエイリアス）を Vite に反映するプラグイン（vite-tsconfig-paths）
// を有効化している最小構成である。
//
// アルゴリズム的な本質は：
// 1) defineConfig に設定オブジェクトを渡して、Vite が読む “構成データ” を定義する
// 2) plugins 配列にプラグイン関数の戻り値（プラグインオブジェクト）を並べる
// 3) Vite は起動時にこのプラグイン列を読み込み、ビルド/開発サーバのパイプラインへ組み込む
//
// つまり「Vite の処理（変換・解決・HMRなど）にフックを差し込む」ための拡張設定である。

import { defineConfig } from 'vite';
/*
  ✅ defineConfig は Vite の設定を型安全に書くためのヘルパー。
  - 返すオブジェクトの型が ViteConfig として推論され、補完が効く。
  - JS 的には「そのままオブジェクトを返す」だけに近いが、
    TypeScript 的に設定ミスを減らす効果が大きい。

  アルゴリズム観点では：
  - “設定データのスキーマ” を TypeScript の型で検証するためのラッパー。
*/

import react from '@vitejs/plugin-react';
/*
  ✅ React プラグイン。
  - React の JSX/TSX を高速に変換する（内部で Babel や SWC を使う構成が一般的）。
  - React Fast Refresh（状態を保ちながらのホット更新）を有効化する役割も持つことが多い。
  - 開発サーバでの HMR の体験に直結する。

  アルゴリズム的には：
  - “ソースコード変換パイプライン” に React 用の変換器と HMR フックを追加する。
*/

import tsconfigPaths from 'vite-tsconfig-paths';
/*
  ✅ tsconfig の "compilerOptions.paths" を読み取り、
  Vite のモジュール解決（import 解決）に反映するプラグイン。

  例：
    tsconfig に
      "paths": { "@/*": ["src/*"] }
    があると、
      import x from "@/foo"
    のような import を Vite が解決できるようになる。

  アルゴリズム的には：
  - import 文字列（例：@/foo）を受け取り、
    tsconfig の paths ルールに従って実ファイルパスへ写像し、
    その結果を Vite の解決器に返す “リライト（解決）アルゴリズム” を提供している。
*/

// https://vite.dev/config/
export default defineConfig({
    /*
      ✅ Vite はこの default export を読み込んで設定として使う。
      - ESM（export default）なので、Node 側でも ESM として扱う構成が前提。
  
      defineConfig(...) により、設定の型がチェックされるため、
      設定キーの typo や型不一致をコンパイル時に検出しやすい。
    */

    plugins: [react(), tsconfigPaths()],
    /*
      ✅ plugins は “Vite の処理パイプラインに追加する拡張モジュールの列”。
  
      ここでやっていること：
      - react() を呼ぶ → React プラグインオブジェクトを生成
      - tsconfigPaths() を呼ぶ → paths 解決プラグインオブジェクトを生成
      - それらを配列にして Vite に渡す
  
      アルゴリズム的なイメージ：
      - Vite はリクエスト/ビルド対象の各モジュールに対して
        1) 解決（resolve）
        2) 読み込み（load）
        3) 変換（transform）
        4) HMR など
        といった処理段階を持つ。
      - プラグインはそれぞれの段階にフック（関数）を提供し、
        Vite が段階ごとに順番に呼び出す。
      - その結果、TSX 変換やパスエイリアス解決が自然に組み込まれる。
  
      ※ 配列の順序が影響するケースもある（解決や変換の優先順位）。
         この2つは典型的には相性が良く、テンプレとしてよく見かける並び。
    */
});