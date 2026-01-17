// ✅ これは Radix UI の Avatar コンポーネント（@radix-ui/react-avatar）をラップして、
// Tailwind のデフォルトスタイルと `className` 拡張を付けた “薄いラッパー層” である。
// shadcn/ui 系でよく見るパターンで、目的は次の3つ：
// 1) Radix のアクセシビリティ/挙動（Primitive）をそのまま利用する
// 2) デザインシステム（Tailwind のクラス）をデフォルトで付与する
// 3) 呼び出し側が className を追加で渡せるように合成する（cn）
//
// アルゴリズム的な本質は：
// - 「Props 型を Primitive から継承し（ComponentProps<typeof ...>）
//    受け取った props を {...props} でそのまま下流へ転送し、
//    className だけを cn で “合成（merge）” して上書き可能にする」
// という “透過的プロキシ（proxy）” の設計である。

import * as React from "react"
/*
  ✅ React 名前空間を import。
  - ここでは主に型（React.ComponentProps）を使うために必要。
  - JSX の型解決や TS の型参照のために import しているイメージ。
*/

import * as AvatarPrimitive from "@radix-ui/react-avatar"
/*
  ✅ Radix UI の Avatar Primitive 一式を import。
  - AvatarPrimitive.Root / Image / Fallback などを含む。
  - Primitive はアクセシビリティやキーボード操作などの “正しい挙動” を内包し、
    見た目は呼び出し側で付ける設計になっている。
*/

import { cn } from "@/lib/utils"
/*
  ✅ className を安全に合成するユーティリティ。
  - shadcn/ui でよくある cn は、実体として
    - 文字列の結合
    - falsy を無視
    - 条件付きクラス
    - Tailwind の競合解決（tailwind-merge）
    などをまとめてやる関数であることが多い。

  アルゴリズム的には：
  - className の “集合” を入力として受け取り、
    それらを1つの className 文字列へ正規化（normalize）する関数。
*/

// ------------------------------------------------------------
// 1) Avatar（Root）
// ------------------------------------------------------------
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  /*
    ✅ 引数で props を分割代入し、className を取り出して残りを ...props にまとめる。

    - React.ComponentProps<typeof X> は “X コンポーネントが受け取れる props 型” を抽出する型。
      つまり Avatar は Root と同じ props を受け取れる（透過性が高い）。

    アルゴリズム観点：
    - ラッパーで勝手に props の型を作らず、下流（Primitive）と完全同期させることで、
      Primitive 側の API 変更に追従しやすい。
  */

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      /*
        ✅ data-slot は “ここが avatar の root” であることを示すマーカー。
        - CSS/テスト/デバッグ/スタイル適用で参照しやすくする目的が多い。
        - shadcn/ui が部品を識別するために付けることがある。
      */

      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      /*
        ✅ className の合成がこのラッパーの最重要機能。

        - 1つ目の文字列は “デフォルトスタイル”：
          - relative: 子要素を absolute で配置したい時の基準
          - flex: 中身を並べる/整列するためのレイアウト
          - size-8: 幅/高さの基本サイズ
          - shrink-0: flex 内で縮まない
          - overflow-hidden: 画像のはみ出しを隠して丸く切り抜く
          - rounded-full: 完全な円形

        - 2つ目の className は呼び出し側の追加指定。
        - cn が両方をマージし、最終的な className を決定する。

        アルゴリズム的には：
        - “デフォルト集合” と “ユーザー上書き集合” をマージして正規化する処理。
      */

      {...props}
      /*
        ✅ 残りの props をそのまま転送（forward）する。
        - onClick, style, children, asChild, ref, etc...（Root が受け取れるもの全て）
        - ラッパーが挙動を変えず、見た目のデフォルトだけ足す、という設計。

        アルゴリズム的には：
        - このコンポーネントは “関数的変換” をほぼ行わず、
          className と data-slot だけ付けて下流へ伝搬するプロキシ。
      */
    />
  )
}

// ------------------------------------------------------------
// 2) AvatarImage（画像部分）
// ------------------------------------------------------------
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  /*
    ✅ Image Primitive の props 型をそのまま継承し、
    className だけ合成して転送するという同じパターン。
  */

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      /*
        ✅ 画像は “正方形で、親いっぱいに広がる” というデフォルト。
        - aspect-square: アスペクト比を 1:1 にする
        - size-full: 親要素の幅/高さにフィットさせる

        親 Root が overflow-hidden + rounded-full なので、
        画像は円形に切り抜かれて表示される。
      */
      {...props}
      /*
        ✅ src, alt, onLoad, ref など Image が受け取れる props をそのまま渡す。
      */
    />
  )
}

// ------------------------------------------------------------
// 3) AvatarFallback（画像がない/読み込み失敗時の代替表示）
// ------------------------------------------------------------
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  /*
    ✅ Fallback Primitive の props 型を継承。
    - 画像が表示できない時に、イニシャルやアイコンなどを表示する領域。
  */

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      /*
        ✅ Fallback は “中央寄せの円形領域” をデフォルトにしている。
        - bg-muted: 背景色（テーマのミュート色）
        - flex + items-center + justify-center: 子要素を中央揃え
        - size-full: 親いっぱい
        - rounded-full: 円形

        Root と同サイズで重なる設計なので、
        画像がない場合でも “円形アバター” の見た目を維持できる。
      */
      {...props}
      /*
        ✅ children（例：イニシャル）や遅延表示の設定など、
        Fallback が受け取れる props をそのまま転送。
      */
    />
  )
}

// ------------------------------------------------------------
// 4) exports：3つをセットで公開
// ------------------------------------------------------------
export { Avatar, AvatarImage, AvatarFallback }
/*
  ✅ 利用側は
    <Avatar>
      <AvatarImage src="..." />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  のように “合成（composition）” で使う。

  アルゴリズムまとめ：
  - Radix Primitive が「正しい挙動」を担保
  - このファイルは「デフォルト見た目」と「className 合成」と「props 透過転送」を担保
  - 見た目と挙動を分離しつつ、再利用性を最大化するラッパー設計である
*/