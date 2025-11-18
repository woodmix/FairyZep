
/**
 * 背景の雲を管理するExecutant。ClockMistantから派生する。
 * layer は決めてもらう必要がある。
 *
 * @param   山を表すExecutant。山のY座標が必要になるため。
 * @param   近景なら "near"、遠景なら "far" を指定する。
 * @param   背景のスクロールスピード(px/ms)
 */
function Clouds(mountain, depth, speed) {

    // 雲と雲の間の距離と、それとスクロールスピードから計算される発生間隔を取得。
    var distance = Cloud.MAX_WIDTH + 200;
    var interval = distance / speed;

    // 雲の生成を管理するクロックを作成。発生間隔±5秒のランダムにする。
    var clock = new Clocker(FuzzyValue.fuzz(interval, 5000));

    // 基底コンストラクタの呼び出し。
    ClockMistant.call(this, null, clock);

    // 引数で指定された山を保持する。
    this.mountain = mountain;

    // 使用する雲の画像を決定。
    this.images = (depth == "near") ? ["cloud_l", "cloud_m", "cloud_s"] : ["cloud_far"];

    // レイヤー番号を設定。
    this.layer = Main[depth.toUpperCase() + "_CLOUDS"];

    // 雲が発生するX位置は、画面の左端からどのくらいの距離か。
    this.startX = Main.DISPLAY_WIDTH + Cloud.MAX_WIDTH/2;

    // 最初の雲を作成しておく。
    for(var x = this.startX ; x > 0 ; x -= distance) {
        var cloud = this.generate();
        cloud.position.x = x;
        this.add(cloud);
    }
};

Clouds.prototype = Object.create(ClockMistant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * パーティクルを生成するときに呼ばれる。
 */
Clouds.prototype.generate = function() {

    // 雲の大きさをランダムで決定。
    var image = this.images.random();

    // 雲を作成。
    var cloud = new Cloud(image);

    // X座標を最大画面幅の右端とする。
    cloud.position.x = (this.parent ? -this.parent.position.x : 0) + this.startX;

    // Y座標を 0 から山の頂上位置とする。雲は、座標を中心として描画されるので、半分は画面外に出たり山に
    // かかったりする。
    cloud.position.y = Math.randomRange(0, this.mountain.position.y);

    return cloud;
}


//=========================================================================================================
/**
 * 一つの雲を表すパーティクル。
 */
function Cloud(image) {
    ImageParticle.call(this, image);
}

Cloud.prototype = Object.create(ImageParticle.prototype);

//---------------------------------------------------------------------------------------------------------

// 最も大きな雲の幅。
Cloud.MAX_WIDTH = 800;

//---------------------------------------------------------------------------------------------------------
/**
 * 画面の左側へ出るまでを寿命とする。
 */
Cloud.prototype.flow = function(delta) {

    return -this.mist.parent.position.x < this.position.x + Cloud.MAX_WIDTH/2;
}
