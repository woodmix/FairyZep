
/**
 * メインシーンを管理する。
 */
function Main(canvasId) {
    EngageScene.call(this, canvasId);
};

Main.prototype = Object.create(EngageScene.prototype);

//---------------------------------------------------------------------------------------------------

// メインシーンで使われているレイヤー番号
Main.SKYBOX = 0;            // 空
Main.FAR_MOUNTAIN = 1;      // 遠景(山)
Main.FAR_CLOUDS = 2;        // 遠景(雲)
Main.NEAR_CLOUDS = 3;       // 近景(雲)
Main.NEAR_MOUNTAIN = 4;     // 近景(山)
Main.BACK_EFFECT = 5;       // 背景エフェクト
Main.ZEP = 6;               // 自機・風船・光跡
Main.UI = 7;                // UI・星
// Main.OVERLAY = 6;           // その他最前面

// 画面最大幅
Main.DISPLAY_WIDTH = 1920*2;

//---------------------------------------------------------------------------------------------------
/**
 * 外部変数 Settings からリソースを読み取ってロード開始する。
 */
Main.prototype.requireResources = function() {

    Resources.load("arts/graphs/tutorial/tuto1.png");
    Resources.load("arts/graphs/tutorial/tuto2.png");

    Resources.load("arts/graphs/cloud/cloud_far.png");
    Resources.load("arts/graphs/cloud/cloud_l.png");
    Resources.load("arts/graphs/cloud/cloud_m.png");
    Resources.load("arts/graphs/cloud/cloud_s.png");
    Resources.load("arts/graphs/mountain/mount_far.png");
    Resources.load("arts/graphs/mountain/mount_near.png");
    Resources.load("arts/graphs/zep/zep_gondola.png");
    Resources.load("arts/graphs/zep/zep_balloon.png");
    Resources.load("arts/graphs/numbers.png");
    Resources.load("arts/graphs/airball.png");
    Resources.load("arts/graphs/star.png");

    Resources.load("arts/musics/bgm.mp3");

    Resources.load("arts/sounds/catch.wav");
    Resources.load("arts/sounds/charge.wav");
    Resources.load("arts/sounds/levitate.wav");
}

//---------------------------------------------------------------------------------------------------
/**
 * 初期化する。
 */
Main.prototype.initializeScene = function() {

    // 最背景としてレイヤ番号を設定。
    this.layer = Main.SKYBOX;

    // 最背景を空グラデーションで塗りつぶすようにする。
    var grad  = this.context.createLinearGradient(0, 0, 0, 800*2);
    grad.addColorStop(0, "dodgerblue")
    grad.addColorStop(1, "paleturquoise");
    this.renderer = new FillRenderer(grad);
    this.behaviors.set(this.renderer, "renderer");

    // チューターを追加。
    var tutor = new TutorialExecutant(["tuto1", "tuto2"]);
    this.childs.set(tutor, "tutor");

    // ステージがまだ継続中かどうか。
    this.alive = true;

    // デバッグモードならパフォーマンスメーターを追加。
    if(Settings["debug"])
        this.childs.set(new DebugInfo(), "info");
}

//---------------------------------------------------------------------------------------------------
/**
 * チュートリアルが終わったら呼ばれる。UIイベントのハンドラないでコールされるのでBGMの開始が出来る。
 */
Main.prototype.tutorialFinished = function() {

    // チューターを削除。
    this.childs.bid("destroy", "tutor");

    // 自機や風船が所属するメインステージ。
    var stage = new MainStage();
    this.childs.set(stage, "stage");

    // 近景。
    var near = new Background(stage, "near");
    this.childs.set(near, "near");

    // 遠景。
    var far = new Background(stage, "far");
    this.childs.set(far, "far");

    // スコア
    this.scorer = new Scorer();
    this.scorer.behaviors.set(new EdgeAnchor("right", this, "right", -30), "anchor_x");
    this.scorer.behaviors.set(new EdgeAnchor("top", this, "top", 30), "anchor_y");
    this.childs.set(this.scorer, "scorer");

    // 星
    this.starm = new StarManager();
    this.childs.set(this.starm, "starm");

    // 光跡
    this.trackm = new TrackManager();
    this.childs.set(this.trackm, "trackm");

    // 終了時に必要になる子供を作成だけしておく。
    this.finisher = new Finisher();
    this.grassland = new Grassland();

    // BGM開始。
    AudioSequencer.play("bgm");
}

//---------------------------------------------------------------------------------------------------
/**
 * 指定された座標にスコア獲得情報を表示する。
 *
 * @param   表示する座標。
 * @param   スコア値。
 */
Main.prototype.setScoreDisplay = function(position, score) {

    var disp = new ScoreDisplayer(score);
    disp.position = position;
    this.childs.bid("set", disp);
}

//---------------------------------------------------------------------------------------------------
/**
 * ステージが終了間近の update() のたびに呼ばれる。
 */
Main.prototype.onFinishingUpdate = function() {

    if( !this.alive )
        return;

    this.alive = false;

    // フィニッシャーを有効化する。
    this.childs.set(this.finisher, "finisher");
}

//---------------------------------------------------------------------------------------------------
/**
 * ステージが終了した後の update() のたびに呼ばれる。
 */
Main.prototype.onFinishingComplete = function() {

    // 不要になった子供を削除。
    this.childs.remove("stage");
    this.childs.remove("near");
    this.childs.remove("far");
    this.childs.remove("finisher");

    // 背景塗りつぶし色を黒に。
    this.renderer.style = "black";

    // 終了後表示を有効化。
    this.childs.set(this.grassland, "grassland");
}

//---------------------------------------------------------------------------------------------------
Main.prototype.test = function() {

    var zep = this.getChild("stage/zep");
    this.getChild("stage/balls").launchBall(new Point(zep.position.x + 500, 1000));
}
