
/**
 * Executant 階層のルートとなる「シーン」の基底クラス。Executantから派生している。
 * "body" ビヘイバを備え、getRect() でキャンバスに映っている領域を取得できる。
 *
 * シーン関連のクラス継承は次のようになっている。
 *      GlassScene => TimeScene => InteractScene => EngageScene
 *
 * 派生クラスではなくこのクラスのインスタンスを利用するケースとしては、メインのシーン階層からは独立した
 * オフスクリーンキャンバスの運用が考えられる。そのキャンバスをイメージリソースとしてメインから参照したい
 * ときなどに利用する。
 * ただ、階層システムやビヘイバイシステムが不要な単純なオフスクリーンキャンバスが必要ならば、独自に
 * 生成・準備したほうが良いだろう。
 *
 * @param   描画対象となる <canvas> 要素かそのid値。
 */
function GlassScene(canvas) {
    Executant.call(this);

    // canvas要素を取得。
    this.canvas = (canvas instanceof HTMLCanvasElement) ? canvas : document.getElementById(canvas);

    // そのContext2Dを取得。
    this.context = this.canvas.getContext("2d");

    // フレーム開始時間と、前回からの経過時間と積算時間。
    this.now = 0;
    this.delta = 0;
    this.time = 0;

    // ボディビヘイバを備える。
    var body = new Behavior();
    body.getRect = GlassScene.getRect;
    this.behaviors.set(body, "body");

    // イメージスムージングを無効にする。
    this.context.imageSmoothingEnabled = false;
}

GlassScene.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。引数に指定されたサイズでオフスクリーンキャンバスを作成する。
 *
 * @param   幅。
 * @param   高さ。
 * @return  指定されたサイズのオフスクリーンキャンバスを持つこのクラスのインスタンス。
 */
GlassScene.create = function(width, height) {

    // オフスクリーンキャンバスを作成。
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // このクラスのインスタンスを返す。
    return new GlassScene(canvas);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 1フレーム分の処理と描画を行う。
 *
 * @param   前フレームからの経過時間。省略した場合は 0、つまり時間を進めずにもう一度フレームを処理する。
 */
GlassScene.prototype.frame = function(delta) {

    // 経過時間をセット。
    this.delta = delta || 0;
    this.time += delta || 0;

    // フレームを処理する。
    this.kickCycle(this, "stand");
    this.kickCycle(this, "update");
    this.kickCycle(this, "stay");
    this.drawAllLayers();
}

//---------------------------------------------------------------------------------------------------------
/**
 * すべてのレイヤーを含めた描画を行う。
 */
GlassScene.prototype.drawAllLayers = function() {

    // 存在するレイヤを抽出する。
    this.makeTribeLayers();

    // 値の小さなレイヤから順に描画していく。
    for(var i = 0 ; i < this.tribeLayers.length ; i++)
        this.draw(this.tribeLayers[i], this.context, this);
}

//---------------------------------------------------------------------------------------------------
/**
 * スナップショットウィンドウを開く。
 */
GlassScene.prototype.snapshot = function() {

    var dataUrl = this.canvas.toDataURL();

    var windowWidth = this.canvas.width + 50;
    var windowHeight = this.canvas.height + 50;

    window.open(dataUrl, "", "width=" + windowWidth + ",height=" + windowHeight);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ボディビヘイバの挙動を実装する。thisはビヘイバを指しているので注意。
 */
GlassScene.getRect = function() {

    return this.host.getCoord(new Rect(0, 0, this.host.canvas.width, this.host.canvas.height)).normalize();
}
