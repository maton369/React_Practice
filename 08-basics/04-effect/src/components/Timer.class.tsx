/*
✅ これは「クラスコンポーネント版のカウントダウンタイマー」である。
- Hooks を使わず、React クラスのライフサイクル（componentDidMount / componentDidUpdate / componentWillUnmount）
  を用いて “副作用（setInterval）” の生成・監視・破棄を行う。
- state に countLeft（残り秒数）を保持し、tick で 1 秒ごとに減算する。
- 0 になったら reset して初期値に戻す（循環するタイマー）。

アルゴリズム的な本質は：
1) 状態：countLeft（残りカウント）
2) 時間イベント：毎秒 tick を呼び出して countLeft を 1 減らす
3) 終端条件：countLeft が 0 になったら初期値へ遷移
4) リソース管理：setInterval を mount で開始し、unmount で必ず停止する

Hooks 版の useEffect を、クラスではライフサイクルメソッドで分割して実現している構造である。
*/

import { Component } from 'react';
/*
  ✅ React のクラスコンポーネントの基底クラス。
  - Component<Props, State> のようにジェネリクスで props と state の型を与えることで
    this.props / this.state の型安全性を確保する。
*/

import { RotateCw } from 'lucide-react';
/*
  ✅ Reset ボタンのアイコン（SVG React コンポーネント）。
*/

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
/*
  ✅ UI コンポーネント（見た目の責務）。
  - タイマーの状態遷移アルゴリズムとは独立している。
*/

// ------------------------------------------------------------
// 1) Props / State の型定義
// ------------------------------------------------------------
interface Props {
  maxCount?: number;
  /*
    ✅ 親から与えられる最大カウント（省略可能）。
    - Hooks 版でいう maxCount の props と同等。
  */
}

interface State {
  countLeft: number;
  /*
    ✅ コンポーネント内部状態（残り秒数）。
    - クラスコンポーネントでは state は this.state に格納される。
  */
}

class Timer extends Component<Props, State> {
  // ------------------------------------------------------------
  // 2) インスタンスフィールド（クラスの “内部メモリ”）
  // ------------------------------------------------------------
  timerId: ReturnType<typeof setInterval> | null = null;
  /*
    ✅ setInterval が返す ID を保持するフィールド。
    - unmount 時に clearInterval するために必要。
    - null を許容して「まだ開始していない」状態を表現している。

    アルゴリズム観点：
    - interval は外部リソースなので、参照を保持して後で確実に破棄する必要がある。
  */

  initialCount: number;
  /*
    ✅ “初期値（リセット先）” を保持するフィールド。
    - この実装では constructor 時点の maxCount を初期値として固定する。
    - reset() は常にこの initialCount に戻す。

    ⚠️ 注意：
    - 親が後から props.maxCount を変えても initialCount は更新されない。
      （「初期値を固定する」仕様ならOK。追従したいなら componentDidUpdate で監視するなどが必要）
  */

  constructor(props: Props) {
    super(props);
    /*
      ✅ 必ず super(props) を呼ぶ（React.Component の初期化）。
      - これを呼ばないと this.props が初期化されず、this を使えない。
    */

    // ------------------------------------------------------------
    // 3) 初期化：初期値と state を決める
    // ------------------------------------------------------------
    this.initialCount = this.props.maxCount ?? 60;
    /*
      ✅ maxCount が渡されていればそれを使い、無ければ 60。
      - Nullish coalescing (??) は undefined / null の時だけ右側を採用する。
      - 0 を明示指定したい場合などに、|| より意図が明確。
    */

    this.state = { countLeft: this.initialCount };
    /*
      ✅ state の初期値を設定。
      - 初回レンダーは countLeft = initialCount から開始する。
    */

    // ------------------------------------------------------------
    // 4) this バインディング：イベントハンドラとして安全に使うため
    // ------------------------------------------------------------
    this.tick = this.tick.bind(this);
    this.reset = this.reset.bind(this);
    /*
      ✅ クラスメソッドは、そのままコールバックに渡すと this が失われることがある。
      - setInterval(this.tick, ...) や onClick={this.reset} で呼ばれる際、
        this が Timer インスタンスを指す保証をするために bind する。

      アルゴリズム観点：
      - tick/reset は state 遷移関数であり、インスタンスの state を参照・更新する必要がある。
        そのため this の束縛が必要になる。
    */
  }

