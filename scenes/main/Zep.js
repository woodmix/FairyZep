
/**
 * 自機を表すExecutant。
 */
function Zep() {
    Executant.call(this);

    // とりあえず、最初のY座標。
    this.position.y = MainStage.HEIGHT / 2;

    // 落下スピード(px/ms)。マイナスの場合は上昇中であることを表す。
    this.fall = 0.0;

    // 上昇表示タイマー(ms)。
    this.risingTimer = 0;

    // レイヤー番号をセット。描画は独自に行うのでレンダラは持たない。
    this.layer = Main.ZEP;

    // 使用するイメージ二つを取得。
    this.balloon = new ImagePiece( Resources.get("zep_balloon") );
    this.gondola = new ImagePiece( Resources.get("zep_gondola") );

    // ボディと当たり判定をセット。
    var rect = Rect.byCenter(0, 0, 144, 144);
    this.behaviors.set(new RectBody(rect), "body");
    this.behaviors.set(new RigidBehavior(), "rigid");

    // 風船と当たり判定出来るようにする。
    this.behaviors.set(new ColliderBehavior("parent.balls.launches"), "collider");

    // 画面全体に対するタップに反応できるようにする。
    this.behaviors.set(new WholeInteractor(), "interactor");
};

Zep.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------

// スクロールスピード(px/ms)。
Zep.SCROLL_SPEED = 100;

// 上昇・降下に関する値。
Zep.RISE_POWER = 50/1000;      // 押下したときに加算される上昇スピード(px/ms)
Zep.RISE_LIMIT = 250/1000;     // 上昇スピード限界(px/ms)
Zep.FALL_LIMIT = 250/1000;     // 降下スピード限界(px/ms)
Zep.GRAVITY = 100/1000/1000;   // 降下加速度(px/ms/ms)

// タップしたときにバルーンを膨張表示する時間(ms)。
Zep.RISE_TIME = 500;

//---------------------------------------------------------------------------------------------------------
/**
 * 風船と当たったら呼ばれる。
 *
 * @param  当たった相手Executant
 */
Zep.prototype.collided = function(competitor) {

    this.parent.punchAirball(competitor);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
Zep.prototype.update = function(scene) {

    // 設定されたスピードでX軸方向移動。
    this.position.x += Zep.SCROLL_SPEED/1000 * scene.delta;

    // Y軸移動。
    this.position.y += this.fall * scene.delta;

    // 上辺はみ出し判定。上辺一杯まで上昇した場合は落下スピードをリセットする。
    if(this.position.y < 0) {
        this.position.y = 0;
        this.fall = 0.0;
    }

    // 同じく下辺判定。
    if(this.position.y >= MainStage.HEIGHT) {
        this.position.y = MainStage.HEIGHT - 1;
        this.fall = 0.0;
    }

    // 重力設定反映。
    this.fall += Zep.GRAVITY * scene.delta;
    if(this.fall > Zep.FALL_LIMIT)
        this.fall = Zep.FALL_LIMIT;

    // 上昇表示タイマーの管理。
    this.risingTimer -= scene.delta;
    if(this.risingTimer < 0)
        this.risingTimer = 0;
}

//---------------------------------------------------------------------------------------------------------
/**
 * タッチされたら呼ばれる。tap()のほうが好ましいが、反応を良くするためにtouch()を使う。
 */
Zep.prototype.touch = function() {

    // 上昇表示タイマーをリセット。
    this.risingTimer = Zep.RISE_TIME;

    // 降下中の場合は一旦スピードをリセットする。
    if(this.fall > 0)
        this.fall = 0;

    // 上昇スピードを強化。
    this.fall -= Zep.RISE_POWER;
    if(this.fall < -Zep.RISE_LIMIT)
        this.fall = -Zep.RISE_LIMIT;

    // 音を鳴らす。
    AudioSequencer.sound("levitate");
}

//---------------------------------------------------------------------------------------------------------
/**
 * 描画を行うべきタイミングで呼ばれる。
 */
Zep.prototype.depict = function(context, scene) {

    // まずはゴンドラを描画。
    context.drawPiece(this.gondola, -72, 0);

    // バルーンの矩形を取得して、中心を適切な位置に合わせることで、描画先矩形とする。
    var dest = this.balloon.rect();
    dest.center(0, -26);

    // バルーンを膨らませて、上昇表示タイマーを表現する。
    dest.swell(16 * this.risingTimer / Zep.RISE_TIME);

    // バルーンを描画。
    context.drawPiece(this.balloon, dest.left(), dest.top(), dest.width(), dest.height());
}
