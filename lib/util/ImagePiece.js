
/**
 * 特定の矩形内にあるイメージを表すクラス。
 *
 * @param   イメージ。<img> や <canvas> など。
 *          文字列を指定した場合はそれをキーとしてResourcesを参照して取得する。
 * @param   使用する矩形。省略した場合は全体。
 */
function ImagePiece(image, crop) {

    // 文字列が指定された場合はそれをキーとしてResourcesを参照する。
    if(typeof(image) == "string")
        image = Resources.need(image);

    // イメージオブジェクト。width, height プロパティを持つ。
    this.image = image;

    // 使用する矩形。undefined の場合は全体を表す。
    this.crop = crop;
}

//---------------------------------------------------------------------------------------------------
/**
 * 使用する矩形を返す。全体を意味するべくコンストラクタで省略した場合でも、補って返す。
 *
 * @return  使用する矩形
 */
ImagePiece.prototype.rect = function() {

    return this.crop ? this.crop : new Rect(0, 0, this.image.width, this.image.height);
}


// CanvasRenderingContext2D にこのクラスのインスタンスで描画を行うメソッドを追加する。
//=========================================================================================================

//---------------------------------------------------------------------------------------------------
/**
 * drawImage() の引数差し替え版。
 *
 * @param   このクラスのインスタンス。
 * @param4  描画先の座標とサイズ。サイズは省略できる。
 */
CanvasRenderingContext2D.prototype.drawPiece = function(piece, dx, dy, dw, dh) {

    if(piece.crop)
        this.drawImage(piece.image, piece.crop.lt.x, piece.crop.lt.y, piece.crop.size.x, piece.crop.size.y, dx, dy, dw, dh);
    else if(dw == undefined)
        this.drawImage(piece.image, dx, dy);
    else
        this.drawImage(piece.image, dx, dy, dw, dh);
}

//---------------------------------------------------------------------------------------------------
/**
 * drawImageC() の引数差し替え版。
 *
 * @param   このクラスのインスタンス。
 * @param4  描画先の座標とサイズ。サイズは省略できる。
 */
CanvasRenderingContext2D.prototype.drawPieceC = function(piece, dx, dy, dw, dh) {

    if(!piece.crop) {
        this.drawImageC(piece.image, dx, dy, dw, dh);
        return;
    }

    if(dw == undefined) {
        dw = piece.crop.size.x;
        dh = piece.crop.size.y;
    }

    dx -= dw >> 1;
    dy -= dh >> 1;
    this.drawImage(piece.image, dx, dy, dw, dh);
}
