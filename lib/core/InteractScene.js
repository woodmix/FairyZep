
/**
 * ユーザイベント、環境イベントも処理するシーン。TimeSceneから派生する。
 * このシーンや子Executantは、自身の "interactor" ビヘイバを通じてUIについてのイベントを処理できる
 * ようになる。
 *
 * イベントはまだタップとドラッグしか取れない。他のイベントが必要になったときのメモ…
 *      ロングタップ    発生する瞬間はタッチエンドではなくタッチ中なので、いろいろ工夫が必要になるだろう。
 *      スワイプ        ドラッグの移動量積算が閾値を超えたら…というものだが、基板の実装でその閾値は
 *                      決められない。結局ドラッグと変わらなくなる。Executantの派生で別途定義するなど
 *                      したほうが良いだろう。
 *      フリック        「途中までドラッグしてそこからフリック」とかの可能性もあるので、「厳密には閾値を
 *                      超える速さのドラッグが発生して、かつ、それからタッチエンドまでの時間が一定値以下」
 *                      となる。まあ必要になったらそのときに実装かな…
 *
 * @param   描画対象となる <canvas> 要素のid値。
 */
function InteractScene(canvasId) {
    TimeScene.call(this, canvasId);

    // ウィンドウが可視状態かどうか。
    this.activated = true;

    // タッチ開始された時間と座標。
    this.touchTime = 0;
    this.begin = null;

    // 現在のタップイベントとドラッグイベントを受け取るExecutant。
    this.tapAnt = null;
    this.dragAnt = null;

    // ドラッグと判定したかどうか。
    this.dragged = false;

    // ドラッグ処理中、直前の検出時のマウス位置。
    this.follow = null;

    // 次のupdateで発火するイベント。
    this.bullet = null;

    // タッチ関連のイベントリスナを処理する。
    // スマホだとマウスイベントは300msの遅延があるので、ちゃんとタッチ系を取らなければならない。
    // それは良いとして、どちらかのみを取得していると、今度はタッチ付きPCディスプレイでのタッチがマウスイベントを発火しないという問題に当たる。
    // 遅延がなくなればマウス系のイベントだけを処理していれば良い(Androidは <meta name="viewport"> があると遅延がなくなるらしい)のだが…
    // それまでは結局両方リッスンする必要がある。
    // このままだとスマホでは一度のタッチで二回イベント処理することになるが、preventDefault() するので重複分は発行されない。
    var $canvas = $(this.canvas);
    $canvas.on("touchstart mousedown", this.touchstart.bind(this));
    $canvas.on("touchend mouseup", this.touchend.bind(this));
    $canvas.on("touchmove mousemove", this.touchmove.bind(this));

    // ウィンドウが不可視になったら停止するようにする。
    // 本来は可視状態の変更ではなくて window の blur による非アクティブ化時に行うのだが、フレームを
    // 使ってると blur は誤爆する。また、Androidのブラウザではアプリ切り替えでは onblur が発生しない
    // 模様。タブ切り替えでは発生するのだが…
    $(window).on("visibilitychange", this.visibilityChanged.bind(this));
}

InteractScene.prototype = Object.create(TimeScene.prototype);


// スタート・ストップ関連
//=========================================================================================================

//---------------------------------------------------------------------------------------------------------
/**
 * スタート・ストップするときに音も一緒に止まるようにする。
 */
InteractScene.prototype.start = function() {

    AudioSequencer.continue();
    TimeScene.prototype.start.call(this);
}

