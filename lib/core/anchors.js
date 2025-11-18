/**
 * アンカーに関するビヘイバを納めたファイル。
 */

//=========================================================================================================
/**
 * 指定されたターゲットを元に、宿主のポジションを変更するビヘイバ(アンカー)の基底クラス。
 *
 * @param   ターゲットとなるExecutant。宿主の親とする場合はnullを指定する。
 * @param   ターゲットのどこに合わせるか。具体的には派生クラスが決める。
 * @param   そこからずらして調節したい場合に、ずらす量。具体的には派生クラスが決める。
 */
function AnchorBehavior(target, pivot, offset) {
    Behavior.call(this);

    this.target = target;
    this.pivot = pivot;
    this.offset = offset;

    // 最初のフレームでresetが呼ばれるようにする。
    this.needReset();

    // thisを固定したanchor()を取得。
    this.anchorB = this.anchor.bind(this);
}

AnchorBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
AnchorBehavior.prototype.reset = function() {

    // ターゲットが指定されていなかったら宿主の親とする。
    if(!this.target)
        this.target = this.host.parent;

    // ターゲットにセンサを付けて監視するようにする。普通に考えれば behave() で都度チェックするほうが
    // シンプルなのだが、まあパフォーマンスを考えてこんな実装になっている。
    this.target.behaviors.need("sensor").onSense.register(this.anchorB);

    // 最初のチェック。
    var rect = this.target.behaviors.need("body").getRect();
    rect = this.target.globalCoord(rect).normalize();
    this.anchor(rect, this.target);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ターゲットの位置・サイズが変更されたら呼ばれる。
 */
AnchorBehavior.prototype.anchor = function(rect, target) {

    // ピボットを加味して位置するべき座標を取得。オフセットはまだ適用しない。
    var point = rect.getPoint(this.pivot);

    // ただ、それはルートの座標系におけるものなので、宿主の親の座標系に変換する。
    point = this.host.parent.localCoord(point);

    // 得られた座標をもとに派生クラスで位置を調整させる。
    this.adjust(point);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された座標にオフセットを適用して宿主の座標を変更する。
 *
 * @param   基準とするべき座標。
 */
AnchorBehavior.prototype.adjust = function(point) {

    throw "実装してください";
}

//---------------------------------------------------------------------------------------------------------
/**
 * attached() をオーバーライド。
 */
AnchorBehavior.prototype.attached = function(host) {
    Behavior.prototype.attached.call(this, host);

    // デタッチされたときにターゲットのセンサから登録を解除するようにする。
    if(host == null) {
        var sensor = this.target.behaviors.get("sensor");
        if(sensor)
            sensor.onSense.unregister(this.anchorB);
    }
}


//=========================================================================================================
/**
 * 指定されたターゲットを元に、宿主のポジションを変更するビヘイバ。
 *
 * @param   ターゲットとなるExecutant。宿主の親とする場合はnullを指定する。
 * @param   ターゲットのどこに合わせるかのPoint。左上なら(0, 0)、右下なら(1, 1)。省略時は中心になる。
 * @param   そこからずらして調節したい場合は、ずらす量をPointで指定する。
 */
function PositionAnchor(target, pivot, offset) {

    if(pivot == undefined)
        pivot = new Point(0.5, 0.5);

    if(offset == undefined)
        offset = Point.zero;

    AnchorBehavior.call(this, target, pivot, offset);
}

PositionAnchor.prototype = Object.create(AnchorBehavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * adjust() を実装。
 * 指定された座標にオフセットを適用して宿主の座標を変更する。
 */
PositionAnchor.prototype.adjust = function(point) {

    // オフセットを適用してからポジションとする。
    this.host.position = point.add(this.offset);
}


//=========================================================================================================
/**
 * 指定されたターゲットを元に、宿主のポジションを変更するビヘイバ。
 * PositionAnchor は座標を元に作用しているが、このアンカーは辺に対して作用する。
 * ただし、対になる両辺にこのアンカーをセットした場合の挙動は未定義。そうすることでサイズにも作用する
 * アンカーとなると、NGUIのように四辺を統合管理するものが必要になると思う。
 *
 * @param   どの辺を合わせるか。"left", "top", "right", "bottom" のいずれか。
 * @param   ターゲットとなるExecutant。宿主の親とする場合はnullを指定する。
 * @param   ターゲットのどこに合わせるか。左or上なら 0、右or下なら 1。省略時は中心になる。
 *          キーワード "left", "top", "right", "bottom", "center" で指定することも可能。
 * @param   そこからずらして調節したい場合は、ずらす量を指定する。
 */
function EdgeAnchor(edge, target, pivot, offset) {

    if(pivot == undefined)
        pivot = 0.5;

    if(offset == undefined)
        offset = 0;

    if(typeof pivot == "string"  ||  pivot instanceof String) {
        switch(pivot) {
            case "left": case "top":        pivot = 0.0;    break;
            case "center":                  pivot = 0.5;    break;
            case "right": case "bottom":    pivot = 1.0;    break;
        }
    }

    this.edge = edge;
    AnchorBehavior.call(this, target, pivot, offset);
}

EdgeAnchor.prototype = Object.create(AnchorBehavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * adjust() を実装。
 * 指定された座標にオフセットを適用して宿主の座標を変更する。
 */
EdgeAnchor.prototype.adjust = function(point) {

    // 調整する座標を取得。
    var axis = (this.edge == "left"  ||  this.edge == "right") ? "x" : "y";

    // オフセットを適用。
    var align = point[axis] + this.offset;

    // 自身の矩形を得る。
    var body = this.host.behaviors.need("body").getRect();

    // 指定の辺を合わせる。
    this.host.position[axis] = align - body[this.edge]();
}
