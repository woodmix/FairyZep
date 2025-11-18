
/**
 * スコア欄から落ちる光粒子を制御するMistant。
 */
function SnowMistant() {
    ClockMistant.call(this, SnowParticle);

    this.layer = Main.UI - 1;

    // 粒子を落とし続けるタイマー。
    this.timer = 0;
}

SnowMistant.prototype = Object.create(ClockMistant.prototype);

//---------------------------------------------------------------------------------------------------

// 粒子が降る領域の幅。
SnowMistant.DOWNFALL_WIDTH = 200;

// 粒子の粗度の基本値。低いほど濃くなる。実際にはkick()の呼び出し時にここから調整される。
SnowMistant.SPARSITY = 10;

// kick() を呼ばれてから降雪し続ける時間(ms)。
SnowMistant.DURATION_MIN = 1000;
SnowMistant.DURATION_MAX = 5000;

//---------------------------------------------------------------------------------------------------
/**
 * 粒子を追加するタイミングで呼ばれる。
 */
SnowMistant.prototype.increment = function() {

    particle = ClockMistant.prototype.increment.call(this);

    // X位置を調整する。
    particle.position.x = Math.randomRange(-SnowMistant.DOWNFALL_WIDTH/2, +SnowMistant.DOWNFALL_WIDTH/2);
    return particle;
}

//---------------------------------------------------------------------------------------------------
/**
 * 指定された密度で降雪を開始する。
 *
 * @param   密度。1から10まで。
 */
SnowMistant.prototype.kick = function(density) {

    // 与えられた密度から粗度を決定。
    var sparsity = Math.ceil(SnowMistant.SPARSITY / density);

    // 粒子生成のクロックを作成・セットする。
    var clock = new SlowdownClocker(sparsity, 0, sparsity, sparsity);
    this.setClock(clock);

    // 降雪時間をリセット。
    this.timer = Math.floor( Math.lerp(SnowMistant.DURATION_MIN, SnowMistant.DURATION_MAX, (density-1)/9) );
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレーム毎に呼ばれる。
 */
SnowMistant.prototype.update = function(scene) {
    ClockMistant.prototype.update.call(this, scene);

    // 降雪時間が終わったらクロックを削除する。
    this.timer -= scene.delta;
    if(this.timer <= 0)
        this.clock = null;
}


//=========================================================================================================
/**
 * スコア欄から落ちる一つの光粒子を表すパーティクル。
 */
function SnowParticle() {
    Particle.call(this);

    // 発生してからの時間。
    this.time = 0;
}

SnowParticle.prototype = Object.create(Particle.prototype);

//---------------------------------------------------------------------------------------------------

// 発生してから消えるまでの時間(ms)。
SnowParticle.LIFETIME = 1000;

// どのくらいの距離降下するか。
SnowParticle.DROP_DISTANCE = 150;

//---------------------------------------------------------------------------------------------------
/**
 * フレームごとに呼ばれる。
 */
SnowParticle.prototype.flow = function(delta) {
    Particle.prototype.flow.call(this, delta);

    // 発生してからの時間を更新する。
    this.time += delta;
    return this.time < SnowParticle.LIFETIME;
}

//---------------------------------------------------------------------------------------------------
/**
 * 粒子を描画する。
 */
SnowParticle.prototype.plash = function(context) {

    // 粒子の寿命がどの程度進んだかを 0.0 ～ 1.0 で取得。
    var prog = this.time / SnowParticle.LIFETIME;

    // 粒子の半径を決定。
    var radius = (1.0 - prog) * 20;

    // 粒子のY位置を決定。
    var y = prog * SnowParticle.DROP_DISTANCE;

    // 描画。
    context.beginPath();
    context.arc(this.position.x, y, radius, 0, Math.PI360);
    context.fillStyle = "white";
    context.fill();
}
