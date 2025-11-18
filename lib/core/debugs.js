/**
 * デバッグに使うExecutantを収めるファイル。
 */

//=========================================================================================================
/**
 * キャンバス上にグリッド線を引くExecutant。
 *
 * @param   グリッド線の間隔。省略時は100。
 */
function DebugGrid(space) {
    Executant.call(this);

    this.space = space || 100;

    this.layer = 99998;
    this.behaviors.set(new CanvasBody(), "body");

    var renderer = new Renderer();
    renderer.paint = DebugGrid.paint;
    this.behaviors.set(renderer, "renderer");
};

DebugGrid.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * this はビヘイバを指しているので注意。
 */
DebugGrid.paint = function(context, dest) {

    // グリッド線を引く。
    context.lineWidth = 1;
    DebugGrid.drawGrid(context, dest, this.host.space, "red");
    DebugGrid.drawGrid(context, dest, this.host.space*5, "yellow");

    // 原点に小さな赤い点を描く。
    context.fillStyle = "red";
    context.fillRect(-3, -3, 7, 7);
}

DebugGrid.drawGrid = function(context, dest, interval, color) {

    context.beginPath();

    for(var x = Math.step(dest.left(), interval) ; x < dest.right() ; x += interval) {
        context.moveTo(x, dest.top());
        context.lineTo(x, dest.bottom());
    }

    for(var y = Math.step(dest.top(), interval) ; y < dest.bottom() ; y += interval) {
        context.moveTo(dest.left(), y);
        context.lineTo(dest.right(), y);
    }

    context.strokeStyle = color;
    context.stroke();
}


//=========================================================================================================
/**
 * キャンバス上にパフォーマンス情報を表示するExecutant。
 */
function DebugInfo() {
    Executant.call(this);

    this.layer = 99999;

    this.info = {"delta":0, "delta_avg":0};
    this.samples = new Array(16);
    this.cursor = 0;
}

DebugInfo.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
DebugInfo.prototype.update = function(scene) {

    if(scene.delta == 0)
        return;

    // フレームごとの経過時間を一定数保持する。
    this.samples[this.cursor] = scene.delta;
    this.cursor++;
    this.cursor &= 0xF;

    // 一定時間ごとに集計するようにする。
    if(scene.time < this.watched + 2000)
        return;

    this.watched = scene.time;

    // 集計。
    this.info["delta"] = scene.delta;
    this.info["delta_avg"] = this.samples.average();
}

//---------------------------------------------------------------------------------------------------------
/**
 * this はビヘイバを指しているので注意。
 */
DebugInfo.prototype.depict = function(context, scene) {

    // 描画領域を取得。
    var rect = new Rect(0, 0, 400, 90);

    // 背景を描画。
    context.fillStyle = "black";
    var prev = context.globalAlpha;
    context.globalAlpha = 0.5;
    context.fillRect(rect.left(), rect.top(), rect.width(), rect.height());
    context.globalAlpha = prev;

    // 情報を描画。
    context.font = "18pt monospace";
    context.fillStyle = "white";
    context.fillText("delta: " + this.info["delta"].toFixed() + "ms (" + (1000/this.info["delta"]).toFixed(1) + "fps)", 0, 28);
    context.fillText("avg: " + this.info["delta_avg"].toFixed() + "ms (" + (1000/this.info["delta_avg"]).toFixed(1) + "fps)", 0, 58);
    context.fillText("fps: max " + scene.framerate + ", min " + scene.minrate, 0, 88);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定されたExecutant以下の階層構造を文字列で返す。
 *
 * @param   階層構造が知りたいExecutant。
 * @param   [内部で使用] 現在のインデント幅。
 * @param   [内部で使用] 第一引数に指定したExecutantの名前が分かっているなら指定する。
 */
DebugInfo.getStrataMap = function(ant, indent, name) {

    // 初期値。
    if(indent == undefined)
        indent = 0;

    // 名前を取得。
    if(name == undefined)
        name = ant.getId() || "/";

    // まずは自分を出力。
    var map = " ".repeat(indent) + name + " (" + ant.constructor.name + ")\n";

    // あとは字下げして子供を列挙。
    for(var k in ant.childs.leaves)
        map += DebugInfo.getStrataMap(ant.childs.get(k), indent + 4, k);

    return map;
}
