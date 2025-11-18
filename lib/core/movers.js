/**
 * Executantの移動を行うビヘイバーを収めたファイル。
 */

//=========================================================================================================
/**
 * セットされた座標へ移動を行うビヘイバ。
 * 移動が完了したら onFinish というキーで持っているDelegateが起動される。
 *
 * @param   Pointインスタンス。目的地の座標。
 * @param   スピード(px/s)。
 *
 * 引数なしでコールすることもできる。その場合は別途メンバをセットすること。
 */
function DestineMover(dest, speed) {
    Behavior.call(this);

    // 移動が完了したときに宿主から自動的に削除したい場合は true を指定する。
    this.autoremove = false;

    // スピード(px/ms)。
    this.speed = speed / 1000;

    // 目的座標。
    this.dest = dest;

    // 移動が完了したら起動される。
    this.onFinish = new Delegate();

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    this.needReset();
}

DestineMover.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとに実行される。
 */
DestineMover.prototype.behave = function(delta) {

    // スピード 0 ならショートカット。
    if(!this.speed)
        return;

    // 宿主の今の位置から目的地へのベクトルを取得。
    var vector = this.dest.clone().sub(this.host.position);

    // 目的地までの距離を取得。0 の場合はリターン。
    var distance = vector.distance();
    if(distance == 0)
        return;

    // このフレームでの移動距離が、目的地までの距離の何パーセントに当たるかを取得。
    var move = this.speed * delta / distance;

    // まだ目的地に到達しないなら、移動して終了。
    if(move < 1.0) {
        vector.multi(move);
        this.host.position.add(vector);
        return;
    }

    // 以降、到達した場合...

    // 目標座標に綺麗に合わせる。
    this.host.position.set(this.dest);

    // onFinishを起動。
    this.onFinish.trigger(this);

    // 指定されているなら宿主から自らを削除。
    if(this.autoremove)
        this.host.removeBehaviorbehaviors.bid("remove", this);
}


//=========================================================================================================
/**
 * セットされた角度と速度で移動を行うビヘイバ。
 *
 * @param   角度(ラジアン)。
 * @param   速さ(px/s)。
 */
function AngleMover(angle, speed) {
    Behavior.call(this);

    // 移動方向の角度。
    this.angle = angle;

    // 移動の速さ(px/ms)。
    this.speed = speed / 1000;

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    this.needReset();
}

AngleMover.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとに実行される。
 */
