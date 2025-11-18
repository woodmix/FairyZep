/**
 * 座標に関するクラスを収める。
 */

// 二次元座標を表すクラス。
//=========================================================================================================

function Point(x, y) {
    this.x = (x == undefined) ? 0 : x;
    this.y = (y == undefined) ? 0 : y;
}

//---------------------------------------------------------------------------------------------------------
Point.zero = new Point(0, 0);
Point.one = new Point(1, 1);

//---------------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。引数に指定された角度の sin, cos からインスタンスを生成する。
 *
 * @param   角度(ラジアン)。
 * @return  与えられた角度の cos を X、sin を Y とするPoint。
 */
Point.circle = function(angle) {

    return new Point( Math.cos(angle), Math.sin(angle) );
}

//---------------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。同じ値を X, Y とするインスタンスを生成する。
 *
 * @param   値。
 * @return  与えられた値を X, Y とするPoint。
 */
Point.regular = function(value) {

    return new Point(value, value);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 等しいかどうかを返す。
 */
Point.prototype.equals = function(x, y) {

    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    return this.x == x  &&  this.y == y;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に与えられた座標をセットする。
 */
Point.prototype.set = function(x, y) {

    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    if(y == undefined)
        y = x;

    this.x = x;
    this.y = y;
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に与えられた値を加算する。
 */
Point.prototype.add = function(x, y) {

    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    this.x += x;
    this.y += y;
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に与えられた値を減算する。addの反対。
 */
Point.prototype.sub = function(x, y) {

    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    this.x -= x;
    this.y -= y;
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた数をかける。
 *
 * @param   単一の値、あるいはPoint。
 */
Point.prototype.multi = function(multiplyer) {

    if(multiplyer instanceof Point)  {
        this.x *= multiplyer.x;
        this.y *= multiplyer.y;
    }else {
        this.x *= multiplyer;
        this.y *= multiplyer;
    }

    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた数で割る。
 *
 * @param   単一の値、あるいはPoint。
 */
Point.prototype.divide = function(divider) {

    if(divider instanceof Point)  {
        this.x /= divider.x;
        this.y /= divider.y;
    }else {
        this.x /= divider;
        this.y /= divider;
    }

    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * x, y ともに絶対値とする。
 */
Point.prototype.abs = function() {

    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * X, Y 成分をそれぞれ単位化(正なら+1、負なら-1、0なら0に)する。
 */
Point.prototype.sign = function() {

    this.x = Math.sign(this.x);
    this.y = Math.sign(this.y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * X, Y 成分の小数部分を切り捨てる。
 */
Point.prototype.int = function() {

    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 原点から、あるいは指定されたPointからの距離を求める。
 */
Point.prototype.distance = function(he) {

    if(he)
        return this.clone().sub(he).distance();

    return Math.sqrt(this.x * this.x + this.y * this.y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 原点から、あるいは指定されたPointからの軸上の距離(x, y の絶対値を足した値)を求める。
 * distance() ほど厳密な距離が必要ないならこちらのほうが速い。
 */
Point.prototype.axisdist = function(he) {

    if(he)
        return this.clone().sub(he).axisdist();

    return Math.abs(this.x) + Math.abs(this.y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 原点からあるいは指定されたPointから、このインスタンスが示す座標への角度を返す。
 *
 * @return  角度。(0, 0) の場合は NaN。
 */
Point.prototype.angle = function(he) {

    if(he)
        return this.clone().sub(he).angle();

    var angle = Math.atan(this.y / this.x);
    if(this.x < 0)
        angle += Math.PI;

    return angle;
}

//---------------------------------------------------------------------------------------------------------
/**
 * クローンを返す。Object.clone() があるが、よく使うので少しでも速くなるように…
 */
Point.prototype.clone = function() {

    return new Point(this.x, this.y);
}

//---------------------------------------------------------------------------------------------------------
Point.prototype.toString = function() {

    return "Point x:" + this.x + ", y:" + this.y;
}


// 二次元矩形を表すクラス。
//=========================================================================================================

/**
 * コンストラクタ。
 * 引数は左上座標と幅・高さで指定する。4つの諸元でも、二つのPointでも可。
 */
function Rect(x, y, w, h) {

    this.set(x, y, w, h);
}

//---------------------------------------------------------------------------------------------------------
/**
 * このインスタンスを引数に与えられた矩形としてセットする。
 * 引数は四つの諸元でも、二つのPointでも、一つのRectでも可。
 */
Rect.prototype.set = function(x, y, w, h) {

    if(x instanceof Rect) {
        y = x.size;
        x = x.lt;
    }

    this.lt = (x instanceof Point) ? x.clone() : new Point(x, y);
    this.size = (y instanceof Point) ? y.clone() : new Point(w, h);
}

//---------------------------------------------------------------------------------------------------------

Rect.zero = new Rect(0, 0, 0, 0);
Rect.one = new Rect(0, 0, 1, 1);

/**
 * 左上座標と右下座標で作成する。4つの諸元でも、二つのPointでも可。
 */
Rect.byCorner = function(x, y, r, b) {

    if(x instanceof Point) {
        r = y.x;  b = y.y;
        y = x.y;  x = x.x;
    }

    return new Rect(x, y, r - x, b - y);
}

/**
 * 中心座標と幅・高さで作成する。4つの諸元でも、二つのPointでも可。
 */
Rect.byCenter = function(cx, cy, w, h) {

    if(cx instanceof Point) {
        w = cy.x;   h = cy.y;
        cy = cx.y;  cx = cx.x;
    }

    return new Rect(cx - w/2, cy - h/2, w, h);
}

/**
 * 中心座標と半径で作成する。4つの諸元でも、二つのPointでも可。
 */
Rect.byRadius = function(cx, cy, rx, ry) {

    if(cx instanceof Point) {
        rx = cy.x;  ry = cy.y;
        cy = cx.y;  cx = cx.x;
    }

    return new Rect(cx - rx, cy - ry, cx + rx, cy + ry);
}

/**
 * 原点位置の割合とサイズで作成する。4つの諸元でも、二つのPointでも可。
 */
Rect.byPivot = function(px, py, w, h) {

    if(px instanceof Point) {
        w = py.x;   h = py.y;
        py = px.y;  px = px.x;
    }

    var size = new Point(w, h);

    var lt = new Point(size.x * -px, size.y * -py);

    return new Rect(lt, size);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 上下左右の四辺の座標、幅・高さを設定したり取得したりする。
 * 引数を指定した場合は設定、指定しなかったら取得。
 */

Rect.prototype.left = function(change) {

    if(change == undefined)
        return this.lt.x;

    this.size.x -= change - this.lt.x;
    this.lt.x = change;
}

Rect.prototype.top = function(change) {

    if(change == undefined)
        return this.lt.y;

    this.size.y -= change - this.lt.y;
    this.lt.y = change;
}

Rect.prototype.right = function(change) {

    if(change == undefined)
        return this.lt.x + this.size.x;

    this.size.x = change - this.lt.x;
}

Rect.prototype.bottom = function(change) {

    if(change == undefined)
        return this.lt.y + this.size.y;

    this.size.y = change - this.lt.y;
}

Rect.prototype.width = function(change) {

    if(change == undefined)
        return this.size.x;

    this.size.x = change;
}

Rect.prototype.height = function(change) {

    if(change == undefined)
        return this.size.y;

    this.size.y = change;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 中心の座標を設定したり取得したりする。
 * 引数を指定した場合は設定、指定しなかったら取得。
 */
Rect.prototype.center = function(x, y) {

    // 指定されていなかったら中心座標を返す。
    if(x == undefined)
        return this.getPoint(0.5, 0.5);

    // 引数正規化。
    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    // 操作。
    this.lt.x = x - this.size.x/2;
    this.lt.y = y - this.size.y/2;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 右下角の座標を返す。
 */
Rect.prototype.rb = function() {

    return new Point(this.right(), this.bottom());
}

//---------------------------------------------------------------------------------------------------------
/**
 * 矩形の左上から、引数で指定された比率分、右下に向かった座標を返す。
 * 例)
 *      var rect = new Rect(100, 100, 100, 100);
 *      rect.getPoint(0.0, 0.0);    // 100, 100
 *      rect.getPoint(0.5, 0.0);    // 150, 100
 *      rect.getPoint(0.5, 0.5);    // 150, 150
 *      rect.getPoint(0.0, 0.5);    // 100, 150
 *      rect.getPoint(1.0, 1.0);    // 200, 200
 *
 * @param   比率。
 *              (int, int)  X, Y軸における比率をそれぞれ指定する。
 *              (Point)     Pointで指定する。
 *              (int)       X, Y軸両方とも同じ比率を指定する。
 * @return  指定された位置の座標を表す Point。
 */
Rect.prototype.getPoint = function(x, y) {

    if(x instanceof Point) {
        y = x.y;  x = x.x;
    }

    if(y == undefined)
        y = x;

    return new Point(this.lt.x + this.size.x * x, this.lt.y + this.size.y * y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * サイズがマイナスになっている虚状態を解消する。
 */
Rect.prototype.normalize = function() {

    if(this.size.x < 0) {
        this.lt.x += this.size.x;
        this.size.x *= -1;
    }

    if(this.size.y < 0) {
        this.lt.y += this.size.y;
        this.size.y *= -1;
    }

    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に与えられたPoint分、矩形の位置を動かす。
 */
Rect.prototype.add = function(x, y) {

    this.lt.add(x, y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に与えられたPoint分、矩形の位置をマイナス方向へ動かす。
 */
Rect.prototype.sub = function(x, y) {

    this.lt.sub(x, y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * この矩形に与えられた数をかける。
 *
 * @param   単一の値、あるいはPoint。
 */
Rect.prototype.multi = function(multiplyer) {

    this.lt.multi(multiplyer);
    this.size.multi(multiplyer);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * この矩形に与えられた数で割る。
 *
 * @param   単一の値、あるいはPoint。
 */
Rect.prototype.divide = function(divider) {

    this.lt.divide(divider);
    this.size.divide(divider);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 右下位置を固定したまま、引数に与えられたベクトルだけ左上座標を動かす。
 * プラスで右下方向、マイナスで左上方向となる。
 */
Rect.prototype.neck = function(x, y) {

    this.lt.add(x, y);
    this.size.sub(x, y);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された値だけ矩形の四辺を動かして膨らませる。
 *
 * @param   どのくらい膨らませるか。例えば 5 を指定すると、両側が 5 ずつ膨らむため 10 膨らむことになる。
 *          縮ませたい場合はマイナスの値を指定する。
 */
Rect.prototype.swell = function(x) {

    this.lt.sub(x, x);
    this.size.add(x*2, x*2);
    return this;
}

//---------------------------------------------------------------------------------------------------------
/**
 * この矩形が引数に指定された矩形と等しいかどうかを返す。
 */
Rect.prototype.equals = function(rect) {

    return this.lt.equals(rect.lt)  &&  this.size.equals(rect.size);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された座標が矩形の中にあるかどうかを返す。
 */
Rect.prototype.inside = function(point) {

    return !(
        point.x < this.lt.x  ||  this.right() <= point.x  ||  point.y < this.lt.y  ||  this.bottom() <= point.y
    );
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された矩形と重複している部分があるかどうかを返す。
 */
Rect.prototype.collide = function(rect) {

    return !(
        rect.right() <= this.lt.x  ||  rect.bottom() <= this.lt.y  ||  this.right() <= rect.lt.x  ||  this.bottom() <= rect.lt.y
    );
}

//---------------------------------------------------------------------------------------------------------
/**
 * この矩形と引数に指定された矩形が重複して構成される矩形を返す。
 */
Rect.prototype.intersect = function(rect) {

    return RectByCorner(
        Math.max(this.left(), rect.left()), Math.max(this.top(), rect.top()),
        Math.min(this.right(), rect.right()), Math.min(this.bottom(), rect.bottom())
    );
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたサイズのグリッド升を単位として、矩形の四隅が位置するポイントを使って、新たな矩形を作成する。
 */
Rect.prototype.grid = function(dimension) {

    var x = Math.floor(this.lt.x / dimension);
    var y = Math.floor(this.lt.y / dimension);
    var r = Math.floor((this.right() - 1) / dimension) + 1;
    var b = Math.floor((this.bottom() - 1) / dimension) + 1;

    return RectByCorner(x, y, r, b);
}

//---------------------------------------------------------------------------------------------------------
/**
 * クローンを返す。Object.clone() があるが、よく使うので少しでも速くなるように…
 */
Rect.prototype.clone = function() {

    return new Rect(this.lt, this.size);
}

//---------------------------------------------------------------------------------------------------------
Rect.prototype.toString = function() {

    return "Rect left:" + this.lt.x + ", top:" + this.lt.y + ", width:" + this.size.x + ", height:" + this.size.y + ", right:" + this.right() + ", bottom:" + this.bottom();
}
