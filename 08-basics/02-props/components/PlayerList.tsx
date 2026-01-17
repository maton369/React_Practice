// ✅ PlayerList は「学校名 + 選手一覧」を表示するプレゼンテーションコンポーネントである。
// 親から渡された players 配列を 1 件ずつ <li> に変換して描画する。
// Avatar（Radix ラッパー）と lucide-react のアイコンを使い、画像が無い想定のフォールバック表示を行う。
//
// アルゴリズム的な本質は：
// 1) 入力：school（文字列）と players（Player の配列）を受け取る
// 2) 変換：players.map(...) で “配列（データ集合）→ リスト要素（UI集合）” に写像する
// 3) 安定化：key に player.id を使って React の差分更新（reconciliation）を安定化する
// 4) 欠損処理：height が無い場合に '???' を表示し、UI を壊さない
//
// つまり「データの正規化（欠損値の処理）＋リスト写像（map）＋差分更新最適化（key）」が中心である。

import { UserRound } from 'lucide-react';
/*
  ✅ lucide-react のアイコンコンポーネント。
  - SVG を React コンポーネントとして扱える。
  - ここでは “ユーザー” を表すフォールバックアイコンとして使う。
*/

import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
/*
  ✅ Radix の Avatar ラッパー（前に定義したもの）を利用。
  - <Avatar> は丸いコンテナ（Root）
  - <AvatarFallback> は画像が無い/読み込めない時に表示される代替領域
  ここでは Image を使っていないので、常に Fallback 表示になる構造である。
*/

// ------------------------------------------------------------
// 1) データモデル：Player
// ------------------------------------------------------------
interface Player {
  id: number;
  name: string;
  grade: number;
  height?: number;
  /*
    ✅ height?: number は optional（欠損しうる）という意味。
    - 実データに「身長が未登録」な選手が混ざっていても扱える。

    アルゴリズム観点：
    - 入力に欠損値がある前提を型に含めることで、
      表示側（PlayerList）がフォールバック分岐を持つことを強制できる。
  */
}

// ------------------------------------------------------------
// 2) 入力仕様：PlayerListProps
// ------------------------------------------------------------
interface PlayerListProps {
  school: string;
  players: Player[];
  /*
    ✅ players は Player の配列。
    - “集合データ” を受け取って、UI の集合へ変換するのがこのコンポーネントの役割。
  */
}

function PlayerList(props: PlayerListProps) {
  const { school, players } = props;
  /*
    ✅ props を分割代入。
    - 呼び出し側から渡された入力（school, players）をそのまま描画に使う。
    - state は持たないので、純粋に “入力 → 表示” の関数になっている（プレゼンテーション層）。
  */

  return (
    <div className="w-96">
      {/*
        ✅ 幅を固定（w-96）して見た目を揃える。
        - レイアウトの制御であり、データ変換アルゴリズムには影響しない。
      */}

      <h2 className="mb-8 text-center">{school}</h2>
      {/*
        ✅ school はタイトルとして投影される。
      */}

      <ul className="my-6 space-y-5">
        {/*
          ✅ ここが “集合変換” の主戦場。
          - players（配列）を map で走査し、
            各 player を <li> の ReactElement に変換して並べる。

          アルゴリズムの形：
            UIList = map(players, renderPlayer)
        */}

        {players.map((player) => (
          <li key={player.id} className="flex items-center space-x-4">
            {/*
              ✅ key={player.id} は React の差分更新アルゴリズム（reconciliation）に重要。
              - React はリストの各要素を “同一性” で追跡する必要がある。
              - index を key にすると、並び替え/追加削除で別要素として誤認しやすい。
              - 安定して一意な id を key にすると、更新が最小限になり、状態も壊れにくい。

              アルゴリズム観点：
              - key は “マッチングのヒント” として使われ、
                次レンダーの要素集合と前レンダーの要素集合を対応付ける。
            */}

            <Avatar>
              {/*
                ✅ Avatar は見た目の枠（円形）を提供。
                - Image を使わないので、常に Fallback が表示される設計。
              */}

              <AvatarFallback className="bg-red-50">
                {/*
                  ✅ フォールバック領域の背景を薄赤に指定。
                  - Tailwind の className 合成でスタイルを上書きしている。
                */}
                <UserRound className="text-red-500" />
                {/*
                  ✅ フォールバックの中身としてアイコンを表示。
                  - “写真が無いユーザー” を表現する視覚的シグナル。
                */}
              </AvatarFallback>
            </Avatar>

            <div className="ml-4 text-left">
              {/*
                ✅ テキスト領域。
                - 外側の flex に対して margin-left を追加して余白を作る。
              */}

              <p>{player.name}</p>
              {/*
                ✅ 選手名を表示。
              */}

              <p className="flex text-gray-400">
                <span>{player.grade}年生</span>
                <span className="mx-2" />
                <span>{player.height ? player.height : '???'}cm</span>
                {/*
                  ✅ 欠損値ハンドリングがここ。

                  - player.height は optional なので undefined の可能性がある。
                  - `player.height ? player.height : '???'` で
                    「値があるなら数値、無いなら '???'」というフォールバックを行う。

                  アルゴリズム観点：
                  - 入力ドメイン（height が欠損）を
                    表示ドメイン（常に文字列として表示可能）へ正規化する処理。
                */}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
/*
  ✅ default export により、親（App）から import して使える。

  ✅ 全体まとめ：
  - 入力：school, players
  - 処理：players を map で UI に写像 + key による差分更新安定化 + height の欠損フォールバック
  - 出力：整形された <ul> リスト
*/