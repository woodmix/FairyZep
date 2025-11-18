
/**
 * 終了後背景を管理するExecutant。
 */
function Grassland() {
    Executant.call(this);

    this.layer = Main.BACK_EFFECT;

    // ボディは画面に映る領域。
    this.behaviors.set(new CanvasBody(), "body");

    // ボディ中央に文字列を表示する。
    var renderer = new TextRenderer('"Courier New", monospace', 36, "white");
    renderer.halign = "center";
    renderer.valign = "middle";
    this.behaviors.set(renderer, "renderer");

    // 表示する文字列
    this.text = "Thank you for playing\ntap to reset";

    // UIイベントを取れるようにする。
    this.behaviors.set(new InteractBehavior(), "interactor");
};

Grassland.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * タップされたらリロードするようにする。
 */
Grassland.prototype.tap = function(pos) {

    location.reload();
}
