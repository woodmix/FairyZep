
/**
 * フィニッシャーを管理するExecutant。
 */
function Finisher() {
    Executant.call(this);

    this.layer = Main.BACK_EFFECT;

    // ボディは画面に映る領域。
    this.behaviors.set(new CanvasBody(), "body");

    // レンダラはアルファで調節出来る黒塗りつぶしとする。
    var renderer = new AlphaRenderer(new FillRenderer("black"), 0.0);
    this.behaviors.set(renderer, "renderer");

    // 段々黒くなるようにツイーン。
    var tween = new TweenBehavior("behaviors.renderer.alpha", 1.0, 2000);
    tween.autoremove = true;
    this.behaviors.set(tween);
};

Finisher.prototype = Object.create(Executant.prototype);
