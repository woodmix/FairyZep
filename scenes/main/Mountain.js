
/**
 * 背景の山を表すExecutant。
 * layer は決めてもらう必要がある。
 *
 * @param   近景なら "near"、遠景なら "far" を指定する。
 * @param   配置される背景の論理高さ
 */
function Mountain(depth, frameHeight) {
    Executant.call(this);

    // レイヤー番号をセット。
    this.layer = Main[depth.toUpperCase() + "_MOUNTAIN"];

    // レンダラをセット。
    this.behaviors.set(new TileRenderer("mount_" + depth), "renderer");

    // 画像の高さを取得。
    var height = this.behaviors.get("renderer").piece.rect().height();

    // Y座標をセットする。ボディの一番下に配置されるようにする。
    this.position.y = frameHeight - height;

    // ボディをこのファイルで定義するカスタムクラスにする。
    this.behaviors.set(new MountainBody(height), "body");
};

Mountain.prototype = Object.create(Executant.prototype);


//=========================================================================================================
/**
 * Mountainで使用するカスタムボディ。Y軸方向は固定だが、X軸方向はカメラに映っている領域とする。
 *
 * @param   山画像の高さ。
 */
function MountainBody(height) {
    CanvasBody.call(this);

    this.height = height;
}

MountainBody.prototype = Object.create(CanvasBody.prototype);

//---------------------------------------------------------------------------------------------------------
MountainBody.prototype.getRect = function() {

    // まずはカメラに映っている領域を取得。
    var rect = CanvasBody.prototype.getRect.call(this);

    // そのうちY軸は固定して返す。
    return new Rect(rect.left(), 0, rect.width(), this.height);
}