InteractScene.prototype.stop = function() {

    AudioSequencer.pause();
    TimeScene.prototype.stop.call(this);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ウィンドウの可視状態が変化したら呼ばれる。
 */
InteractScene.prototype.visibilityChanged = function() {

    // 可視になったときは何もしない。
    if(!document.hidden)
        return;

    // 停止する。
    this.stop();

    // 不可視によって停止したことを覚えておく。
    this.activated = false;
}


// タッチイベント関連
//=========================================================================================================

//---------------------------------------------------------------------------------------------------------
/**
 * タッチ開始・ボタン押下時にコールされる。
 */
InteractScene.prototype.touchstart = function(event) {

    // 不可視イベントによって停止している場合は再開する。
    if(!this.activated) {
        this.activated = true;
        this.start();           // ここで音が再開される。「touchstartじゃ駄目なんじゃね？」と思うとこなのだが、再開なら問題ないらしい。
        this.follow = null;
        event.preventDefault();
        return;
    }

    // 動作中のみ処理する。
    if(!this.playing)
        return;

    // event.offsetX,Y を確実に使えるようにする。
    if(event["offsetX"] == undefined) {
        var finger = event.originalEvent.touches[0];
        event.offsetX = finger.clientX - finger.target.offsetLeft;
        event.offsetY = finger.clientY - finger.target.offsetTop;
    }

    // イベント関連情報初期化。
    this.dragged = false;
    this.begin = new Point(event.offsetX, event.offsetY);
    this.follow = this.begin.clone();
    this.touchTime = performance.now();
    this.bullet = null;

    // タッチイベントを処理して反応を取得する。
    var touch = InteractScene.processTouch( this, this.begin.clone().multi(this.getCanvasRatio()) );

    // タップイベントとドラッグイベントを受け取るExecutantを保持しておく。
    this.tapAnt = touch.tap;
    this.dragAnt = touch.drag;

    // 反応するExecutantがあるならブラウザのタッチ挙動をキャンセルする。
    // これをやらないとブラウザがタッチを処理して(スクロールとか領域のライトアップとか)、touchmoveも発生しなくなる。
    if(touch.processed  ||  this.tapAnt  ||  this.dragAnt)
        event.preventDefault();

    // 反応するExecutantがない場合は preventDefault() せずにスクロール等をできるようにする。
    // スマホではタッチ系とマウス系でイベント重複するが、誰も反応しないから問題ない。
}

//---------------------------------------------------------------------------------------------------------
/**
 * タッチ終了・ボタン解放時にコールされる。
 */
InteractScene.prototype.touchend = function(event) {

    // 動作中のみ処理する。
    if(!this.playing)
        return;

    // ドラッグ判定されておらず、タッチ開始から終了までの時間が規定以内ならタップイベントを発行する。
    if(!this.dragged  &&  performance.now() - this.touchTime < 750) {

        this.bullet = {"type":"tap"};

        // handイベントを実行する。
        if(this.tapAnt) {
            var bullet = {
                type: "hand",
                begin: this.tapAnt.localCoord( this.begin.clone().multi(this.getCanvasRatio()) ),
            };
            this.tapAnt.behaviors.get("interactor").interact(bullet);
        }
    }

    // 後続のtouchmove(mousemove)が処理されないようにする。
    this.touchTime = 0;
}

//---------------------------------------------------------------------------------------------------------
/**
 * タッチ移動・マウス移動時にコールされる。マウス移動ではボタン押下していなくても呼ばれるので注意。
 */
InteractScene.prototype.touchmove = function(event) {

    // 動作中のみ処理する。
    if(!this.playing)
        return;

    // 押下中のもののみを処理する。
    if(this.touchTime == 0)
        return;

    // event.offsetX,Y を確実に使えるようにする。
    if(event["offsetX"] == undefined) {
        var finger = event.originalEvent.touches[0];
        event.offsetX = finger.clientX - finger.target.offsetLeft;
        event.offsetY = finger.clientY - finger.target.offsetTop;
    }

    // まだドラッグ判定されておらず…
    if(!this.dragged) {

        // 移動量が規定範囲から出ていない場合は処理しない。
        if( this.follow.axisdist(new Point(event.offsetX, event.offsetY)) < 10 )
            return;
    }

    // ここまで来たらドラッグ処理。
    this.dragged = true;

    // 前回検出からの移動量を取得。
    var move = new Point(event.offsetX - this.follow.x, event.offsetY - this.follow.y);
    this.follow.set(event.offsetX, event.offsetY);

    // ドラッグイベントを発行。ただし、すでに待機している場合は統合する。
    if(this.bullet  &&  this.bullet.type == "drag")
        this.bullet.move.add(move);
    else
        this.bullet = {"type":"drag", "move":move};
}

//---------------------------------------------------------------------------------------------------------
/**
 * update時、待機しているイベントがある場合は処理する。
 */
InteractScene.prototype.update = function(scene) {
    TimeScene.prototype.update.call(this, scene);

    // 待機しているイベントがない場合は何もしない。
    if(!this.bullet)
        return;

    // イベントの種別に応じて、それを処理するExecutantを取得。
    switch(this.bullet.type) {
        case "tap":
            var ant = this.tapAnt;
            break;
        case "drag":
            var ant = this.dragAnt;
            break;
    }

    // 処理するExecutantがいるなら...
    if(ant  &&  ant.behaviors.get("interactor")) {

        // タッチスタートした座標をそのExecutantの座標系に変換してイベントパラメータに追加する。
        this.bullet.begin = ant.localCoord( this.begin.clone().multi(this.getCanvasRatio()) );

        // イベントに move パラメータが付いている場合は、そのExecutantのスケールに合わせる。
        if(this.bullet.move)
            this.bullet.move = ant.localScale( this.bullet.move.multi(this.getCanvasRatio()) );

        // イベントを伝達する。
        ant.behaviors.get("interactor").interact(this.bullet);
    }

    // 待機イベントをクリア。
    this.bullet = null;
}

//---------------------------------------------------------------------------------------------------------
/**
 * staticメソッド。
 * 引数で指定されたExecutantとその子供に対して、指定された座標でのタッチイベントを処理させるとともに、
 * タップ系・ドラッグ系のイベントに誰が答えるのかを調べさせる。
 *
 * @param   処理させたいExecutant。
 * @param   タッチスタートした座標。
 * @param   内部で使用する。
 * @return  次のキーを持つオブジェクト。
 *              tap         タップ系のイベントに答えるExecutant。いない場合は null。
 *              drag        ドラッグ系のイベントに答えるExecutant。いない場合は null。
 *              processed   タッチイベントのみを処理したものがいたかどうか。
 */
InteractScene.processTouch = function(ant, point, result) {

    // 最初の呼び出しなら戻り値を初期化する。
    if(!result)
        result = {"tap":null, "drag":null, "processed":false};

    // 判定座標にpositionとscaleを反映して…
    point = ant.getCoord(point);

    // まずは指定されたExecutantに対して、インタラクションビヘイバを持っているなら調べる。
    var interactor = ant.behaviors.get("interactor");
    if(interactor) {

        // タッチイベントを処理させる。
        var interact = interactor.touch(point);

        // タップ系のイベントに答える場合は戻り値を更新。
        if(interact == "tap"  ||  interact == "all") {
            if(!result.tap  ||  result.tap.layer < ant.layer)
                result.tap = ant;
        }

        // ドラッグ系のイベントに答える場合は戻り値を更新。
        if(interact == "drag"  ||  interact == "all") {
            if(!result.drag  ||  result.drag.layer < ant.layer)
                result.drag = ant;
        }

        // タッチイベントのみを処理した場合はフラグをONにしておく。
        if(interact == "")
            result.processed = true;
    }

    // 次にその子供に対して調査していく。
    ant.childs.each(function(child){
        InteractScene.processTouch(child, point, result);
    });

    return result;
}

//---------------------------------------------------------------------------------------------------------
/**
 * CSS上での1ピクセルに対する、このキャンバスのピクセル数を返す。
 *
 * @return  X, Y 軸におけるピクセル数を表すPoint。
 */
InteractScene.prototype.getCanvasRatio = function() {

    var canvas = this.canvas;
    return new Point(canvas.width / canvas.clientWidth, canvas.height / canvas.clientHeight);
}
