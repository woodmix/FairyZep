
/**
 * ゲーム世界を構成する一つのオブジェクトを表す。
 *
 * BehaviorHost から派生する。
 * 次のキーで参照されるビヘイバーには共通した意味が与えられている。
 *
 *      renderer    このExecutantを描画する「レンダラ」。render() のメソッドが必要。
 *                  見本は renderers.js を参照。
 *
 *      body        このExecutantの存在領域を示す「ボディビヘイバ」。getRect() のメソッドが必要。
 *                  見本は behaviors.js の RendererBody を参照。
 *
 *      rigid       このExecutantの当たり判定領域を示す「リジッドビヘイバ」。getRect() のメソッドが必要。
 *                  見本は colliders.js の RigidBehavior を参照。
 *
 *      sensor      このExecutantのボディ領域変更イベント「センサービヘイバ」。Delegateとして機能する
 *                  必要がある。見本は behaviors.js の BodySensor を参照。
 *
 *      interactor  このExecutantにUIインタラクションさせる「インタラクションビヘイバ」。touch(),
 *                  interact() のメソッドが必要。見本は InteractBehavior.js を参照。
 *
 * 他にも、任意のメソッドを備えたビヘイバーを自由に定義して、任意のキーを与えて管理できる。
 *
 * ビヘイバを bid() で遅延操作した場合は次のフレームのスタンドフェーズで実行される。
 */
function Executant() {
    BehaviorHost.call(this);

    // このExecutantの位置座標。
    this.position = new Point();

    // このExecutantのスケール。このExecutantにおける座標系に適用される。
    this.scale = Point.one.clone();

    // このExecutantが存在するレイヤ。描画時やUIインタラクション時に参照される。
    this.layer = undefined;

    // 子Executant管理オブジェクト。
    // bid() での遅延操作は次のフレームのスタンドフェーズで実行される。
    this.childs = new LeafManager();
    this.childs.onoperate = this.childsOperated.bind(this);

    // 親Executant。
    this.parent = null;

    // 最初のupdate時だけfirst()が呼ばれるようにする。
    this.update = this.firstUpdate;

    // 子孫も含めて、このExecutantで描画命令が必要なレイヤー番号の配列。makeTribeLayers()で更新される。
    this.tribeLayers = undefined;
}

Executant.prototype = Object.create(BehaviorHost.prototype);


// フレームサイクル関連。
//=========================================================================================================
// Executant にはフレームごとに次の5つのフェーズがある。
//      stand       スタンドフェーズ。アップデートフェーズの前に、フレームごとの初期化を行う。
//                  基底では、子Executantやビヘイバの予約された追加・削除を実行する。
//      update      アップデートフェーズ。フレームごとの処理を記述するメイン部分。移動などをここで行う。
//                  アクティブになって最初のフレームでは発生せず、代わりに first が発生する。
//      first       Executantがアクティブになって最初のフレームのときのみ発生する特殊なアップデートフェーズ。
//                  アクティブ後に初期化処理が必要な場合はここに記述する。
//      stay        ステイフェーズ。アップデートフェーズの後に、フレームごとの終了処理を行う。
//                  当たり判定や領域排他処理などを記述すると良い。
//      draw        ドローフェーズ。フレームの最後の処理としてExecutantの描画を行う。
//                  基底の実装としてはレンダラビヘイバを使うようになっているので、普通はこれをオーバーライド
//                  せずに、レンダラビヘイバを通じて描画処理を定義する。

//---------------------------------------------------------------------------------------------------------
/**
 * 指定されたフェーズの起動を行う。
 *
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト。
 * @param   フェーズの名前。"stand", "update", "stay" のいずれか。
 */
Executant.prototype.kickCycle = function(scene, cycle) {

    // 自分。
    this[cycle](scene);

    // ビヘイバの処理。
    switch(cycle) {
        // ビヘイバのbeforeは不要かもしれんので...
        // case "stand":
        //     this.behaviors.each(function(behavior){
        //         behavior.before();
        //     });
        //     break;
        case "update":
            this.behaviors.each(function(behavior){
                behavior.behave(scene.delta);
            });
            break;
        case "stay":
            this.behaviors.each(function(behavior){
                behavior.after();
            });
            break;
    }

    // 子供。
    this.childs.each(function(child){
        child.kickCycle(scene, cycle);
    });
}

//---------------------------------------------------------------------------------------------------------
/**
 * スタンドフェーズの処理を行う。
 *
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト。
 */
Executant.prototype.stand = function(scene) {

    this.behaviors.act();
    this.childs.act();
}

