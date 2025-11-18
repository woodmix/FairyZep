
/**
 * 光跡の管理を行うMistant。
 */
function TrackManager() {
    Mistant.call(this);

    this.layer = Main.ZEP;
};

TrackManager.prototype = Object.create(Mistant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 光跡を一つ加える。
 *
 * @param   打ち出し座標
 */
TrackManager.prototype.engraveTrack = function(launchPoint) {

    // スコアのボディ中央を取得。
    var scorer = this.parent.scorer;
    var body = scorer.parentCoord( scorer.behaviors.need("body").getRect() );
    var center = body.getPoint(0.5).int();

    // そこへ向かって光跡を置く。
    var track = new StarTrack(center);
    track.position = launchPoint;
    this.add(track);
}


//=========================================================================================================

/**
 * 一つの光跡を表す描画素子。
 *
 * @param   目標地点。
 */
function StarTrack(target) {
    Particle.call(this);

    // 目標地点。
    this.targetPoint = target;

    // ライフタイム。
    this.timer = StarTrack.LIFE_TIME;
}

StarTrack.prototype = Object.create(Particle.prototype);

//---------------------------------------------------------------------------------------------------------

// 初期の線の太さ。この値と同じだけの影が両端に付くため、実際の線の太さはこの値の3倍になる。
StarTrack.LINE_WIDTH = 20;

// 描画時間(ms)。
StarTrack.LIFE_TIME = 1000;

//---------------------------------------------------------------------------------------------------------
/**
 * 時間の経過を処理する。
 */
StarTrack.prototype.flow = function(delta) {

    // ライフタイムを管理する。
    this.timer -= delta;

    return 0 < this.timer;
}

//---------------------------------------------------------------------------------------------------------
/**
 * このパーティクルを描画する。
 */
StarTrack.prototype.plash = function(context) {

    // 原点からtargetPointまで、直線を引く。
    context.beginPath();
    context.moveTo(this.position.x, this.position.y);
    context.lineTo(this.targetPoint.x, this.targetPoint.y);
    context.strokeStyle = "gold";
    context.shadowColor = "gold";

    // 線の太さはライフタイムの現象に従い細くする。
    context.lineWidth = this.timer / StarTrack.LIFE_TIME * StarTrack.LINE_WIDTH;
    context.shadowBlur = this.timer / StarTrack.LIFE_TIME * StarTrack.LINE_WIDTH;
    context.stroke();

    // スタイルのリセット。
    context.shadowColor = "#00000000";
    context.shadowBlur = 0;
}
