
/**
 * チュートリアル用の画像を表示する実行素子。
 * 引数で指定された画像(チュートリアルチップ)をタップされるたびに切り替えて表示し、最後の画像を表示し終えたら親の tutorialFinished() を呼ぶ。
 *
 * @param   チュートリアルチップ画像の配列。
 */
function TutorialExecutant(tips) {
    Executant.call(this);

    this.tips = tips;

    // 現在表示中のチップのインデックス。
    this.tipNo = 0;

    // 表示レイヤの設定。
    this.layer = Main.UI;

    // レンダラを作成。
    this.renderer = new AlphaRenderer(new ImageRenderer());
    this.behaviors.set(this.renderer, "renderer");

    // チップを表示する時のアルファをツイーン出来るようにする。
    this.appearer = new TweenBehavior("renderer.alpha", +1.0, 1000, new StopPolator());
    this.behaviors.set(this.appearer, "tween");

    // 画面中央に配置するようにする。
    this.behaviors.set(new ImageBody(), "body");
    this.behaviors.set(new PositionAnchor(), "anchor");

    // 画面全体に対するタップに反応できるようにする。
    this.behaviors.set(new WholeInteractor(), "interactor");

    // 最初のチップを表示。
    this.refreshTip();
}

TutorialExecutant.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 tipNo で示されているチップを表示する。
 */
TutorialExecutant.prototype.refreshTip = function() {

    // レンダラで描画する画像を示されたチップに変更。
    this.renderer.matter.setImage( this.tips[this.tipNo] );

    // 透明状態からツイーンで出現するようにする。
    this.renderer.alpha = 0.0;
    this.appearer.reset();
}

//---------------------------------------------------------------------------------------------------------
/**
 * タップされたら呼ばれる。
 * ※BGMのトリガーにもなるので、tap() ではなく hand() を使う必要がある。
 */
TutorialExecutant.prototype.hand = function(pos) {

    // 最後のチップを表示している場合は...
    if(this.tipNo == this.tips.length - 1) {

        // チップを非表示にして親の tutorialFinished() を呼ぶ。
        this.parent.tutorialFinished();
        return;
    }

    // まだ最後のチップでないなら、次のチップを表示する。
    this.tipNo++;
    this.refreshTip();
}
