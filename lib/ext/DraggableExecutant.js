/**
 * ドラッグして移動できるExecutant。
 */

//---------------------------------------------------------------------------------------------------------
/**
 * コンストラクタ
 */
function DraggableExecutant() {
    Executant.call(this);

    // ドラッグできるようにする。
    this.behaviors.set(new InteractBehavior(), "interactor");
}

DraggableExecutant.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * ドラッグされたらその分移動するようにする。
 */
DraggableExecutant.prototype.drag = function(move) {

    this.position.add(move);
}
