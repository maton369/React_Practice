/*
✅ この Timer は「表示（UI）」と「ロジック（タイマー処理）」を分離した実装である。
- Timer コンポーネント自体は “見た目” と “イベントの接続” に集中する
- タイマーの状態管理（countLeft の更新、interval の開始/停止、0でのリセット等）は
  カスタムフック useTimer に委譲している

アルゴリズム観点で言うと：
- UI層（Timer）は「状態を受け取って描画する関数」
- ロジック層（useTimer）は「時間イベントを入力として state を遷移させる状態機械」
という責務分離になっている。

この分離のメリット：
- Timer を “純粋に近い” コンポーネントとして保てる（テストしやすい / 再利用しやすい）
- タイマー処理（副作用）を useTimer へ集約でき、複数画面で同じ挙動を使い回せる
- UI とロジックの変更が独立し、理解負債が減る
*/

import { RotateCw } from 'lucide-react';
/*
  ✅ リセットボタンに表示するアイコンコンポーネント。
  - 見た目担当であり、タイマーのアルゴリズムとは無関係。
*/

import { useTimer } from '@/hooks/use-timer.ts';
/*
  ✅ カスタムフック（Custom Hook）。
  - React のフックを組み合わせて “タイマー” というまとまった機能を提供するための抽象化。

  想定されるアルゴリズム（典型例）：
  - state: countLeft
  - event: every 1s tick → countLeft := countLeft - 1
  - rule: countLeft === 0 → countLeft := maxCount
  - api: reset() → countLeft := maxCount
  - resource: setInterval を開始し、cleanup で clearInterval する

  ここで重要なのは、Timer コンポーネント側には
  「interval をどう張るか」「0の扱いをどうするか」などの詳細が一切露出していない点である。
*/

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
/*
  ✅ UI コンポーネント（見た目担当）。
  - タイマーの状態遷移アルゴリズムとは独立。
*/

// ------------------------------------------------------------
// 1) Props：maxCount は任意。省略時は 60。
// ------------------------------------------------------------
interface TimerProps {
  maxCount?: number;
}

function Timer({ maxCount = 60 }: TimerProps) {
  /*
    ✅ props を分割代入で受け取り、maxCount のデフォルト値を 60 にする。
    - 親が maxCount を渡さない場合でも、タイマーとして動く最低限の仕様を確保する。
  */

  // ------------------------------------------------------------
  // 2) ロジックは useTimer に委譲し、UIは値と操作だけを受け取る
  // ------------------------------------------------------------
  const [countLeft, reset] = useTimer(maxCount);
  /*
    ✅ useTimer(maxCount) は「タイマー機能」を提供するカスタムフックである。

    返り値が [countLeft, reset] になっている点が設計として重要で、
    - countLeft: “現在の残りカウント” という状態（state）
    - reset: “初期値へ戻す操作” という手続き（action）
    を UI に渡している。

    アルゴリズム観点：
    - Timer コンポーネントは state machine の “観測者” と “操作入力者” に徹している。
    - 実際の状態遷移や副作用（interval 管理）は useTimer 内にカプセル化されている。

    ⚠️ 注意（仕様の焦点）：
    - maxCount を useTimer に渡しているので、maxCount が変わると
      useTimer 内がどう反応するか（追従するか／初期値を固定するか）は useTimer の実装次第。
      UI 側はその仕様に従うだけ、という関係になっている。
  */

  // ------------------------------------------------------------
  // 3) 描画：countLeft を投影し、reset をボタンイベントに接続する
  // ------------------------------------------------------------
  return (
    <Card className="w-80 shadow-md gap-2">
      <CardHeader>
        <div className="text-xl font-medium text-center">Count</div>
      </CardHeader>

      <CardContent className="flex justify-center pb-2">
        <div className="text-4xl font-semibold">{countLeft}</div>
        {/*
          ✅ 状態 countLeft を UI に表示する。
          - useTimer 内で state が更新されると再レンダーが起き、
            この表示が最新値へ更新される（宣言的 UI）。
        */}
      </CardContent>

      <CardContent className="flex mx-4">
        <Button className="w-full bg-red-500 hover:bg-red-600" onClick={reset}>
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        {/*
          ✅ Reset ボタン押下で reset() を呼ぶ。
          - UIイベント → action(reset) → useTimer 内の状態遷移 → 再レンダー
          というデータフローになる。

          ここで Timer は “reset が何をしているか” を知らない。
          ただ「リセットという操作を要求する」だけで、実装詳細は useTimer に隠蔽される。
        */}
      </CardContent>
    </Card>
  );
}

export default Timer;
/*
  ✅ まとめ（このコンポーネントの設計思想）：
  - Timer: UI（描画とイベント接続）
  - useTimer: ロジック（状態管理・副作用・状態遷移ルール）

  React では「カスタムフック = ロジックの再利用単位」になりやすく、
  この形にすると複数の UI（別の見た目のタイマー）でも同じ useTimer を使い回せる。
*/