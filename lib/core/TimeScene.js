
/**
 * リアルの時間経過と共に自律的にフレームを更新していくシーンを表す。GlassScene から派生している。
 *
 * @param   描画対象となる <canvas> 要素かそのid値。
 */
function TimeScene(canvas) {
    GlassScene.call(this, canvas);

    // 最大フレームレート。
    // ポーリング間隔が12～20msなので、20～80fps をセットしていると、実際が思いのほか下がる可能性がある。
    this.framerate = 120;

    // 最小フレームレート。実際のフレームレートがこの値を下回るとスローになる。
    this.minrate = 10;

    // 初期化したかどうか。
    this.initialized = false;

    // 動作中かどうか。
    this.playing = false;

    // poll() のthisを固定した関数を取得。コールバックで使う。
    this.bindedPoll = this.poll.bind(this);

    // 派生クラスに必要なリソースをロードさせる。
    this.requireResources();

    // リソースのロード終了時に loadCompleted() が呼ばれるようにする。
    Resources.onComplete.register(this.loadCompleted.bind(this), true);
    Resources.loadDummy();
}

TimeScene.prototype = Object.create(GlassScene.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * このシーンに必要な画像などのリソースがある場合はこのメソッドをオーバーライドして、Resources.load() など
 * で登録しておく。
 */
TimeScene.prototype.requireResources = function() {
}

//---------------------------------------------------------------------------------------------------------
/**
 * リソースのロードが完了したら呼ばれる。
 */
TimeScene.prototype.loadCompleted = function() {

    // 初期化。
    this.initializeScene();
    this.initialized = true

    // 開始する。
    this.start();
}

//---------------------------------------------------------------------------------------------------------
/**
 * リソースロードの完了後、最初のstart()前に呼ばれる。必要なら派生クラスでオーバーライドする。
 */
TimeScene.prototype.initializeScene = function() {
}

//---------------------------------------------------------------------------------------------------------
/**
 * 進行を開始・続行する。
 * requireResources() で定義しているリソースが読み込まれたら自動的に呼ばれる。自動スタートしたくない場合は、
 * TimeSceneコンストラクタを呼んだ後に stop() しておくと良い。
 */
TimeScene.prototype.start = function() {

    // まだ初期化されていない、あるいはもう開始されているなら何もしない。
    if(!this.initialized  ||  this.playing)
        return;

    // フラグ等を更新して次のウィンドウ更新時を待つ。
    this.playing = true;
    this.now = performance.now();
    window.requestAnimationFrame(this.bindedPoll);
}

//---------------------------------------------------------------------------------------------------
/**
 * 停止する。
 */
TimeScene.prototype.stop = function() {

    this.playing = false;
}

//---------------------------------------------------------------------------------------------------
/**
 * requestAnimationFrame() などで定期的にコールされる。
 *
 * @param   現在のタイムスタンプ。
 */
TimeScene.prototype.poll = function(timestamp) {

    // 停止中なら何もしない。
    if(!this.playing)
        return;

    // 次のポーリングを依頼しておく。
    window.requestAnimationFrame(this.bindedPoll);

    // 最大フレームレートにおける1フレームあたりの時間が、前回実行から経過しているなら処理する。
    if(this.now + TimeScene.getFrameTime(this.framerate) <= timestamp)
        this.tick(timestamp);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された値を現在時間(ms)として、新しいフレームを一つ刻む。
 *
 * @param   現在のタイムスタンプ。省略した場合は時間を進めずにフレームを再描画する(frame() のコールと等価)。
 */
TimeScene.prototype.tick = function(timestamp) {

    // 引数省略時は時間を進めない。
    if(timestamp == undefined)
        timestamp = this.now;

    // 経過時間を取得。ただし、最低フレームレートで求められる以上の時間を経過させない。
    var delta = Math.min( timestamp - this.now, TimeScene.getFrameTime(this.minrate) );

    // 現在のタイムスタンプを更新。
    this.now = timestamp;

    // 経過時間とともにフレームを処理する。
    this.frame(delta);
}

// staticメンバ
//=========================================================================================================

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたFPSにおける、1フレームあたりの時間を返す。
 *
 * @param   フレームレート。
 * @return  1フレームあたりの時間(ミリ秒)
 */
TimeScene.getFrameTime = function(fps) {

    return Math.floor(1000 / fps);
}
