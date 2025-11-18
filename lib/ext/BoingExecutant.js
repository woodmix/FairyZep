
/**
 * 描画スケールを拡大・縮小することでリアクションを表現するExecutant。
 */
function BoingExecutant() {
    Executant.call(this);

    // リアクションを行うビヘイバを作成。
    // リアクションはレンダラの描画スケールを拡大・縮小することで行う。拡大率は、正弦波を上下反転して
    // 一周半した曲線をリニアに減衰させて生成する。
    //            ┌─┐
    //      0---  │  │  ┌─
    //            │  └─┘
    //          ─┘
    //  …て感じ。
    //  とりあえずX軸に対するものを作成。
    var polator = new DecayPolator(new RunPolator(new SinPolator(), 0.666) );
    this.reactionX = new TweenBehavior("scale.x", -0.3, 300, polator);
    this.reactionX.autoremove = true;

    // それをクローンしてY軸版を作成。
    this.reactionY = this.reactionX.clone();
    this.reactionY.target = "scale.y";
};

BoingExecutant.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * リアクションを再生する。
 */
BoingExecutant.prototype.boing = function() {

    // リアクションをリセット。
    this.scale.set(Point.one);
    this.behaviors.bid("set", this.reactionX, "reactorX");
    this.behaviors.bid("set", this.reactionY, "reactorY");
}