//---------------------------------------------------------------------------------------------------------
/**
 * アップデートフェーズの処理を行う。
 * ただし、最初のフレームだけはfirstが呼ばれ、updateは呼ばれない。
 *
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト。
 */
Executant.prototype.update = function(scene) {
}

//---------------------------------------------------------------------------------------------------------
/**
 * 最初のupdate時のみの処理を記述したい場合はこれをオーバーライドする。
 *
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト。
 */
Executant.prototype.first = function(scene) {
}

/**
 * 最初のupdate時、一回だけ呼び出しをオーバーライドしてfirstに接続するために使われる。
 */
Executant.prototype.firstUpdate = function(scene) {

    delete this.update;
    this.first(scene);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ステイフェーズの処理を行う。
 *
 * @param   描画先キャンバスとタイミングを管理しているシーンオブジェクト。
 */
Executant.prototype.stay = function(scene) {
}

//---------------------------------------------------------------------------------------------------------
/**
 * ドローフェーズの処理を行う。
 *
 * @param   描画するべきレイヤー番号
 * @param   描画先となる CanvasRenderingContext2D
 * @param   描画先とキャンバスを管理しているシーンオブジェクト
 */
Executant.prototype.draw = function(layer, context, scene) {

    // スケール 0 ということは見えないということ。
    if(this.scale.x == 0  ||  this.scale.y == 0)
        return;

    // 自分の位置座標を原点とし、スケールを反映する。
    context.translate(this.position.x, this.position.y);
    context.scale(this.scale.x, this.scale.y);

    // 自分を描画。
    if(this.layer == layer)
        this.depict(context, scene);

    // 子供を描画。
    this.childs.each(function(child){
        if(child.tribeLayers.indexOf(layer) >= 0)
            child.draw(layer, context, scene);
    });

    // 原点とスケールを戻す。
    context.scale(1/this.scale.x, 1/this.scale.y);
    context.translate(-this.position.x, -this.position.y);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ドローフェーズにおいて自分を描画する処理を行う。
 */
Executant.prototype.depict = function(context, scene) {

    // 基底としてはレンダラビヘイバを使う。
    var renderer = this.behaviors.get("renderer");
    if(renderer)
        renderer.render(context, scene);
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 tribeLayers を設定する。
 */
Executant.prototype.makeTribeLayers = function() {

    // すでに作成済みなら何もしない。
    if(this.tribeLayers != undefined)
        return;

    // 初期化。
    this.tribeLayers = [];

    // まずは自分のレイヤ。
    if(this.layer != undefined)
        this.tribeLayers.push(this.layer);

    // 子供を一つずつ見ていく。
    var me = this;
    this.childs.each(function(child){

        // 子供の tribeLayers を更新。
        child.makeTribeLayers();

        // その結果判明した必要レイヤーを吸収していく。
        for(var j = 0 ; j < child.tribeLayers.length ; j++)  {
            if(me.tribeLayers.indexOf(child.tribeLayers[j]) < 0)
                me.tribeLayers.push(child.tribeLayers[j]);
        }
    });

    // レイヤを数値順で並び替え。
    this.tribeLayers.sort(function(a,b){return a-b});
}

//---------------------------------------------------------------------------------------------------------
/**
 * このExecutantを子供も含めて削除する。メモリリークの原因になるので、不要になったら解放処理が必要になる。
 */
Executant.prototype.destroy = function() {

    // ビヘイバを全てデタッチ。デタッチをトリガとして解放処理をしているビヘイバがいるので必要になる。
    this.behaviors.clear();

    // 階層の中にいる場合は離脱する。
    if(this.parent)
        this.parent.childs.remove(this);

    // すべての子要素をdestroy()していく。
    this.childs.each(function(child){
        child.destroy();
    });
}


// 子供・階層関連。
//=========================================================================================================

//---------------------------------------------------------------------------------------------------------
/**
 * 子Executantが追加・削除・変更されたら呼ばれる。
 *
 * @param   追加・削除・変更されるID
 * @param   削除される子Executant。追加の場合は null。
 * @param   追加される子Executant。削除の場合は null。
 */
Executant.prototype.childsOperated = function(name, outof, into) {

    // 子Executantの parent メンバ変数を適切に管理する。
    if(outof)
        outof.parent = null;

    if(into)
        into.parent = this;

    // 階層が変わったときの処理を行う。
    this.tribeChanged();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 自分より下のExecutantツリーに変更があった場合に呼ばれる。
 */
Executant.prototype.tribeChanged = function() {

    // tribeLayers を破棄して、次の makeTribeLayers() 呼び出しで再構築するようにする。
    this.tribeLayers = undefined;

    // 親に伝播していく。
    if(this.parent)
        this.parent.tribeChanged();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 自身が所属するシーンを返す。
 *
 * @return  シーンとなっているExecutant。見つからない場合は null。
 */
Executant.prototype.getScene = function() {

    if(this instanceof GlassScene)
        return this;

    return this.parent ? this.parent.getScene() : null;
}

//---------------------------------------------------------------------------------------------------------
/**
 * ルートExecutantからこのExecutantへのパスを返す。
 *
 * @return  このExecutantへのパス。
 */
Executant.prototype.getPath = function() {

    if(this.parent == undefined)
        return "";

    return this.parent.getPath() + "/" + this.getId();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたIDの子Executantを返す。
 * "/" で区切って孫以降のExecutantを返すこともできる。
 *
 * @param   子ExecutantのID。"aaaa/bbbb/cccc" のように指定すれば孫なども取得できる。
 * @return  指定された子Executant。見つからない場合は undefined。
 */
Executant.prototype.getChild = function(path) {

    return this.childs.route( path.replace("/", ".childs.") );
}

//---------------------------------------------------------------------------------------------------------
/**
 * 親Executantに何というキーで保持されているかを返す。
 *
 * @return  このExecutantのキー。親の下にない場合はnull。
 */
Executant.prototype.getId = function() {

    if(!this.parent)
        return null;

    return this.parent.childs.index(this);
}


// 座標関連。
//=========================================================================================================

//---------------------------------------------------------------------------------------------------------
/**
 * 親の座標系におけるPointやRectを、このExecutantの座標系のものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.getCoord = function(coord) {

    return coord.clone().sub(this.position).divide(this.scale);
}

//---------------------------------------------------------------------------------------------------------
/**
 * このExecutantの座標系におけるPointやRectを、親の座標系のものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.parentCoord = function(coord) {

    return coord.clone().multi(this.scale).add(this.position);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ルートの座標系(キャンバスにピクセルレシオをかけた後、ルートシーンの座標系を適用する前の状態)における
 * PointやRectを、このExecutantの座標系のものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.localCoord = function(coord) {

    var strata = this.getPath().split("/");

    var ant = this.getScene();
    for( i = 0 ; ant ; ant = ant.childs.get(strata[++i]) )
        coord = ant.getCoord(coord);

    return coord;
}

//---------------------------------------------------------------------------------------------------------
/**
 * このExecutantの座標系におけるPointやRectを、キャンバス上のものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.globalCoord = function(coord) {

    coord = this.parentCoord(coord);

    return this.parent ? this.parent.globalCoord(coord) : coord;
}

//---------------------------------------------------------------------------------------------------------
/**
 * このExecutantの座標系におけるPointやRectを、指定されたExecutantのものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @param   対象となるExecutant
 * @return  修正後のPoint, Rect
 */
Executant.prototype.spinCoord = function(coord, target) {

    return Executant.transCoord(this, target, coord);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定されたExecutantの座標系におけるPointやRectを、このExecutantのものに直す。
 */
Executant.prototype.takeCoord = function(coord, target) {

    return Executant.transCoord(target, this, coord);
}

//---------------------------------------------------------------------------------------------------------
/**
 * staticメソッドになっているので注意。
 * 指定されたExecutantの座標系におけるPointやRectを、指定されたExecutantのものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   変換元の座標系を持つExecutant。nullを指定した場合はルートの座標系とする。
 * @param   変換先の座標系を持つExecutant。nullを指定した場合はルートの座標系となる。
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.transCoord = function(from, to, coord) {

    // 要最適化
    if(from)
        coord = from.globalCoord(coord);

    if(to)
        coord = to.localCoord(coord);

    return coord;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 親のスケールにおけるPointやRectを、このExecutantのスケールのものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.getScale = function(coord) {

    return coord.clone().divide(this.scale);
}

//---------------------------------------------------------------------------------------------------------
/**
 * このExecutantのスケールにおけるPointやRectを、親のスケールのものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.parentScale = function(coord) {

    return coord.clone().multi(this.scale);
}

//---------------------------------------------------------------------------------------------------------
/**
 * ルートのスケールにおけるPointやRectを、このExecutantのスケールのものに直す。
 * Rectは虚状態になる可能性があるので、必要ならnormalizeすること。
 *
 * @param   直したいPoint, Rect
 * @return  修正後のPoint, Rect
 */
Executant.prototype.localScale = function(coord) {

    // 普通に考えればルートからたどりながら再帰処理するところだが、乗算しかしないので遡りながらの再帰でも
    // 問題ない。

    coord = this.getScale(coord);

    if(this.parent)
        coord = this.parent.localScale(coord);

    return coord;
}