  // ------------------------------------------------------------
  // 5) 状態遷移：tick（毎秒 -1） / reset（初期値へ）
  // ------------------------------------------------------------
  tick() {
    this.setState((state) => ({ ...state, countLeft: state.countLeft - 1 }));
    /*
      ✅ 関数形式の setState を使っているのが重要。
      - state 更新は非同期的にまとめられる可能性があるため、
        「直前の state を入力に次状態を計算する」形式が安全。

      状態遷移としては：
        f(state) = state.countLeft := state.countLeft - 1

      ここで `{ ...state, ... }` をしているが、
      state が countLeft だけなら `{ countLeft: state.countLeft - 1 }` でも同じ結果になる。
      （将来 state が増えたときの保険として書いていると解釈できる）
    */
  }

  reset() {
    this.setState({ countLeft: this.initialCount });
    /*
      ✅ countLeft を initialCount に戻す。
      - 前状態に依存しないのでオブジェクト形式 setState で問題ない。

      状態遷移としては：
        g(_) = countLeft := initialCount
    */
  }

  // ------------------------------------------------------------
  // 6) ライフサイクル：副作用（interval）の開始
  // ------------------------------------------------------------
  componentDidMount() {
    this.timerId = setInterval(this.tick, 1000);
    /*
      ✅ mount 後に interval を開始する。
      - render 中に setInterval を作ると、再レンダーのたびに増殖する危険がある。
      - componentDidMount は初回描画が終わった後に1回だけ呼ばれるので安全。

      Hooks 版の useEffect(..., []) と対応：
      - “マウント時に1回だけ副作用を開始” をクラスではここで行う。
    */
  }

  // ------------------------------------------------------------
  // 7) ライフサイクル：状態変化後のルール適用（0なら reset）
  // ------------------------------------------------------------
  componentDidUpdate() {
    if (this.state.countLeft === 0) {
      this.reset();
    }
    /*
      ✅ 更新後（setState による再レンダーの後）に呼ばれる。
      - ここで「countLeft が 0 なら reset」というルールを適用して、
        タイマーを循環させている。

      アルゴリズム観点：
      - “終端条件の検知” と “循環遷移” をここで実装している。

      ⚠️ 注意（無限ループの可能性）：
      - componentDidUpdate 内で setState を呼ぶと再更新を引き起こす。
      - ただしここは countLeft===0 のときだけ reset し、
        reset 後は countLeft が initialCount になるため条件が false になりループは止まる。
      - それでも将来ロジック変更で条件が崩れるとループしうるため、
        “なぜ止まるか” を理解しておくのが重要。
    */
  }

  // ------------------------------------------------------------
  // 8) ライフサイクル：副作用（interval）の破棄
  // ------------------------------------------------------------
  componentWillUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    /*
      ✅ unmount 前に interval を必ず止める。
      - これをしないとコンポーネントが消えても tick が走り続け、メモリリークや警告の原因になる。

      Hooks 版の useEffect の cleanup と対応：
      - return () => clearInterval(timerId)
    */
  }

  // ------------------------------------------------------------
  // 9) 描画：state を UI に投影し、reset をイベントに接続する
  // ------------------------------------------------------------
  render() {
    return (
      <Card className="w-80 shadow-md gap-2">
        <CardHeader>
          <div className="text-xl font-medium text-center">Count</div>
        </CardHeader>

        <CardContent className="flex justify-center pb-2">
          <div className="text-4xl font-semibold">{this.state.countLeft}</div>
          {/*
            ✅ this.state.countLeft を表示する。
            - tick/reset による state 更新 → 再レンダー → 表示更新
            という React の基本フロー。
          */}
        </CardContent>

        <CardContent className="flex mx-4">
          <Button
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={this.reset}
          >
            <RotateCw className="mr-2 h-4 w-4" /> Reset
          </Button>
          {/*
            ✅ Reset ボタンで reset() を呼ぶ。
            - UIイベント → 状態遷移（countLeft := initialCount）→ 再レンダー
          */}
        </CardContent>
      </Card>
    );
  }
}

export default Timer;
/*
  ✅ まとめ（Hooks 版との対応関係）：
  - useState(countLeft)            ↔ this.state.countLeft
  - setCountLeft                   ↔ this.setState(...)
  - useEffect(() => interval, [])  ↔ componentDidMount + componentWillUnmount
  - useEffect(() => if 0 then ...) ↔ componentDidUpdate

  クラス版は “副作用と状態ルール” をライフサイクルメソッドに分散して表現する設計である。
*/