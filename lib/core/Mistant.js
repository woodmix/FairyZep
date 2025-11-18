
/**
 * Executant のような高機能が必要なく、かつ大量に生成しなければならない描画素子(パーティクル)を管理する Executant。
 * Unity の ParticleSystem のようなもの。
 * depict() をオーバーライドしているのでレンダラビヘイバをセットしても無視される。
 */
function Mistant() {
    Executant.call(this);

    // 現在アクティブなパーティクルの配列。
    this.particles = [];
};

Mistant.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたパーティクルを管理対象として加える。
 *
 * @param   パーティクル。
 */
Mistant.prototype.add = function(particle) {

    particle.mist = this;
    this.particles.push(particle);
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレーム毎に呼ばれる。
 */
Mistant.prototype.update = function(scene) {

    // 全てのパーティクルに対して...
    for(var i = 0, particle ; particle = this.particles[i] ; i++) {

        // 時間経過を処理させる。残存時間が過ぎたなら削除。
        if( !particle.flow(scene.delta) )
            this.particles.pop(i--);
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 自身を描画するタイミングで呼ばれる。
 */
Mistant.prototype.depict = function(context, scene) {

    // アクティブなパーティクルを全て描画する。
    for(var i = 0, particle ; particle = this.particles[i] ; i++)
        particle.plash(context);
}


//=========================================================================================================
/**
 * パーティクルを生成するメソッドを持つ Mistant。
 *
 * @param   パーティクルクラス(コンストラクタ関数)。generate() をオーバーライドしている派生クラスでは無視される。
 *          基底では、ここに指定した関数が new で呼ばれる。コンストラクタに引数が必要な場合は bind() を
 *          使うと良い。
 */
function GushMistant(egg) {
    Mistant.call(this);

    // パーティクル生成関数。
    this.egg = egg;
};

GushMistant.prototype = Object.create(Mistant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * パーティクルを一つ生成して、管理対象として加える。
 *
 * @param   生成したパーティクル。
 */
GushMistant.prototype.increment = function() {

    var particle = this.generate();
    this.add(particle);

    return particle;
}

//---------------------------------------------------------------------------------------------------------
/**
 * パーティクルを一つ生成する。
 *
 * @return  生成したパーティクル。
 */
GushMistant.prototype.generate = function() {

    return new this.egg();
}


//=========================================================================================================
/**
 * 引数で指定された間隔でパーティクルを生成する Mistant。
 *
 * @param   パーティクルクラス(コンストラクタ関数)。generate() をオーバーライドしている派生クラスでは無視される。
 *          基底では、ここに指定した関数が new で呼ばれる。コンストラクタに引数が必要な場合は bind() を
 *          使うと良い。
 * @param   パーティクルの生成間隔を管理する Clocker インスタンス。
 */
function ClockMistant(egg, clock) {
    GushMistant.call(this, egg);

    // 指定された Clocker インスタンスを保持。クロックタイミングで clocked() が呼ばれるようにする。
    if(clock)
        this.setClock(clock);
};

ClockMistant.prototype = Object.create(GushMistant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * パーティクルの生成間隔を管理する Clocker インスタンスをセットする。
 *
 * @param   Clocker インスタンス。
 */
ClockMistant.prototype.setClock = function(clock) {

    clock.onclock = this.clocked.bind(this);
    this.clock = clock;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 生成タイミングが来たら呼ばれる。
 *
 * @param   超過時間(ms)。
 */
ClockMistant.prototype.clocked = function(excess) {

    // パーティクルを一つ生成。
    var generated = this.increment();

    // 超過時間を適用しておく。
    if( !generated.flow(excess) )
        this.particles.pop();
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレーム毎に呼ばれる。
 */
ClockMistant.prototype.update = function(scene) {
    GushMistant.prototype.update.call(this, scene);

    // パーティクル生成クロックを管理する。クロックが来た場合は create() が呼ばれる。
    if(this.clock)
        this.clock.time(scene.delta);
}
