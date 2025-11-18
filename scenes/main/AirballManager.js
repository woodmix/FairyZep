
/**
 * 風船の管理を行うExecutant。このExecutant自体は、ステージ内に実体を持つものではない。
 */
function AirballManager() {
    Executant.call(this);

    // 使用せずに控えになっている風船Executantの配列。
    this.benches = [];

    // 現在配置されている風船の配列。アクセサ関数を解禁すれば必要なくなるのだが...
    this.launches = [];

    // 現在までに何個の風船を配置したか。
    this.count = 0;

    // 定義風船を何番目の要素まで配置したか。
    this.cursor = 0;

    // 控えを作成する。
    for(var i = 0 ; i < AirballManager.BALL_MAX ; i++)
        this.benches.push( new Airball() );
}

AirballManager.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------

// 風船の最大個数
AirballManager.BALL_MAX = 100;

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された位置に風船を新規配置する。すでに最大個数配置している場合は何もしない。
 *
 * @param   配置座標を表すPointインスタンス。
 */
AirballManager.prototype.launchBall = function(pos) {

    // 控え風船を一つ取り出す。
    var ball = this.benches.pop();

    // 座標をセットして子供として追加。
    if(ball) {
        ball.position = pos;
        this.childs.bid("set", ball, "ball" + this.count++);
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された風船をステージから回収する。
 *
 * @param   回収する風船インスタンス。
 */
AirballManager.prototype.collectBall = function(ball) {

    this.childs.bid("remove", ball);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 子Executantが操作されたら呼ばれる。benches, launches を適切に管理する。
 */
AirballManager.prototype.childsOperated = function(name, outof, into) {
    Executant.prototype.childsOperated.call(this, name, outof, into);

    if(outof) {
        this.launches.pop( this.launches.search(outof) );
        this.benches.push(outof);
    }

    if(into)
        this.launches.push(into);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 毎フレーム実行される。
 */
AirballManager.prototype.update = function(scene) {

    // カメラに映っている領域を取得。
    var camera = scene.behaviors.need("body").getRect();
    camera = this.takeCoord(camera, scene).normalize();

    // まだ未配置の定義風船があるなら配置していく。
    while( this.cursor < Plot.pins.length  &&  Plot.pins[ this.cursor ].x < camera.right() ) {

        var pos = Plot.pins[ this.cursor ];

        if(pos.y == -1)
            pos.y = Math.randomInt(50, MainStage.HEIGHT - 50);

        this.launchBall(pos);

        this.cursor++;
    }

    // 配置風船がある場合は...
    if(this.launches.length > 0) {

        // 画面左側より外へ適当な距離離れた風船を回収する。
        // 挙動を考えるとlaunches[0]が一番先に配置された風船なのでこれのみをチェック・処理する。
        if(this.launches[0].position.x < camera.left() - 200)
            this.collectBall(this.launches[0]);
    }

    // 風船の膨らみ幅を管理する。
    Airball.bounceRespiration(scene);
}
