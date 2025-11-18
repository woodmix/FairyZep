
/**
 * 獲得したスコアを一時的に表示するNumberExecutant。
 */
function ScoreDisplayer(score) {
    NumberExecutant.call(this, "numbers");

    this.layer = Main.UI;

    // 字間をちょっと詰める。
    this.space = -20;

    // ちょっと小さめに表示。
    this.behaviors.get("body").scale.set(0.5, 0.5);

    // 表示する数字。
    this.value = score;

    // 残り表示時間。
    this.timer = ScoreDisplayer.LIFE_TIME;
};

ScoreDisplayer.prototype = Object.create(NumberExecutant.prototype);

//---------------------------------------------------------------------------------------------------------

// 何秒で消えるか。
ScoreDisplayer.LIFE_TIME = 1000;

//---------------------------------------------------------------------------------------------------------
/**
 * 時間経過で消えるようにする。
 */
ScoreDisplayer.prototype.update = function(scene) {

    this.timer -= scene.delta;
    if(this.timer <= 0)
        this.parent.childs.bid("remove", this);
}
