/**
 * ドラッグすることでユーザが任意の箇所を表示できるExecutant。
 * FloatExecutant から派生しているので詳しい説明はそちらを参照。
 */

//---------------------------------------------------------------------------------------------------------
/**
 * コンストラクタ
 */
function DraggableFloat() {
    FloatExecutant.call(this);

    // ドラッグできるようにする。
    this.behaviors.set(new InteractBehavior(), "interactor");
}

DraggableFloat.prototype = Object.create(FloatExecutant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * ドラッグされた場合の処理を行う。
 */
DraggableFloat.prototype.drag = function(move) {

    this.scroll( move.clone().multi(-1) );
}
