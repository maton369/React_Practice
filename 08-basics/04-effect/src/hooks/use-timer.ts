/*
✅ useTimer は「カウントダウンタイマーのロジック」を React のカスタムフックとして切り出したものである。
UI（表示やボタン）はこのフックの外に置き、このフックは純粋に

- 状態（残りカウント）
- 状態遷移（tick / reset）
- 副作用（setInterval の開始と停止）
- ルール（0になったら maxCount に戻す）

だけを提供する。

アルゴリズム的には「時間イベント駆動の状態機械（state machine）」である：
- state: countLeft
- event: every 1 second → tick
- transition: countLeft := countLeft - 1
- guard: if countLeft == 0 → countLeft := maxCount
- action: reset() → countLeft := maxCount
- resource management: interval を mount で生成し、unmount/再生成前に破棄する

この “状態＋遷移＋副作用の寿命管理” をフックに閉じ込めることで、
Timer コンポーネント側は「値を表示して reset を呼ぶだけ」にできる。
*/

import { useEffect, useState } from 'react';
/*
  ✅ useState: コンポーネント（フック）に状態セルを持たせる
  ✅ useEffect: レンダー後に副作用を実行し、cleanup で破棄する

  重要な視点：
  - setInterval のような外部リソースは render 中に作ると多重起動するため、
    useEffect を使って “いつ作っていつ壊すか” を宣言する。
*/

export function useTimer(maxCount: number) {
    /*
      ✅ 引数 maxCount は「初期値・リセット先」として使う外部入力。
      - UI から渡されるパラメータであり、フックの挙動（状態遷移）を決める。
    */

    // ------------------------------------------------------------
    // 1) 状態：残りカウント
    // ------------------------------------------------------------
    const [countLeft, setCountLeft] = useState(maxCount);
    /*
      ✅ 初期 state は maxCount。
      - 初回レンダーでのみこの初期値が採用される（useState の仕様）。
      - maxCount が後から変わっても “初期化” は自動ではやり直されない。
  
      そのため、maxCount 変更に追従したい場合は
      - reset() を呼ぶ
      - あるいは別の effect で「maxCount が変わったら setCountLeft(maxCount)」する
      などの設計判断が必要になる。
    */

    // ------------------------------------------------------------
    // 2) 状態遷移：tick（毎秒 -1）
    // ------------------------------------------------------------
    function tick() {
        setCountLeft((c) => c - 1);
        /*
          ✅ 関数アップデートを使うのが重要。
          - tick は setInterval から呼ばれるため、クロージャが古い countLeft を掴む問題が起きやすい。
          - しかし setCountLeft((c)=>...) なら、React が保持する “最新の state c” を入力として計算できる。
    
          状態遷移としては：
            f(c) = c - 1
        */
    }

    // ------------------------------------------------------------
    // 3) 操作：reset（初期値に戻す）
    // ------------------------------------------------------------
    function reset() {
        setCountLeft(maxCount);
        /*
          ✅ reset は maxCount に戻す操作（UI から呼ばれる action）。
          - ここで使われる maxCount は、そのレンダー時点の引数値。
          - maxCount が変わったら、次のレンダーから reset も新しい maxCount を使う。
        */
    }

    // ------------------------------------------------------------
    // 4) 副作用その1：interval の開始と停止（リソース管理）
    // ------------------------------------------------------------
    useEffect(() => {
        const timerId = setInterval(tick, 1000);
        /*
          ✅ 1秒ごとに tick を呼ぶ外部イベント源（interval）を生成する。
          - ここはレンダーではなく effect 内で行うことで、多重起動を避ける。
        */

        return () => clearInterval(timerId);
        /*
          ✅ cleanup：この effect が破棄されるタイミングで interval を停止する。
          - コンポーネントが unmount される
          - 依存配列が変化して effect が再実行される直前
          などで呼ばれる。
          - interval を止めないと、画面から消えても tick が走り続ける（リーク）。
        */
    }, []);
    /*
      ✅ 依存配列が [] なので mount 時に1回だけ起動し、unmount 時に停止する。
  
      アルゴリズム観点：
      - “タイマーを開始する” という外部リソース生成を 1 回に限定することで、
        event source が増殖しないようにしている。
  
      ⚠️ 注意：
      - tick は関数だが依存に含めていない。
        ただし tick 内は関数アップデートなので state の古さ問題は避けやすい。
      - 一方 maxCount が変わったとしても interval を張り直す設計ではない。
        （張り直したいなら deps に maxCount を含めて interval を再生成する等の方針が必要）
    */

    // ------------------------------------------------------------
    // 5) 副作用その2：状態ルール（0になったら maxCount に戻す）
    // ------------------------------------------------------------
    useEffect(() => {
        if (countLeft === 0) {
            setCountLeft(maxCount);
        }
        /*
          ✅ 0 を検知したら maxCount に戻す（循環タイマー）。
          - tick が countLeft を毎秒減らす
          - 減った結果 0 になったレンダーの後にこの effect が走り、初期値へ戻す
    
          これにより状態機械は：
            ... → 2 → 1 → 0 → maxCount → maxCount-1 → ...
          のように循環する。
        */
    }, [countLeft, maxCount]);
    /*
      ✅ この effect は countLeft または maxCount が変わったときだけ走る。
      - 毎レンダー走らないので効率が良く、意図も明確。
  
      無限ループの懸念：
      - effect 内で setState すると再レンダーするが、
        ここは “countLeft===0 の時だけ” 更新し、更新後は 0 ではなくなるのでループは止まる。
    */

    // ------------------------------------------------------------
    // 6) API：外部へ返す値（state）と操作（action）
    // ------------------------------------------------------------
    return [countLeft, reset] as const;
    /*
      ✅ 戻り値はタプル [countLeft, reset]。
      - UI 側は countLeft を表示し、reset をボタンに渡すだけでよい。
      - `as const` により “readonly のタプル” として扱われ、
        分割代入したときに型が崩れにくい（countLeft は number、reset は関数）。
  
      つまりこのフックは「状態（countLeft）と、状態を変える操作（reset）」だけを公開し、
      それ以外（interval やルール）は隠蔽している。
    */
}