
/**
 * スコアを表すExecutant。
 */
function Airball() {
    Executant.call(this);

    this.layer = Main.ZEP;
    this.behaviors.set(new AirballRenderer(), "renderer");
    this.behaviors.set(new RigidBehavior(), "rigid");
}

Airball.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------

// 風船の膨らみ幅と1/4周期(ms)。
Airball.RESP_WIDTH = 5;
Airball.RESP_QUARTER = 500;

// 現在の膨らみ幅。
Airball.respiration = 0;

//---------------------------------------------------------------------------------------------------------
/**
 * 風船の膨らみ幅(Airball.respiration)を管理する。
 */
Airball.bounceRespiration = function(scene) {

    // 現在の周期における位相を取得。
    var phase = scene.time % (Airball.RESP_QUARTER * 4);

    // 0.0 ～ 4.0 で表現する。
    var phaseF = phase / Airball.RESP_QUARTER;

    // 半分より後ろを折り返す。0.0 ⇒ 2.0 ⇒ 0.0 ⇒ -2.0 となる。
    if(phaseF > 2.0)
        phaseF = 2.0 - (phaseF - 2.0);

    // -1.0 ～ +1.0 とする。
    phaseF -= 1;

    // あとは幅をかけて出来上がり。
    Airball.respiration = Math.floor( phaseF * Airball.RESP_WIDTH );
}


//=========================================================================================================
/**
 * 風船用のレンダラ。普通のImageRendererと同じだが、静的変数 Airball.respiration が示す分だけ
 * 膨張・収縮しながら描画する。
 */
function AirballRenderer() {
    ImageRenderer.call(this, "airball");
}

AirballRenderer.prototype = Object.create(ImageRenderer.prototype);

//---------------------------------------------------------------------------------------------------------
AirballRenderer.prototype.getDest = function() {

    var dest = ImageRenderer.prototype.getDest.call(this);

    return dest.swell(Airball.respiration);
}
