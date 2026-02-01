// ✅ Timer は「1秒ごとに減るカウントダウン」を React の state と effect で実装したコンポーネントである。
// - useState で残り秒数（countLeft）を保持する
// - setInterval で 1 秒ごとに tick（-1）を発火させる
// - useEffect の cleanup で interval を停止し、メモリリークや多重起動を防ぐ
// - countLeft が 0 になったら maxCount に戻してループさせる
//
// アルゴリズム的な本質は：
// 1) 状態：countLeft（残りカウント）
// 2) 時間イベント：毎秒 tick を呼び出して countLeft を 1 減らす
// 3) 停止条件：countLeft が 0 なら初期値へ遷移（循環）
// 4) リソース管理：コンポーネントの生存期間に合わせて interval を生成/破棄する
//
// つまり「時間駆動の状態機械（state machine）＋副作用（interval）のライフサイクル管理」である。

import { useEffect, useState } from 'react';
/*
  ✅ useState: コンポーネントに状態を持たせる
  ✅ useEffect: レンダリング後に副作用を実行し、必要なら cleanup で破棄する

  アルゴリズム観点：
  - interval のような “外部リソース” は React のレンダー関数の外で管理すべきで、
    useEffect がそのためのフックになる。
*/

import { RotateCw } from 'lucide-react';
/*
  ✅ リセットボタンに使うアイコン（SVG React コンポーネント）。
*/

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
/*
  ✅ UI 部品（shadcn/ui想定）。
  - 見た目の責務。タイマーのロジック（状態遷移）とは独立。
*/

// ------------------------------------------------------------
// 1) Props：maxCount は任意指定（省略時は 60）
// ------------------------------------------------------------
interface TimerProps {
  maxCount?: number;
}

function Timer({ maxCount = 60 }: TimerProps) {
  /*
    ✅ 分割代入で props を受け取り、maxCount のデフォルトを 60 に設定。
    - 親が maxCount を渡さない場合、maxCount は 60 になる。
  */

  // ------------------------------------------------------------
  // 2) 状態：残りカウント（countLeft）を保持
  // ------------------------------------------------------------
  const [countLeft, setCountLeft] = useState(maxCount);
  /*
    ✅ 初期状態は maxCount。
    - 初回レンダーでのみこの初期値が使われる点が重要。
      （maxCount が後から変わっても自動では初期化し直されない）
    - maxCount の変化に追従して初期化したい場合は別の設計（effect で同期等）が必要になる。

    アルゴリズム観点：
    - 状態セル countLeft を 1 つ持ち、表示はその投影。
  */

  // ------------------------------------------------------------
  // 3) 状態遷移：tick / reset
  // ------------------------------------------------------------
  function tick() {
    setCountLeft((c) => c - 1);
    /*
      ✅ 関数アップデートで 1 減らす。
      - interval のコールバックは “古いクロージャ” を掴みやすいが、
        関数アップデートなら常に最新 state を入力として扱えるので安全。

      状態遷移としては：
        f(c) = c - 1
    */
  }

  function reset() {
    setCountLeft(maxCount);
    /*
      ✅ リセットは maxCount に戻す。
      - これは「定数代入」に見えるが、maxCount は props なので外部入力に依存する。
      - 親が maxCount を変えた場合、reset は新しい maxCount を使う（レンダー時点の値）。
    */
  }

  // ------------------------------------------------------------
  // 4) 副作用その1：interval を開始し、アンマウント時に必ず停止する
  // ------------------------------------------------------------
  useEffect(() => {
    const timerId = setInterval(tick, 1000);
    /*
      ✅ 1秒ごとに tick を呼ぶタイマーを開始。
      - ここは “副作用” で、レンダー中にやると多重起動する危険があるため effect で実行する。
    */

    return () => clearInterval(timerId);
    /*
      ✅ cleanup（後始末）
      - コンポーネントがアンマウントされる、またはこの effect が再実行される直前に呼ばれる。
      - interval を止めないと、画面から消えても tick が走り続ける（リーク/バグ）。
    */
  }, []);
  /*
    ✅ 依存配列が [] なので、初回マウント時に1回だけ実行される。
    - 「タイマーを開始するのは1回だけ」の意図。

    ⚠️ 注意（アルゴリズム上の落とし穴）：
    - tick は関数であり、本来は依存に入れるべき…という議論がある。
      ただし tick は関数アップデートを使っているので、state の古さ問題は避けやすい。
    - 一方で maxCount が変わっても interval 周りは更新されない（この設計の意図次第）。
  */

  // ------------------------------------------------------------
  // 5) 副作用その2：countLeft が 0 になったら maxCount へ戻す（ループ）
  // ------------------------------------------------------------
  useEffect(() => {
    if (countLeft === 0) {
      setCountLeft(maxCount);
    }
  });
  /*
    ✅ 依存配列が無い effect は「毎レンダー後に実行」される。
    - 表示更新のたびに走るので、条件分岐でガードしている。

    アルゴリズム観点：
    - 終端条件（countLeft === 0）で状態を初期へ戻す “循環遷移” を実装している。
      0 を検知したら
        countLeft := maxCount
      へ遷移する。

    ⚠️ 注意：
    - 毎レンダー走るので、依存配列 `[countLeft, maxCount]` を付ける方が意図は明確で、
      余計な effect 実行も減る（コメントアウトされている行がまさにそれ）。
    - ただし依存を付けても挙動自体は同じで、効率と意図の明確さが改善点になる。
  */
  // }, [countLeft, maxCount]);

  // ------------------------------------------------------------
  // 6) 描画：状態を UI に投影し、操作（reset）をイベントに接続する
  // ------------------------------------------------------------
  return (
    <Card className="w-80 shadow-md gap-2">
      <CardHeader>
        <div className="text-xl font-medium text-center">Count</div>
      </CardHeader>

      <CardContent className="flex justify-center pb-2">
        <div className="text-4xl font-semibold">{countLeft}</div>
        {/*
          ✅ countLeft を表示する部分。
          - tick/reset による状態変化 → 再レンダー → この数字が更新される。
        */}
      </CardContent>

      <CardContent className="flex mx-4">
        <Button className="w-full bg-red-500 hover:bg-red-600" onClick={reset}>
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        {/*
          ✅ ボタン押下で reset を実行。
          - UIイベント → 状態遷移（countLeft := maxCount）→ 再レンダー
        */}
      </CardContent>
    </Card>
  );
}

export default Timer;
/*
  ✅ export して親から <Timer maxCount={...} /> として利用する。

  ✅ 全体まとめ（時間駆動の状態機械）：
  - state: countLeft
  - event:
      every 1s: countLeft := countLeft - 1
      reset click: countLeft := maxCount
      if countLeft == 0: countLeft := maxCount
  - effect:
      interval の生成/破棄を component lifecycle に同期する
*/