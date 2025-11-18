/**
 * 親のExecutantのボディが内接されるように位置調整を行うExecutant。「フロート」と呼称する。
 * 自身のボディが親のボディよりも小さい場合は、逆に自身が親に内接するようにする。
 *
 * 親のExecutantにセンサーを付けるので、ボディに変更がないことが分かっているならあらかじめ DeadSensor
 * を付けておくとパフォーマンス的には良い。
 */

//---------------------------------------------------------------------------------------------------------
/**
 * コンストラクタ
 */
function FloatExecutant() {
    Executant.call(this);

    // true にすると、親の矩形のサイズが変わった場合に、変わる前後の中央位置を合わせるようにする。
    this.centerSizing = false;

    // 親のボディ。first()で初期化される。
    this.poleRect = undefined;
}

FloatExecutant.prototype = Object.create(Executant.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 最初のアップデートフェーズで呼ばれる。
 */
FloatExecutant.prototype.first = function(scene) {

    // 親のボディ変更を検知できるようにする。
    this.parent.behaviors.need("sensor").onSense.register( this.poleChanged.bind(this) );

    // 親のボディ矩形を保持しておく。
    this.poleRect = this.parent.behaviors.need("body").getRect();

    // 最初の位置チェック。
    this.revisePosition();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 親のボディ矩形が変わったら呼ばれる。
 * 表示していた領域の中央位置が変わらないように、新しい矩形に適合する。
 */
FloatExecutant.prototype.poleChanged = function(rect, holder) {

    // 変更前の矩形を取得。
    var before = this.poleRect.clone();

    // 保持している親の矩形を更新。
    rect = holder.behaviors.need("body").getRect();
    this.poleRect.set(rect);

    // 超過分があれば修正する。
    this.revisePosition();

    // 指定されているなら、中央位置を合わせるようにする。
    // 要するにサイズが変化した量の半分だけ座標をずらせば良い。たとえば100膨らんだなら、横に50戻せばおｋ。
    // 親の矩形を更新した後でないと、スクロールが反映されないので注意。
    if(this.centerSizing)
        this.scroll( rect.size.clone().sub( before.size ).divide(-2) );
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された座標が、親のボディ中央に位置するようにする。
 *
 * @param   中央に位置させたい座標。省略した場合は自身のボディの中央となる。
 */
FloatExecutant.prototype.centering = function(point) {

    // 省略された場合は自身のボディ中央。
    if(point == undefined)
        point = this.behaviors.need("body").getRect().center();

    // 位置合わせ。
    var pos = this.poleRect.center().sub(point);
    this.position.set(pos);

    // 超過分を修正する。
    this.revisePosition();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された距離だけスクロールする。
 *
 * @param   スクロールしたい量。たとえば右に100、下に50動かしたいなら new Point(100, 50) と指定する。
 */
FloatExecutant.prototype.scroll = function(move) {

    this.position.sub(move);
    this.revisePosition();
}

//---------------------------------------------------------------------------------------------------------
/**
 * フロートが画面外に出てしまわないように position を調整する。
 */
FloatExecutant.prototype.revisePosition = function() {

    var body = this.behaviors.need("body").getRect();

    // まずはX軸。自身の幅が親の幅より大きい場合。
    if( this.poleRect.width() < body.width() ) {

        // 左チェック。
        if( this.poleRect.left() < this.position.x + body.left() )
            this.position.x = this.poleRect.left() - body.left();

        // 右チェック。
        if( this.position.x + body.right() < this.poleRect.right() )
            this.position.x = this.poleRect.right() - body.right();

    // 自身の幅が親の幅より小さい場合。
    }else {

        // 左チェック。
        if( this.position.x + body.left() < this.poleRect.left() )
            this.position.x = this.poleRect.left() - body.left();

        // 右チェック。
        if( this.poleRect.right() < this.position.x + body.right() )
            this.position.x = this.poleRect.right() - body.right();
    }

    // 同じようにY軸。
    if( this.poleRect.height() < body.height() ) {

        if( this.poleRect.top() < this.position.y + body.top() )
            this.position.y = this.poleRect.top() - body.top();

        if( this.position.y + body.bottom() < this.poleRect.bottom() )
            this.position.y = this.poleRect.bottom() - body.bottom();

    }else {

        if( this.position.y + body.top() < this.poleRect.top() )
            this.position.y = this.poleRect.top() - body.top();

        if( this.poleRect.bottom() < this.position.y + body.bottom() )
            this.position.y = this.poleRect.bottom() - body.bottom();
    }
}
