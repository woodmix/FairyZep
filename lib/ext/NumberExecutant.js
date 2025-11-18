
/**
 * 数字ビットマップを使って数値を描画するExecutant。
 * 描画する数字の桁数に従ってボディ矩形の大きさが変化する。
 *
 * 例)
 *      // インスタンスを作成。数字ビットマップは "numbers" を使用。
 *      // ピボットを指定して、Executant の座標が左下に位置するようにする。
 *      var num = new NumberExecutant("numbers", new Point(0, 1));
 *
 *      // レイヤーを設定するのを忘れないように。
 *      this.num.layer = 10;
 *
 *      // 表示したい数値
 *      this.num.value = 124680;
 *
 *      // 字間を設定できる。開けるならプラス、詰めるならマイナス。
 *      this.num.space = -10;
 *
 *      // ピボットはボディビヘイバへ設定する。ついでにスケールも設定できる。
 *      this.num.behaviors.get("body").pivot = new Point(1, 0);     // Executant の座標が右上に位置するようにする。
 *      this.num.behaviors.get("body").scale.x = 2;                 // 横に2倍に伸ばす。
 *
 * @param   描画に使う数字ビットマップ。
 *          Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 *          全ての数字が同じ幅で等間隔に並んでいる必要がある。一つ一つの数字の幅はこのイメージを /10 する
 *          ことで自動計算される。
 * @param   ピボットの位置を指定するPoint。描画矩形のうち Executant の座標がどこに位置するかを 0.0-1.0 で表す。
 *          省略時は [0.5, 0.5]。
 *
 */
function NumberExecutant(image, pivot) {
    Executant.call(this);

    // ピボット省略時は [0.5, 0.5]。
    if(!pivot)
        pivot = new Point(0.5, 0.5);

    // 表示したい数値。
    this.value = 0;

    // 字間。
    this.space = 0;

    // カスタムされたボディビヘイバとレンダラをセット。
    this.behaviors.set(new NumberBody(pivot), "body");
    this.behaviors.set(new NumberRenderer(image), "renderer");
}

NumberExecutant.prototype = Object.create(Executant.prototype);


//=========================================================================================================
/**
 * NumberExecutant のボディビヘイバ。RevisionBody から派生している。
 *
 * @param   ピボットの位置を指定するPoint。
 */
function NumberBody(pivot) {
    RevisionBody.call(this, pivot);
}

NumberBody.prototype = Object.create(RevisionBody.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * laydown() をオーバーライド。描画元のサイズを使用イメージのサイズからではなく、宿主にセットされている
 * 数値から求めるようにする。
 */
NumberBody.prototype.laydown = function(size) {

    size = size.clone();

    // 宿主にセットされている数値を文字列として取得。
    var value = this.host.value.toString();

    // 幅を修正する。
    if(value.length == 0)
        size.x = 0;
    else
        size.x = size.x/10 * value.length + this.host.space * (value.length-1);

    // あとは基底に任せる。
    return RevisionBody.prototype.laydown.call(this, size);
}

//=========================================================================================================
/**
 * NumberExecutant のレンダラ。ImageRenderer から派生している。
 *
 * @param   ピボットの位置を指定するPoint。
 */
function NumberRenderer(image) {
    ImageRenderer.call(this, image);
}

NumberRenderer.prototype = Object.create(ImageRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 *
 * @param   描画に使う数字ビットマップ。
 */
NumberRenderer.prototype.paint = function(context, dest) {

    // 宿主にセットされている数値を文字列として取得。
    var value = this.host.value.toString();

    // 描画元の矩形と、数字一つ当たりの幅を取得。
    var srcrect = this.piece.rect();
    var srcunit = srcrect.width() / 10;

    // 描画先の矩形幅を、描画する数値の文字数で割って、一文字当たりの描画先の幅を求める。
    var destunit = (dest.width() - this.host.space * (value.length-1)) / value.length;

    // 一の位から順に描画していく。
    for(var i = value.length - 1 ; i >= 0 ; i--) {

        context.drawImage(this.piece.image,
            srcrect.left() + srcunit * value[i], srcrect.top(), srcunit, srcrect.height(),
            dest.left() + destunit * i + this.host.space * i, dest.top(), destunit, dest.height()
        );
    }
}
