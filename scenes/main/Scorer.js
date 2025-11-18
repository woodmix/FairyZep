
/**
 * 画面右上の累計スコアを表すNumberExecutant。
 */
function Scorer() {
    NumberExecutant.call(this, "numbers", new Point(1, 0));

    this.layer = Main.UI;

    // 字間をちょっと詰める。
    this.space = -10;

    // 上から表示値、目標値、現在値(float)。
    this.value = 0;
    this.score = 0;
    this.current = 0;

    //
    this.snower = new SnowMistant();
    this.childs.set(this.snower, "snower");
};

Scorer.prototype = Object.create(NumberExecutant.prototype);

//---------------------------------------------------------------------------------------------------------

// カウントスピード(pt/ms)。
Scorer.COUNT_SPEED = 1000 / 1000;

//---------------------------------------------------------------------------------------------------------
/**
 * スコアを挙げたときに呼ばれる。
 *
 * @param   既コンボ数。最初は0、次が1。
 * @return  スコア。
 */
Scorer.prototype.countScore = function(combo) {

    // スコア計算。
    var score = (combo + 1) * 100;

    // 表示に反映。
    this.score += score;

    return score;
}

//---------------------------------------------------------------------------------------------------------
/**
 *
 *
 * @param   最終コンボ数。
 */
Scorer.prototype.endSublimation = function(num) {

    this.snower.position.set( this.behaviors.need("body").getRect().center() );

    this.snower.kick(num / StarManager.STAR_MAX * 10);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
Scorer.prototype.update = function(scene) {

    // すでに目標値なら何もしない。
    if(this.current == this.score)
        return;

    // 現在値を目標値に近づける。
    this.current += Scorer.COUNT_SPEED * scene.delta;
    if(this.score < this.current)
        this.current = this.score;

    // 表示値に反映。
    this.value = Math.floor(this.current);
}
