/**
 * 各種パーティクルを収めたファイル。
 */

//=========================================================================================================
/**
 * Mistant で管理する描画素子(パーティクル)の基底クラス。
 * パーティクルはExecutantの高速簡易版の位置づけなので、多くの機能が必要ならば Executant を使ったほうが良い。
 *
 * BehaviorHost から派生する。Executantとは違い、スタンドフェーズ・ステイフェーズがないため、ビヘイバの
 * before(), after() は呼ばれない。
 * 次のキーで参照されるビヘイバーには共通した意味が与えられている。
 *
 *      life    このParticleの残存期間を管理する。isTimeout() のメソッドが必要。
 *              renderers.js のTimerBehaviorなどが見本となる。
 *
 * 他にも、任意のメソッドを備えたビヘイバーを自由に定義して、任意のキーを与えて管理できる。
 *
 * ビヘイバを bid() で遅延操作した場合は次のフレームの冒頭で実行される。
 */
function Particle() {
    BehaviorHost.call(this);

    // このParticleの位置座標。
    this.position = new Point();

    // このParticleの持ち主のMistant。
    this.mist = null;
}

Particle.prototype = Object.create(BehaviorHost.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 時間の経過を処理する。
 *
 * @param   前回フレームからの経過時間(ms)。
 * @return  このパーティクルが残存しているかどうか。ライフタイムを終えたならfalseを返す。
 */
Particle.prototype.flow = function(delta) {

    // ビヘイバの処理。
    this.behaviors.act();
    this.behaviors.each(function(behavior){
        behavior.behave(delta);
    });

    // 戻り値を決める。基底としては、life ビヘイバがあるならそれを、ないならとりあえずtrueを返す。
    var life = this.behaviors.get("life");
    return life ? !life.isTimeout() : true;
}

//---------------------------------------------------------------------------------------------------------
/**
 * このパーティクルを描画する。
 *
 * @param   描画先となる CanvasRenderingContext2D
 */
Particle.prototype.plash = function(context) {
}


//=========================================================================================================
/**
 * 引数で指定されたイメージをそのまま描くパーティクル。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 */
function ImageParticle(image) {
    Particle.call(this);

    // 引数を ImagePiece インスタンスで統一する。
    if( !(image instanceof ImagePiece) )
        image = new ImagePiece(image);

    // 描画するイメージ。
    this.piece = image;
}

ImageParticle.prototype = Object.create(Particle.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * plash() の実装。
 */
ImageParticle.prototype.plash = function(context) {

    context.drawPieceC(this.piece, this.position.x, this.position.y);
}


//=========================================================================================================
/**
 * 引数で指定されたイメージで、指定されたランダムスピードで等速運動するパーティクル。
 * まだ試験段階。
 *
 * @param   描画するイメージ。Resourcesのキー名か、<img> や <canvas>、あるいは ImagePiece インスタンス。
 * @param   残存時間(ms)。FuzzyValueも可。
 * @param   速さ(px/s)。FuzzyValueも可。
 * @param   角度(ラジアン)。FuzzyValueも可。省略時は全方位。
 */
function EmissionParticle(image, lifetime, speed, angle) {
    ImageParticle.call(this, image);

    // 角度が省略されている場合は全方位。
    if(angle == undefined)
        angle = new FuzzyValue(0, Math.PI360);

    // 指定された情報で移動ビヘイバを作成してセット。
    var mover = new AngleMover( FuzzyValue.get(angle), FuzzyValue.get(speed) );
    this.behaviors.set(mover, "mover");

    // 残存時間を処理するビヘイバをセット。
    this.behaviors.set(new TimerBehavior(FuzzyValue.int(lifetime)), "life");
}

EmissionParticle.prototype = Object.create(ImageParticle.prototype);
