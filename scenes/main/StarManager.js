
/**
 * 星の管理を行うMistant。
 */
function StarManager() {
    Mistant.call(this);

    this.layer = Main.UI;

    // 使用せずに控えになっている星の配列。
    this.benches = [];

    // 控えを作成する。
    for(var i = 0 ; i < StarManager.STAR_MAX ; i++)
        this.benches.push( new StarParticle() );
}

StarManager.prototype = Object.create(Mistant.prototype);

//---------------------------------------------------------------------------------------------------------

// 星の最大個数
StarManager.STAR_MAX = 10;

// 星が一回転するまでの時間(ms)。
StarManager.RING_TIME = 5000;

// 前回リセットから現在までの時間(ms)と回転角度(rad)。
StarManager.passed = 0;
StarManager.angle = 0;

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された位置に星を新規配置する。
 *
 * @param   配置座標を表すPointインスタンス。
 * @param   打ち出し角度。
 */
StarManager.prototype.whiffStar = function(pos, angle) {

    // 回転時間をリセット。
    StarManager.passed = 0;

    // 控えを一つ取り出す。
    var star = this.benches.pop();

    // 座標をセット。
    star.position = pos;

    // 打ち出し角度をセット。
    var mover = star.behaviors.get("mover");
    mover.angle = angle;

    // 画面長さの短い方の端で止まる程度の初速を計算する。
    var camera = this.parent.behaviors.get("body").getRect();
    var carry = Math.min(camera.width(), camera.height()) / 2;
    var speed = Math.sqrt(carry * 0.001 * 2);

    // その1/3を下限としてランダム取って初速とする。
    mover.speed = Math.randomRange(speed/3, speed);

    // 子供として追加。
    this.add(star);

    // 全ての星を打ち出したなら、全てスコアに打ち込んで回収する。
    if(this.benches.length == 0)
        this.sublimateStars();

    // 即回収しないなら音を鳴らす。
    else
        AudioSequencer.sound("catch");
}

//---------------------------------------------------------------------------------------------------------
/**
 * 出現している星を全てスコアに打ち込む。
 */
StarManager.prototype.sublimateStars = function() {

    // 得点計算してスコアに打ち込む。
    for(var i = 0, star ; star = this.particles[i] ; i++) {

        // スコアラに通知、スコアを取得。
        var score = this.parent.scorer.countScore(i);

        // スコアを画面上に表示。
        this.parent.setScoreDisplay(star.position, score);

        // 光跡をセット。
        this.parent.trackm.engraveTrack(star.position);
    }

    // 最後に一度に打ち込んだ星の数を通知。
    this.parent.scorer.endSublimation(this.particles.length);

    // すべての星を回収。
    Array.prototype.push.apply(this.benches, this.particles);
    this.particles = [];

    // 音を鳴らす。
    AudioSequencer.sound("charge");
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
StarManager.prototype.update = function(scene) {
    Mistant.prototype.update.call(this, scene);

    // 星の回転情報を管理する。
    StarManager.passed += scene.delta;
    StarManager.angle = Math.PI360 * StarManager.passed / StarManager.RING_TIME;

    // 一回転したらスコアに打ち込む。
    if(this.particles.length > 0  &&  StarManager.RING_TIME <= StarManager.passed)
        this.sublimateStars();
}


//=========================================================================================================

/**
 * 一つの星を表す描画素子。
 */
function StarParticle() {
    ImageParticle.call(this, "star");

    this.behaviors.set(new AngleMover(), "mover");
    this.behaviors.set(new SpeedFriction(), "friction");
}

StarParticle.prototype = Object.create(ImageParticle.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * plash() の実装。
 */
StarParticle.prototype.plash = function(context) {

    // 原点の移動と回転の適用。
    context.translate(this.position.x, this.position.y);
    context.rotate(StarManager.angle);

    // 描画。
    context.drawPieceC(this.piece, 0, 0);

    // 回転を戻す。
    context.rotate(-StarManager.angle);
    context.translate(-this.position.x, -this.position.y);
}
