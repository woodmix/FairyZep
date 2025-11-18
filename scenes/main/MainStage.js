
/**
 * 自機や風船が所属するメインステージを表すExecutant。
 */
function MainStage() {
    Executant.call(this);

    // 自機。
    this.zep = new Zep();
    this.childs.set(this.zep, "zep");

    // 風船管理。
    this.balls = new AirballManager();
    this.childs.set(this.balls, "balls");

    // デバッグモードならグリッド線を追加。
    if(Settings["debug"])
        this.childs.set(new DebugGrid(), "grid");
}

MainStage.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------

// ステージの高さ。
MainStage.HEIGHT = 1280*2;

//---------------------------------------------------------------------------------------------------------
/**
 * 自機が風船を取ったら呼ばれる。
 *
 * @param   取った風船。
 */
MainStage.prototype.punchAirball = function(airball) {

    // 自機から風船への角度を取得。
    var angle = airball.position.angle(this.zep.position);

    // 風船の位置に星を出す。
    this.parent.starm.whiffStar(this.parentCoord(airball.position), angle);

    // 該当の風船を回収。
    this.balls.collectBall(airball);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
MainStage.prototype.update = function(scene) {

    // ステージの終端を取得。
    var last = Plot.getEnd();

    // カメラに映っている領域を取得。
    var camera = scene.behaviors.need("body").getRect();

    // 基本的に、自機が X軸1/3, Y軸中央 に映るように調節するが...
    this.position.x = -(this.zep.position.x - camera.width()/3);
    this.position.y = -(this.zep.position.y - camera.height()/2);

    // ステージ左辺より外がカメラに映らないようにする。
    if(this.position.x > 0)
        this.position.x = 0;

    // ステージ上辺より外がカメラに映らないようにする。
    if(this.position.y > 0)
        this.position.y = 0;

    // ステージ下辺より外がカメラに映らないようにする。
    if(this.position.y + MainStage.HEIGHT < camera.height())
        this.position.y = camera.height() - MainStage.HEIGHT;

    // ステージ右辺より外がカメラに映らないようにする。
    if(this.position.x + last < camera.right())
        this.position.x = camera.width() - last;

    // ステージ終端の少し後ろか手前のX座標を自機が通過したら、該当する信号を飛ばし続ける(飛ばされ側としては一回で良いんだけど...)。
    if( last + 100 <= this.zep.position.x )
        this.parent.onFinishingComplete();
    else if( last - 200 <= this.zep.position.x )
        this.parent.onFinishingUpdate();
}
