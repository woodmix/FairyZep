
/**
 * キャンバスのCSSサイズと連動して内部サイズを変更するシーンを表す。InteractScene から派生する。
 * キャンバスの内部サイズがユーザの手によって変化するのでそれに対応できる必要がある。
 * ゲーム世界をそのときのキャンバスの大きさの窓から覗いたように表現することになるだろう。大きな
 * PCディスプレイでは世界全体が表示されるし、小さなスマホディスプレイではわずかな領域のみが表示
 * されることになる。
 *
 * このクラスではなく一つ下のInteractSceneを使うなら、キャンバスの内部サイズは常にプログラムが指定した
 * 大きさで、ユーザが決めた(あるいは固定された)表示サイズへ伸縮して表示することになる。
 */
function EngageScene(canvasId) {
    InteractScene.call(this, canvasId);

    // メトリクス計算などで使う内部ピクセルレシオ。
    this.internalPixelRatio = undefined;

    // 実際のキャンバスのピクセルレシオ。internalPixelRatio より高くなることはないが、小さくなることはある。
    this.canvasPixelRatio = undefined;

    // 基底では、内部ピクセルレシオを 2 とする。
    this.setPixelRatio(2);

    // センサービヘイバを備える。
    var sensor = new Behavior();
    sensor.onSense = new Delegate();
    this.behaviors.set(sensor, "sensor");

    // ウィンドウリサイズ時にcanvasのピクセルサイズも連動するようにする。
    $(window).on("resize_delayed", this.resized.bind(this));
}

EngageScene.prototype = Object.create(InteractScene.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 内部ピクセルレシオをセットする。@1x の密度で処理するなら 1、@2x の密度で処理するなら 2 を指定する。
 *
 * @param   内部ピクセルレシオ。
 */
EngageScene.prototype.setPixelRatio = function(ratio) {

    // 指定されたレシオをメンバ変数で保持する。
    this.internalPixelRatio = ratio;

    // キャンバスのピクセルレシオを決定。基本的には引数で指定された値だが、デバイスのピクセルレシオを
    // 超えても無駄なので、超えないようにする。
    this.canvasPixelRatio = Math.min(this.internalPixelRatio, window.devicePixelRatio);

    // キャンバス要素に反映する。
    this.engageSize();

    // 指定されたレシオとキャンバスの実際のレシオが異なる(キャンバスの方が小さい)場合は、ルート要素の
    // スケールを調整して適合するようにする。例えば、キャンバスが @1x で内部は @2x なら、ルート要素を
    // 半分に縮小するようにする。
    this.scale.set(this.canvasPixelRatio / this.internalPixelRatio);
}

//---------------------------------------------------------------------------------------------------------
/**
 * キャンバスのピクセル数をDOM要素の大きさに合わせる。
 */
EngageScene.prototype.engageSize = function() {

    this.canvas.width = this.canvas.clientWidth * this.canvasPixelRatio;
    this.canvas.height = this.canvas.clientHeight * this.canvasPixelRatio;
}

//---------------------------------------------------------------------------------------------------------
/**
 * ウィンドウがリサイズされたら呼ばれる。
 */
EngageScene.prototype.resized = function() {

    // キャンバスのピクセル数をリサイズ後の大きさに合わせる。
    this.engageSize();

    // センサービヘイバのイベントを起動。
    var sensor = this.behaviors.get("sensor");
    if(sensor) {
        var rect = this.globalCoord( this.behaviors.get("body").getRect() ).normalize();
        sensor.onSense.trigger(rect, this);
    }

    // すでに初期化しているなら再描画する。
    if(this.initialized)
        this.frame();
}

//---------------------------------------------------------------------------------------------------------
/**
 * getCanvasRatio() をオーバーライド。基底の実装でも問題ないが、せっかくメンバ変数に保持しているので…
 */
EngageScene.prototype.getCanvasRatio = function() {

    return Point.regular(this.canvasPixelRatio);
}
