
/**
 * 背景を管理するExecutant。
 *
 * @param   メインステージを管理するExecutant。
 * @param   近景なら "near"、遠景なら "far" を指定する。
 */
function Background(stage, depth) {
    Executant.call(this);

    // メインステージを参照するのでメンバ変数に取っておく。
    this.stage = stage;

    // X軸方向スクロール速度を取得。
    this.gap = Background[depth.toUpperCase() + "_GAP"];

    // 山を追加。
    var height = MainStage.HEIGHT - (depth == "near" ? 0 : -300);
    var mountain = new Mountain(depth, height);
    this.childs.set(mountain, "mountain");

    // 雲を追加。
    var clouds = new Clouds(mountain, depth, Zep.SCROLL_SPEED/1000 * this.gap);
    this.childs.set(clouds, "clouds");
};

Background.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------

// スクロールスピード(自機の移動速度)に対する近景・遠景のスピード割合。
Background.NEAR_GAP = 0.5;
Background.FAR_GAP = 0.2;

// 背景の高さ。
Background.NEAR_HEIGHT = 1024*2;
Background.FAR_HEIGHT =   900*2;

//---------------------------------------------------------------------------------------------------------
/**
 * アップデート時...
 */
Background.prototype.update = function(scene) {

    // 横スクロール位置をメインステージに合わせる。
    this.position.x = this.stage.position.x * this.gap;

    // あとは、縦の位置を決めていく。
    // カメラがステージ中央にあるときステージと背景の中央が一致するとして、「ステージがそこからどのくらいスクロールして
    // いるか」から背景のスクロール量を決める。

    // sg:スクロールギャップ
    // Hc:カメラ高さ       Hs:ステージ高さ
    // Ys:中央位置を 0 とする座標系での、ステージの中央位置    Yb:同、背景の中央位置
    // RYs:実際の座標系におけるステージのY座標(上端の位置)     RYb:同、背景のY座標
    // とすると...
    //     Yb = Ys * sg
    // で...
    //     Ys = -RYs + Hc/2 - Hs/2
    // で...
    //     RYb = -(Hs/2 + Yb - Hc/2)
    // となる。

    // 諸元取得。
    var Hc = scene.behaviors.need("body").getRect().height();
    var Hs = MainStage.HEIGHT;
    var sg = this.gap;
    var RYs = this.stage.position.y;

    //
    var Ys = -RYs + Hc/2 - Hs/2;

    var Yb = Ys * sg;

    this.position.y = -(Hs/2 + Yb - Hc/2);
}
