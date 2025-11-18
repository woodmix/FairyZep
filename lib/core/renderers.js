/**
 * Executantの描画を行うビヘイバー(レンダラ)を収めたファイル。
 */

//=========================================================================================================
/**
 * レンダラクラスの基底。
 */
function Renderer() {
    Behavior.call(this);
}

Renderer.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 描画を実行する。
 *
 * @param   描画先となる CanvasRenderingContext2D
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト
 */
Renderer.prototype.render = function(context, scene) {

    // 基底では宿主のボディ領域を...
    var dest = this.getDest()

    // paint() で描画する。
    if(dest)
        this.paint(context, dest);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 描画先の領域を取得する。
 *
 * @return  描画先の領域を表す Rect。不明な場合は null。
 */
Renderer.prototype.getDest = function() {

    // 基底では宿主のボディ領域を使う
    return this.host.behaviors.need("body").getRect();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された領域に対して描画する。
 *
 * @param   描画先となる CanvasRenderingContext2D
 * @param   描画先の領域を表す Rect。
 */
Renderer.prototype.paint = function(context, dest) {

    // 基底としては黒い矩形で塗りつぶす。
    context.fillStyle = "black";
    context.fillRect(dest.lt.x, dest.lt.y, dest.size.x, dest.size.y);
}


//=========================================================================================================
/**
 * 宿主のボディビヘイバが返す領域を指定されたスタイルで塗りつぶすレンダラ。
 *
 * @param   塗りつぶしに使うスタイル。fillStyle にセットできる値を指定する。
 */
function FillRenderer(style) {
    Renderer.call(this);

    this.style = style || "black";
}

FillRenderer.prototype = Object.create(Renderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 */
FillRenderer.prototype.paint = function(context, dest) {

    context.fillStyle = this.style;
    context.fillRect(dest.lt.x, dest.lt.y, dest.size.x, dest.size.y);
}


//=========================================================================================================
/**
 * 宿主のボディビヘイバが返す領域を指定された線形グラデーションで塗りつぶすレンダラ。
 * ボディ矩形を元にグラデーションの形を決める。ボディ矩形に依りたくない場合は、普通にグラデーションを作成
 * FillRenderer を使うと良いだろう。
 *
 * @param   [0, 0] を起点とした場合の、グラデーション方向の向きと長さを決める終端をPointで表す。
 *          たとえば [1, 1] を指定すると、宿主のボディ領域の左上から右下方向になるし、[0, 1] を指定すると
 *          上から下方向になる。
 *          また、[0.5, 0.5] と指定すると左上から中央までが色変化の対象となる。
 * @param   グラデーションの色ノードを、オフセット⇒色⇒オフセット⇒色⇒... の順で指定した配列。
 *          例えば、赤⇒青⇒緑 と変化するなら [0.0, "red", 0.5, "blue", 1.0, "green"] となる。
 */
function GradientRenderer(end, stops) {
    Renderer.call(this);

    this.end = end;
    this.stops = stops;
}

GradientRenderer.prototype = Object.create(Renderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 */
GradientRenderer.prototype.paint = function(context, dest) {

    // グラデーション方向と長さを決める矩形を取得する。
    var gradrect = dest.clone();
    gradrect.size.multi(this.end);

    // グラデーションを作成。
    var grad  = context.createLinearGradient(gradrect.left(), gradrect.top(), gradrect.right(), gradrect.bottom());

    // 指定された色ノードを追加する。
    for(var i = 0 ; i < this.stops.length ; i += 2)
        grad.addColorStop(this.stops[i], this.stops[i+1]);

    // 描画。
    context.fillStyle = grad;
    context.fillRect(dest.lt.x, dest.lt.y, dest.size.x, dest.size.y);
}


//=========================================================================================================
/**
 * 指定されたイメージを宿主のボディ領域に描画するレンダラ。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 */
function ImageRenderer(image) {
    Renderer.call(this);

    // 描画するImagePiece。
    this.piece = undefined;

    this.setImage(image);
}

ImageRenderer.prototype = Object.create(Renderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 */
ImageRenderer.prototype.paint = function(context, dest) {

    context.drawPiece(this.piece, dest.lt.x, dest.lt.y, dest.size.x, dest.size.y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定したイメージを描画するようにする。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 */
ImageRenderer.prototype.setImage = function(image) {

    // 引数を ImagePiece インスタンスで統一する。
    if( !(image instanceof ImagePiece) )
        image = new ImagePiece(image);

    if(image)
        this.piece = image;
}


//=========================================================================================================
/**
 * 宿主が text プロパティで持つ文字列をそのボディ領域に描画するレンダラ。
 *
 * @param   font
 * @param   サイズ(px)。一行の行高さともなる。
 * @param   塗りつぶしstyle
 * @param   行間。マイナスも可能。
 */
function TextRenderer(font, size, style, space) {
    Renderer.call(this);

    this.font = font || "monospace";
    this.size = size || 36;
    this.style = style || "black";
    this.space = space || 0;

    // 横揃え(left, center, right)と縦揃え(top, middle, bottom)。
    // それぞれ宿主のボディ領域を基準にする。
    this.halign = "left";
    this.valign = "top";
}

TextRenderer.prototype = Object.create(Renderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 */
TextRenderer.prototype.paint = function(context, dest) {

    context.font = this.size + "px " + this.font;
    context.fillStyle = this.style;
    context.textBaseline = "top";
    context.textAlign = this.halign;

    // 宿主が text プロパティで持つ文字列を行ごとに分解。
    var texts = (this.host.text == undefined) ? ["undefined"] : this.host.text.split("\n");

    // 描画位置を初期化。
    var cursor = new Point();

    // X軸。
    switch(this.halign) {
        case "left":    cursor.x = dest.lt.x;                   break;
        case "center":  cursor.x = dest.lt.x + dest.size.x/2;   break;
        case "right":   cursor.x = dest.right();                break;
    }

    // Y軸。変数 height に文字列の描画高さを求めてから決める。
    var height = texts.length * (this.size + this.space) - this.space;
    switch(this.valign) {
        case "top":     cursor.y = dest.lt.y;                               break;
        case "middle":  cursor.y = dest.lt.y + dest.size.y/2 - height/2;    break;
        case "bottom":  cursor.y = dest.bottom() - height;                  break;
    }

    // 一行ずつ描画する。
    for(var i = 0 ; i < texts.length ; i++) {
        context.fillText(texts[i], cursor.x, cursor.y);
        cursor.y += this.size + this.space;
    }
}


//=========================================================================================================
/**
 * 指定されたイメージを宿主のボディ領域に敷き詰めるように描画するレンダラ。
 * イメージの左上頂点が宿主の座標点に位置するように合わせられる。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 */
function TileRenderer(image) {
    ImageRenderer.call(this, image);
}

TileRenderer.prototype = Object.create(ImageRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() の実装。
 */
TileRenderer.prototype.paint = function(context, dest) {

    // 描画するイメージの使用矩形を取得。
    var srcrect = this.piece.rect();

    // X, Y軸上でループに回しながらタイル状に描画していく。
    var y = Math.step( dest.top(), srcrect.height() );
    for( ; y < dest.bottom() ; y += srcrect.height() ) {

        // 描画先Y、描画元Y、描画元高さを取得。
        var dy = y;
        var sy = srcrect.top();
        var sh = srcrect.height();

        // 上端チェック。
        if( dy < dest.top() ) {
            sy += dest.top() - dy;
            sh -= dest.top() - dy;
            dy = dest.top();
        }

        // 下端チェック。
        if( dest.bottom() < dy + sh ) {
            sh = dest.bottom() - dy;
        }

        // 同様にX軸について処理していく。
        var x = Math.step( dest.left(), srcrect.width() );
        for( ; x < dest.right() ; x += srcrect.width() ) {

            var dx = x;
            var sx = srcrect.left();;
            var sw = srcrect.width();

            // 左端チェック。
            if( dx < dest.left() ) {
                sx += dest.left() - dx;
                sw -= dest.left() - dx;
                dx = dest.left();
            }

            // 右端チェック。
            if( dest.right() < dx + sw ) {
                sw = dest.right() - dx;
            }

            // 描画。
            context.drawImage(this.piece.image, sx, sy, sw, sh, dx, dy);
        }
    }
}


//=========================================================================================================
/**
 * 指定されたイメージを9スライスして描画するレンダラ。ImageRenderer から派生している。
 * 宿主のボディを中央エリアで描画してその周辺に残りのエリアを描画するので、実際の描画エリアはボディより
 * 大きくなる。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 * @param   9スライスの左上領域のサイズをPointで指定する。
 * @param   9スライスの右下領域のサイズをPointで指定する。
 */
function NineRenderer(image, ltsize, rbsize) {
    ImageRenderer.call(this, image);

    // この二つはメンバ変数で保持。
    this.ltsize = ltsize.clone();
    this.rbsize = rbsize.clone();

    // 中央エリアを描画するかどうか。
    this.centerPaint = true;
}

NineRenderer.prototype = Object.create(ImageRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() をオーバーライド。
 */
NineRenderer.prototype.paint = function(context, dest) {

    // 描画するイメージの使用矩形を取得。
    var srcrect = this.piece.rect();

    // 必要な諸元を取得する。
    var ltpoint = srcrect.lt.clone().add( this.ltsize );        // 転送元における、左上領域の右下座標。
    var rbpoint = srcrect.rb().clone().sub( this.rbsize );      // 転送元における、右下領域の左上座標。
    var csize = rbpoint.clone().sub(ltpoint);                   // 転送元における、中央領域のサイズ。
    var borderlt = dest.lt.clone().sub( this.ltsize );          // 転送先における、左上領域の描画位置。

    // 中央エリア
    if(this.centerPaint)
        context.drawImage(this.piece.image, ltpoint.x, ltpoint.y, csize.x, csize.y, dest.lt.x, dest.lt.y, dest.size.x, dest.size.y);

    // 四隅。左上から時計回り。
    context.drawImage(this.piece.image, srcrect.lt.x, srcrect.lt.y, this.ltsize.x, this.ltsize.y, borderlt.x, borderlt.y);
    context.drawImage(this.piece.image, rbpoint.x, srcrect.lt.y, this.rbsize.x, this.ltsize.y, dest.right(), borderlt.y);
    context.drawImage(this.piece.image, rbpoint.x, rbpoint.y, this.rbsize.x, this.rbsize.y, dest.right(), dest.bottom());
    context.drawImage(this.piece.image, srcrect.lt.x, rbpoint.y, this.ltsize.x, this.rbsize.y, borderlt.x, dest.bottom());

    // 四辺。左辺から時計回り。
    context.drawImage(this.piece.image, srcrect.lt.x, ltpoint.y, this.ltsize.x, csize.y, borderlt.x, dest.top(), this.ltsize.x, dest.height());
    context.drawImage(this.piece.image, ltpoint.x, srcrect.lt.y, csize.x, this.ltsize.y, dest.left(), borderlt.y, dest.width(), this.ltsize.y);
    context.drawImage(this.piece.image, rbpoint.x, ltpoint.y, this.rbsize.x, csize.y, dest.right(), dest.top(), this.rbsize.x, dest.height());
    context.drawImage(this.piece.image, ltpoint.x, rbpoint.y, csize.x, this.rbsize.y, dest.left(), dest.bottom(), dest.width(), this.rbsize.y);
}


//=========================================================================================================
/**
 * 基本的に引数に指定されたレンダラに処理を委譲するが、一部の処理に干渉するレンダラの基底。
 *
 * @param   実際の描画を行うレンダラ。
 */
function WrapperRenderer(matter) {
    WrapperBehavior.call(this, matter);
}

// 要は WrapperBehavior と Renderer からの多重継承にしたいのだが...
WrapperRenderer.prototype = Object.create(WrapperBehavior.prototype);
WrapperRenderer.prototype.render = Renderer.prototype.render;
WrapperRenderer.prototype.getDest = Renderer.prototype.getDest;

//---------------------------------------------------------------------------------------------------------
/**
 * 基底では、レンダラのメソッドの処理を単に委譲するようにする。
 */
WrapperRenderer.prototype.paint = function(context, dest) {
    this.matter.paint(context, dest);
}


//=========================================================================================================
/**
 * 他のレンダラによる描画を左右・上下反転するレンダラ。
 *
 * @param   実際の描画を行うレンダラ。
 * @param   左右反転なら "flip"、上下反転なら "flop"、両方なら "flip flop" を指定する。
 */
function FlipRenderer(matter, dir) {
    WrapperRenderer.call(this, matter);

    // 指定された反転方向をフラグで保持する。
    dir = dir.split(" ");
    this.flip = (dir.indexOf("flip") >= 0);
    this.flop = (dir.indexOf("flop") >= 0);
}

FlipRenderer.prototype = Object.create(WrapperRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() に干渉する。
 */
FlipRenderer.prototype.paint = function(context, dest) {

    // 軸ごとに反転する-1、そうでないなら+1にセットした Point を得る。
    var scale = new Point(this.flip ? -1 : +1, this.flop ? -1 : +1);

    // canvasコンテキストに反転を反映。
    context.scale(scale.x, scale.y);

    // 描画領域も反転するので相殺しておく。
    dest = dest.clone().multi(scale).normalize();

    // 描画。
    this.matter.paint(context, dest);

    // 反転を戻す。
    context.scale(scale.x, scale.y);
}


//=========================================================================================================
/**
 * 他のレンダラによる描画に半透明処理を行うレンダラ。
 *
 * @param   実際の描画を行うレンダラ。
 * @param   アルファ(不透明度)の値。0.0-1.0 で指定する。省略時は0.5。
 */
function AlphaRenderer(matter, alpha) {
    WrapperRenderer.call(this, matter);

    this.alpha = (alpha === undefined) ? 0.5 : alpha;
}

AlphaRenderer.prototype = Object.create(WrapperRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() に干渉する。
 */
AlphaRenderer.prototype.paint = function(context, dest) {

    // セットされたアルファを適用。
    var nature = context.globalAlpha;
    context.globalAlpha *= this.alpha;

    // 描画。
    this.matter.paint(context, dest);

    // アルファを戻す。
    context.globalAlpha = nature;
}


//=========================================================================================================
/**
 * 宿主やその親のscaleをチェックして、反転描画しようとしている場合は反転を解除するレンダラ。
 * テキストなどのように反転すると読めないものを描画する場合に利用する。
 * チェックしているのはExecutantのscaleであって、FlipRendererの有無はチェックしないので注意。
 *
 * @param   実際の描画を行うレンダラ。
 */
function ReadableRenderer(matter) {
    WrapperRenderer.call(this, matter);
}

ReadableRenderer.prototype = Object.create(WrapperRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() に干渉する。
 */
ReadableRenderer.prototype.paint = function(context, dest) {

    // ルートからのscaleの累積を取得。
    var scale = this.getTotalScale().sign();

    // canvasコンテキストに反転を反映。
    context.scale(scale.x, scale.y);

    // 描画領域も反転するので相殺しておく。
    dest = dest.clone().multi(scale).normalize();

    // 描画。
    this.matter.paint(context, dest);

    // 反転を戻す。
    context.scale(scale.x, scale.y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 宿主のExecutant階層をたどって、scaleの累積を返す。
 *
 * @return  累積されたscale
 */
ReadableRenderer.prototype.getTotalScale = function() {

    var result = new Point(1.0, 1.0);

    for(var ant = this.host ; ant ; ant = ant.parent)
        result.multi(ant.scale);

    return result;
}


//=========================================================================================================
/**
 * 他のレンダラによる描画を回転するレンダラ。
 *
 * @param   実際の描画を行うレンダラ。
 * @param   メンバ変数 pivot の値。
 */
function RotateRenderer(matter, pivot) {
    WrapperRenderer.call(this, matter);

    // ピボットの位置。回転中心を描画領域上のどこに合わせるか。
    // 描画領域の倍率で指定する。例えば左端なら0.0、中心なら0.5、右端なら1.0。
    // nullを指定すると宿主の座標系原点を中心とする。
    this.pivot = pivot || null;

    // 回転角度(ラジアン)。
    this.angle = 0.0;
}

RotateRenderer.prototype = Object.create(WrapperRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * paint() に干渉する。
 */
RotateRenderer.prototype.paint = function(context, dest) {

    // ピボットが指定されているなら、先にピボット位置に translate する。
    if(this.pivot) {
        var pivot = dest.getPoint(this.pivot).int();
        context.translate(pivot.x, pivot.y);
        dest.sub(pivot);
    }

    // セットされた回転を適用。
    context.rotate(this.angle);

    // 描画。
    this.matter.paint(context, dest);

    // 回転を戻す。
    context.rotate(-this.angle);

    // translate していたならそれも戻す。
    if(this.pivot)
        context.translate(-pivot.x, -pivot.y);
}