AngleMover.prototype.behave = function(delta) {

    if( isNaN(this.angle) )
        return;

    var move = Point.circle(this.angle).multi(this.speed * delta);
    this.host.position.add(move);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 移動角度をX軸方向に反転する。
 */
AngleMover.prototype.flip = function() {

    this.angle = Math.loop(Math.mirror(this.angle, Math.PI90), Math.PI360);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 移動角度をY軸方向に反転する。
 */
AngleMover.prototype.flop = function() {

    this.angle = Math.loop(Math.mirror(this.angle, Math.PI180), Math.PI360);
}
//---------------------------------------------------------------------------------------------------------
/**
 * 移動角度を、指定された角度の面を向くように反転する。任意の角度の面や球体に対する跳ね返りを行いたいときに
 * 利用する。
 * 「指定された角度の面」とは、指定された角度を中心とした180°を言う。たとえば45°を指定したなら -45～135°
 * となる。すでに指定された角度の面を向いている場合は何もしない。
 * 「面を向くように反転」とは、その角度の直交線に対して対称となる角度を取ることを言う。たとえば180°で
 * 進んでいるときに45°を指定してflap()したときは90°となる。
 *
 * @param   向きたい面の角度(ラジアン)。
 */
AngleMover.prototype.flap = function(pivot) {

    if( isNaN(pivot) )
        return;

    // 指定の角度と直交する角度を求める。
    pivot -= Math.PI90;

    // すでに指定の角度の面を向いている場合は何もしない。
    if( Math.inAngle(this.angle, pivot, pivot + Math.PI180) )
        return;

    // 直交角度に対して、現在の移動角度の対称を取る。
    this.angle = Math.loop(Math.mirror(this.angle, pivot), Math.PI360);
}

//=========================================================================================================
/**
 * 引数で指定されたウォーカーを使って移動を行うビヘイバ。
 * ウォーカーが返す座標の前回フレーム時からの変化量を宿主に適用するので、途中で宿主の座標を動かしても
 * ちゃんと引き継がれる。一方、offsetは無視される。
 *
 * @param   移動時に参照するウォーカー。
 * @param   何ミリ秒を使ってウォーカーの1往路(0.0-1.0)をたどるか。
 */
function WalkMover(walker, duration) {
    Behavior.call(this);

    this.walker = walker;
    this.duration = duration;

    // 往路が完了したときに宿主から自動的に削除したい場合は true を指定する。
    this.autoremove = false;

    // 経過した時間。
    this.passed = 0;

    // 前回の座標。
    this.previous = walker.get(0.0);

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    this.needReset();
}

WalkMover.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとに実行される。
 */
WalkMover.prototype.behave = function(delta) {

    // 経過時間を更新して、進捗率を得る。
    this.passed += delta;
    var prog = this.passed / this.duration;

    // 自動削除が有効な場合に進捗率が 1.0 に到達したら、自らを宿主から削除する。また、最後の進捗率を 1.0 に
    // 揃える。
    if(this.autoremove  &&  prog >= 1.0) {
        prog = 1.0;
        this.host.behaviors.bid("remove", this);
    }

    // ウォーカーの軌道をたどる。
    var point = this.walker.get(prog);

    // 前回からの変化量分、宿主を動かす。
    this.host.position.add( point.clone().sub(this.previous) );

    // 前回の座標として取っておく。
    this.previous = point;
}


//=========================================================================================================
/**
 * 移動ビヘイバに摩擦ブレーキを適用するビヘイバ。
 * 速さを speed というプロパティに持っている移動ビヘイバにしか適用できない。
 *
 * @param   動摩擦係数(px/s2)。1秒で速さがいくつ減衰するか。省略時は 1000。
 * @param   静摩擦係数(px/s)。速さがこれ以下の場合は速さがゼロになる。省略時は 1。
 * @param   適用対象の移動ビヘイバのキー。省略時は "mover"。
 */
function SpeedFriction(gruel, stop, target) {
    Behavior.call(this);

    // 指定された引数を保持する。
    this.gruel = (gruel || 1000) / 1000 / 1000;
    this.stop = (stop || 1) / 1000;
    this.target = target || "mover";

    // 最初のフレーム時のみ、behaveが処理されないようにする。
    this.needReset();
}

SpeedFriction.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * フレームごとに実行される。
 */
SpeedFriction.prototype.behave = function(delta) {

    // 適用対象の移動ビヘイバを取得。
    var mover = this.host.behaviors.get(this.target);

    // 移動ビヘイバがない、あるいは speed プロパティがないかゼロの場合は処理しない。
    if( !mover  ||  !mover.speed)
        return;

    // 速さがどのくらい減るかを取得。
    var decay = this.gruel * delta;

    switch(true) {

        // speed プロパティが数値の場合はこう。
        case typeof(mover.speed) == "number":
            mover.speed -= decay;
            if(mover.speed <= this.stop)
                mover.speed = 0;
            break;

        // speed プロパティがPointインスタンスの場合はこう。
        // [未検証]
        // case mover.speed instanceof Point:
        //     var amount = mover.speed.distance();
        //     if(amount <= this.stop)
        //         mover.speed.set(0, 0);
        //     else
        //         mover.speed.multi( (amount - decay) / amount );
        //     break;
    }
}


//=========================================================================================================
/**
 * 指定された矩形の内側から出ないようにするビヘイバ。
 * ブロック崩しのボールがステージの四辺の壁にぶつかるような振る舞いを持たせる。
 *
 * @param   動き回るリンクとなるRect。このRectの内側から出ないようになる。
 */
function InsideSkater(rink) {
    Behavior.call(this);

    // 引数に指定された矩形を覚えておく。
    this.rink = rink.clone();

    // 跳ね返ったときに起動される。引数には "left", "top", "right", "bottom" のいずれかの文字列が与えられる。
    this.onBound = new Delegate();
}

InsideSkater.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * ステイフェーズごとに処理される。
 */
InsideSkater.prototype.after = function() {

    // 宿主の矩形を取得。
    var body = this.host.behaviors.need("body").getRect();
    body = this.host.parentCoord(body);

    // 補正量を初期化。
    var slide = Point.zero.clone();

    // 左
    if(body.left() < this.rink.left()) {
        slide.x = (this.rink.left() - body.left()) * 2;
        this.onBound.trigger("left");
    }

    // 上
    if(body.top() < this.rink.top()) {
        slide.y = (this.rink.top() - body.top()) * 2;
        this.onBound.trigger("top");
    }

    // 右
    if(this.rink.right() <= body.right()) {
        slide.x = (this.rink.right() - body.right()) * 2;
        this.onBound.trigger("right");
    }

    // 下
    if(this.rink.bottom() <= body.bottom()) {
        slide.y = (this.rink.bottom() - body.bottom()) * 2;
        this.onBound.trigger("bottom");
    }

    // 計算した補正量を適用する。
    this.host.position.add(slide);
}
