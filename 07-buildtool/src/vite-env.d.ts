// ✅ これは Vite 環境変数（import.meta.env）に TypeScript の型を与えるための宣言ファイルの一部である。
// 目的は「Vite が注入する import.meta.env の形」をコンパイル時に型安全に扱えるようにすること。
//
// アルゴリズム的な本質は：
// 1) Vite がビルド/開発サーバ時に環境変数（VITE_ から始まるもの等）を取り込み、
//    クライアントコードへ `import.meta.env` として “値” を注入する
// 2) TypeScript は実行時の注入を知らないため、型宣言（d.ts）で “こういう形が来る” と教える
// 3) その結果、コード側で `import.meta.env.VITE_APP_TITLE` を参照したときに
//    - 型補完が効く
//    - 存在しないキー参照をコンパイル時に弾ける
// という静的検証パイプラインが成立する。
//
// つまり「実行時注入（Vite）を、静的型（TypeScript）へ写像して安全性を得る」ための橋渡しである。

/// <reference types="vite/client" />
/*
  ✅ Triple-slash directive（トリプルスラッシュディレクティブ）。
  - TypeScript に対して「vite/client の型定義をこのファイルに含めてね」と指示する。
  - これにより、Vite が提供する基本的な型（import.meta など）の土台が読み込まれる。

  アルゴリズム観点では：
  - “型定義の依存解決” をコンパイラに明示して、
    後述の interface 拡張（宣言マージ）を成立させる前提を用意している。
*/

// ------------------------------------------------------------
// 1) ImportMetaEnv：import.meta.env の “中身” の型定義
// ------------------------------------------------------------
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    /*
      ✅ Vite のクライアント環境で参照できる環境変数のうち、
      このプロジェクトで使うものを宣言する。
  
      - `VITE_` プレフィックスは、Vite がクライアントへ露出させる変数として扱う慣習/仕様。
        （Vite は安全のため、基本的に VITE_ 以外はクライアントに出さない運用が一般的。）
  
      - readonly にしているのは、
        「これはビルド時/起動時に注入された値で、実行中に書き換えるべきものではない」
        という意図を型で表現するため。
  
      アルゴリズム的には：
      - キー集合（VITE_APP_TITLE）を静的に固定し、
        参照可能な環境変数を “型のドメイン” として定義している。
    */
}

// ------------------------------------------------------------
// 2) ImportMeta：import.meta の型定義（env を ImportMetaEnv にする）
// ------------------------------------------------------------
interface ImportMeta {
    readonly env: ImportMetaEnv;
    /*
      ✅ `import.meta.env` の型を ImportMetaEnv に結び付ける。
  
      - ImportMeta は TS/ESM の import.meta の型。
      - ここで env の型を上書き（拡張）することで、
        `import.meta.env.VITE_APP_TITLE` が string として扱えるようになる。
  
      アルゴリズム観点では：
      - “実行時に存在するオブジェクト構造（import.meta.env）” を
        “静的に扱える構造（ImportMetaEnv）” へマッピングしている。
    */
}

/*
  ✅ 補足：このコードは通常 `vite-env.d.ts` のような .d.ts ファイルに置く。
  - .ts だと実行コードとして扱われる可能性があるため、
    型宣言として確実に扱いたい場合は .d.ts が定番。

  ✅ 効果：
  - `import.meta.env.VITE_APP_TITLE` を参照すると補完が効く
  - 存在しない `import.meta.env.VITE_FOO` などはコンパイルエラーにできる
*/