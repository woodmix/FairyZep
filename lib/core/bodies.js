/**
 * Executantが占める矩形に関するビヘイバを納めたファイル。
 */

//=========================================================================================================
/**
 * 指定された領域をボディとするボディビヘイバー。
 *
 * @param   ボディとしたい矩形。
 */
function RectBody(rect) {
    Behavior.call(this);

    this.rect = rect;
}

RectBody.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 宿主が存在する領域を宿主の座標系で返す。宿主の座標系で返すので宿主のスケールやポジションの影響は
 * 受けない。
 *
 * @return  宿主が存在する領域を表すRect。
 */
RectBody.prototype.getRect = function() {

    return this.rect.clone();
}


//=========================================================================================================
/**
 * 宿主のレンダラにセットされたイメージを参照してボディとするビヘイバー。
 * そのレンダラはプロパティに piece という名前で ImagePiece インスタンスを持っている必要がある。
 */
function ImageBody() {
    Behavior.call(this);
}

ImageBody.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
ImageBody.prototype.getRect = function() {

    // まだアタッチされてないなら計算できない。
    if(!this.host)
        return Rect.zero.clone();

    // レンダラがなかったら計算できない。
    var renderer = this.host.behaviors.get("renderer");
    if(!renderer)
        return Rect.zero.clone();

    // レンダラの piece プロパティから使用矩形を取得。
    var srcrect = renderer.prop("piece").rect();

    // それを元に宿主のボディを求める。
    return this.laydown(srcrect.size);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定されたサイズからボディ矩形を計算する。
 *
 * @param   描画元の矩形。
 * @return  サイズを表す Point。
 */
ImageBody.prototype.laydown = function(size) {

    // 指定された矩形の中央が、宿主の座標位置に当たるようにボディ領域を求める。
    return new Rect(new Point(-size.x/2, -size.y/2), size);
}


//=========================================================================================================
/**
 * ImageBody と同じだが、ピボットやスケールを指定できるようにしたもの。ImageBody から派生している。
 *
 * @param   ピボットの位置。宿主の座標をイメージ上のどこに合わせるか。
 *          描画イメージの倍率で指定する。例えば左端なら0.0、中心なら0.5、右端なら1.0。省略時は中心。
 * @param   描画倍率。描画イメージの倍率で指定する。半分にするなら0.5、倍サイズにするなら2.0。省略時は
 *          そのまま。
 */
function RevisionBody(pivot, scale) {
    ImageBody.call(this);

    this.pivot = pivot ? pivot.clone() : new Point(0.5, 0.5);
    this.scale = scale ? scale.clone() : Point.one.clone();
}

RevisionBody.prototype = Object.create(ImageBody.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * laydown() をオーバーライド。
 */
RevisionBody.prototype.laydown = function(size) {

    // イメージのサイズにスケールを反映。
    var size = size.clone();
    size.multi(this.scale);

    // ピボットから左上位置を取得する。
    return Rect.byPivot(this.pivot, size);
}


//=========================================================================================================
/**
 * キャンバスに映る領域をボディとするビヘイバー。
 */
function CanvasBody() {
    Behavior.call(this);
}

CanvasBody.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
CanvasBody.prototype.getRect = function() {

    var scene = this.host.getScene();
    var rect = scene.behaviors.need("body").getRect();

    return scene.spinCoord(rect, this.host).normalize();
}


//=========================================================================================================
/**
 * センサービヘイバ。宿主のボディ矩形がルート(キャンバス)座標系において変更されてないかを監視する。
 */
function BodySensor() {
    Behavior.call(this);

    // 変更が発生したら起動されるデリゲート。
    // 引数は、ルート座標における系新しいボディ矩形, 宿主のExecutant。
    this.onSense = new Delegate();

    // 前回までのボディ。
    this.previous = undefined;
}

BodySensor.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * updateごとに呼ばれる。
 */
BodySensor.prototype.behave = function(delta) {

    // 宿主のルート座標系におけるボディ領域を取得。
    var rect = this.host.behaviors.need("body").getRect();
    rect = this.host.globalCoord(rect).normalize();

    if(this.previous) {

        // 前回と異なるならイベントを起動。
        if( !this.previous.equals(rect) )
            this.onSense.trigger(rect, this.host);
    }

    this.previous = rect;
}


//=========================================================================================================
/**
 * チェックしないセンサー。センサーが必要だが動かないことが分かっているExecutantはこれを付けておくと
 * パフォーマンスが良くなる。
 */
function DeadSensor() {
    BodySensor.call(this);
}

DeadSensor.prototype = Object.create(BodySensor.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * behave() をオーバーライド。機能しないようにする。
 */
DeadSensor.prototype.behave = function(delta) {
}


//=========================================================================================================
/**
 * インタラクションビヘイバ。次のような実装になっている。
 * ・インタラクションを必要とする座標の取得に宿主の "body" ビヘイバーを使う。
 * ・インタラクション時の処理は宿主の "touch", "tap", "drag" というメソッドに委譲する。
 *      tap(pos)
 *          posはタッチされた座標。
 *          タップされたら発行される。ロングタップやドラッグでは発行されない。
 *          touchend(mouseup) 後の最初の update() 時に発行されるため、スマートデバイスでは Audio.play() などはできない。
 *      drag(move)
 *          moveはこの呼び出しでのドラッグベクトル。
 *          ドラッグされたら発行される。詳しくは同上。
 *      touch(pos)
 *          posはタッチされた座標。
 *          touchstart(mousedown) でただちに発行される。そのためタップとドラッグの区別などは付けられない。
 *          また、レイヤも考慮されない。
 *          イベントハンドラのフロー内で呼ばれるので、スマートデバイスでも Audio.play() などが有効に働く。
 *              ⇒touchstart では働かなくなった。代わりにhand()を利用されたい。
 *      hand(pos)
 *          tap と同じだが、touchend(mouseup) のハンドラ内で直接コールされるので Audio.play() などが有効に
 *          働く。
 *          touch() では Audio.play() できなくなったので代替として用意されたもの。これから先はどうなるのか…
 */
function InteractBehavior() {
    Behavior.call(this);
}

InteractBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された座標でのタッチイベントを処理するとともに、その座標でのインタラクション種別を返す。
 *
 * @param   座標
 * @return  インタラクション種別。以下のいずれか。
 *              tap         タップ系
 *              drag        ドラッグ系
 *              all         両方
 *              (空文字)    タップもドラッグも処理しないが、タッチイベントそのものは処理した。
 *              null        なし
 */
InteractBehavior.prototype.touch = function(point) {

    // 指定された座標でインタラクションしないなら何もない。
    if( !this.isSensitive(point) )
        return null;

    // 宿主に touch() というメソッドがあるならコールする。
    var processed = typeof(this.host.touch) == "function";
    if(processed)
        this.host.touch(point);

    // 戻り値を決める。
    switch(true) {
        case (typeof(this.host.tap) == "function" || typeof(this.host.hand) == "function")  &&  typeof(this.host.drag) == "function":
            return "all";
        case typeof(this.host.tap) == "function" || typeof(this.host.hand) == "function":
            return "tap";
        case typeof(this.host.drag) == "function":
            return "drag";
        default:
            return processed ? "" : null;
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された座標でのUIインタラクションを処理するかどうかを返す。
 *
 * @param   座標
 * @return  処理するならtrue、しないならfalse。
 */
InteractBehavior.prototype.isSensitive = function(point) {

    // 基底の実装としては、宿主の "body" ビヘイバーが示す領域内に、指定された座標があるかどうかで判断する。
    return this.host.behaviors.need("body").getRect().inside(point);
}

//---------------------------------------------------------------------------------------------------------
/**
 * UIインタラクションに対する反応を行う。
 *
 * @param   操作情報。次のキーを持つ。
 *              type    種別。"tap", "drag", "hand" のいずれか。
 *              begin   タッチスタートした座標。
 *              move    drag の場合にセットされる。ドラッグベクトル。
 */
InteractBehavior.prototype.interact = function(event) {

    // 移譲先のメソッドを取得。メソッドがあるなら...
    var handle = this.host[event.type];
    if(typeof(handle) == "function") {

        // メソッドに渡す引数を決定。
        var arg = (event.type == "drag") ? event.move : event.begin;

        // コール。
        handle.call(this.host, arg);
    }
}


//=========================================================================================================
/**
 * InteractBehavior と同じだが、宿主のボディ矩形のみで反応するのではなく全ての座標で反応する点が異なる。
 */
function WholeInteractor() {
    InteractBehavior.call(this);
}

WholeInteractor.prototype = Object.create(InteractBehavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 全ての座標で反応するようにする。
 */
WholeInteractor.prototype.isSensitive = function(point) {

    return true;
}
