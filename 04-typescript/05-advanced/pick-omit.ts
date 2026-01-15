// ✅ このコードは TypeScript の組み込みユーティリティ型
// - Pick<T, K>：T から特定キー K だけを “取り出して” 新しい型を作る
// - Omit<T, K>：T から特定キー K を “除外して” 新しい型を作る
// を使って、
// Todo 型の “部分型（projection）” と “差分型（exclusion）” を作る例である。
//
// アルゴリズム的には：
// - Pick は「キー集合で射影（projection）して部分構造を得る」
// - Omit は「キー集合で差集合（set difference）を取り、残りで再構成する」
// という “型レベルの集合演算” をしている。

// ------------------------------------------------------------
// 1) Todo：元となるデータ構造（3つのフィールドを持つ）
// ------------------------------------------------------------
interface Todo {
    // ✅ タスクのタイトル
    title: string;

    // ✅ 詳細説明
    description: string;

    // ✅ 完了フラグ
    isDone: boolean;
}

// ------------------------------------------------------------
// 2) PickedTodo：Todo から title と isDone だけを抽出した型
// ------------------------------------------------------------
type PickedTodo = Pick<Todo, "title" | "isDone">;
/*
  ✅ Pick<Todo, "title" | "isDone"> の意味：
  - Todo のキー集合（"title" | "description" | "isDone"）から
    指定されたキーだけを残す
  - 結果は概念的に次と同等：

    type PickedTodo = {
      title: string;
      isDone: boolean;
    };

  アルゴリズム（型レベル）：
  - 入力：型 Todo とキー集合 K = {"title","isDone"}
  - 出力：K に含まれるプロパティのみで新しいオブジェクト型を構成
  → “必要最小限のフィールドだけを外に出す DTO” のような用途でよく使う
*/

// ------------------------------------------------------------
// 3) OmittedTodo：Todo から description を除外した型
// ------------------------------------------------------------
type OmittedTodo = Omit<Todo, "description">;
/*
  ✅ Omit<Todo, "description"> の意味：
  - Todo のキー集合から "description" を取り除いて残りを採用する
  - 結果は概念的に次と同等：

    type OmittedTodo = {
      title: string;
      isDone: boolean;
    };

  アルゴリズム（型レベル）：
  - 入力：型 Todo と除外キー集合 E = {"description"}
  - Todo のキー集合 Keys(Todo) から E を差し引く（差集合）
  - 残ったキーで新しい型を再構成する

  ✅ この例では PickedTodo と OmittedTodo は同じ形になる：
  - PickedTodo：欲しいものを列挙して抽出
  - OmittedTodo：不要なものを列挙して除外
  どちらが読みやすいかは、元の型と変更対象の大きさ・意図で選ぶ。
*/