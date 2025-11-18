/**
 * ビヘイバーの基底とその他のビヘイバを収めたファイル。
 */

//=========================================================================================================
/**
 * ビヘイバーの基底。
 * ビヘイバーとはExecutantの振る舞いを抜き出したもの。ビヘイバを切り替えたり追加したりすることで、
 * Executantはその性質を選択したり変化したりすることができる。
 */
function Behavior() {

    // 宿主のExecutant。
    this.host = undefined;
}

//---------------------------------------------------------------------------------------------------------
/**
 * ホストにアタッチ・デタッチされたときに呼ばれる。
 *
 * @param   宿主となるExecutant。デタッチされた場合はnull。
 */
Behavior.prototype.attached = function(host) {

    this.host = host
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとのスタンドフェーズで呼ばれる。
 * まだ未実装。不要かなと…
 */
Behavior.prototype.before = function() {
}

//---------------------------------------------------------------------------------------------------------
/**
 * needReset() を呼んだ後、最初にbehave()が呼ばれるタイミングで呼ばれる。
 * このタイミングではbehave()は呼ばれないので注意。必要な場合は手動で呼ぶ必要がある。
 */
Behavior.prototype.reset = function() {
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとのアップデートフェーズで呼ばれる。
 * Behavior.needReset() を適用しておくと初回だけはbehaveの代わりにresetを呼ぶようにも設定できる。
 *
 * @param   前回フレームからの経過時間(ms)。
 */
Behavior.prototype.behave = function(delta) {
}

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとのステイフェーズで呼ばれる。
 */
Behavior.prototype.after = function() {
}

//---------------------------------------------------------------------------------------------------------
/**
 * 次のbehaveの呼び出しをresetに変更する。
 */
Behavior.prototype.needReset = function() {

    this.behave = Behavior.resetCaller;
}

/**
 * resetをコールするために一時的に behave() を乗っ取る関数。
 */
Behavior.resetCaller = function(delta) {

    delete this.behave;

    this.reset();
}

//=========================================================================================================
/**
 * 基本的に引数に指定されたビヘイバに処理を委譲するが、一部の処理に干渉するビヘイバの基底。
 */
function WrapperBehavior(matter) {
    Behavior.call(this);

    this.matter = matter;
}

WrapperBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
WrapperBehavior.prototype.attached = function(host) {
    Behavior.prototype.attached.call(this, host);
    this.matter.attached(host);
}

WrapperBehavior.prototype.before = function() {
    this.matter.before();
}

WrapperBehavior.prototype.reset = function() {
    this.matter.reset();
}

WrapperBehavior.prototype.behave = function(delta) {
    this.matter.behave(delta);
}

WrapperBehavior.prototype.after = function() {
    this.matter.after();
}

WrapperBehavior.prototype.prop = function(name, value) {

    if(name in this)
        return Object.prototype.prop.call(this, name, value);
    else
        return this.matter.prop(name, value);
}


//=========================================================================================================
/**
 * セットされた時間が経過するのを監視するビヘイバ。
 * 時間が経過したらonTimeoutというキーで持っている関数をコールバックする。
 *
 * @param   経過したことを知りたい時間(ミリ秒)
 */
function TimerBehavior(time) {
    Behavior.call(this);

    // 残存時間。
    this.time = time;

    // 時間が経過したらコールバックされる。
    this.onTimeout = undefined;
}

TimerBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * updateごとに呼ばれる。
 */
TimerBehavior.prototype.behave = function(delta) {

    this.time -= delta;

    // 指定された時間が経過したら…
    if(this.time <= 0) {

        // 残存時間を NaN とすることによって、つぎの behave() で起動しないようにすると共に、すでに経過済み
        // であることが分かるようにする。
        this.time = NaN;

        // コールバックがセットされているならコールする。
        if(this.onTimeout)
            this.onTimeout();
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * タイムアウトしているかどうか。
 */
TimerBehavior.prototype.isTimeout = function() {

    return isNaN(this.time);
}


//=========================================================================================================
/**
 * 引数で指定された補間器を使って、宿主の特定の値に対してトゥイーンを行うビヘイバ。
 * フレームごとに補間器が返す値の変化量を適用するので、外部要因でその値を動かしてもちゃんと引き継がれる。
 *
 * @param   変化させたい値の記述。たとえば position.x を変化させたいなら "position.x" と指定する。
 * @param   移動方向・距離。マイナス方向に移動するならマイナスで指定する。
 * @param   0.0-1.0 を何ミリ秒としてトゥイーンするか。
 * @param   参照する補間器。省略時は LinearPolator を使う。
 */
function TweenBehavior(target, distance, duration, polator) {
    Behavior.call(this);

    this.target = target;
    this.distance = distance;
    this.duration = duration;
    this.polator = polator || new LinearPolator();

    // 指定された時間が経過したら自動的に終了する場合は true に設定する。
    this.autoremove = false;

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    this.needReset();
}

TweenBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 宿主にアタッチ・デタッチされたら呼ばれる。
 */
TweenBehavior.prototype.attached = function(host) {
    Behavior.prototype.attached.call(this, host);

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    if(host)
        this.needReset();
}

//---------------------------------------------------------------------------------------------------------
/**
 * アタッチされて最初のアップデートフェーズで呼ばれる。
 * 必要な値をリセットする。
 */
TweenBehavior.prototype.reset = function() {

    // 経過した時間。
    this.passed = 0;

    // 前回の値。
    this.previous = this.polator.get(0.0);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
TweenBehavior.prototype.behave = function(delta) {

    // 経過時間を更新して、進捗率を得る。
    this.passed += delta;
    var prog = this.passed / this.duration;

    // 自動削除が有効な場合に進捗率が 1.0 に到達したら、自らを宿主から削除する。また、最後の進捗率を 1.0 に
    // 揃える。
    if(this.autoremove  &&  prog >= 1.0) {
        this.host.behaviors.bid("remove", this);
        prog = 1.0;
    }

    // 新しい補間点を得る。
    var value = this.polator.get(prog) * this.distance;

    // 変化量を取得した後、前回の補間点として取っておく。
    var change = value - this.previous;
    this.previous = value;

    // 変化対象の値に適用。
    this.host.route(this.target, change, "+");
}
