/**
 * Executant同士の当たり判定に関するビヘイバ(コライダ)を納めたファイル。
 * 当たり判定に使う領域は宿主のリジッドヒベイバから取得する。
 *
 * 当たり判定に関わる全てのExecutantはリジッドを持っているひつようがあるが、コライダはケースバイケース。
 * たとえば10体のExecutantがいてそれぞれが全てに対して判定されるなら、すべてのExecutantがコライダを持っている
 * 必要があるし、1対10の判定になるなら 1 に該当するExecutantのみがコライダを持っていれば良い。
 *
 * コライダの宿主となるExecutantは次のメソッドを備えている必要がある。
 *      collided(competitor)
 *          当たったときに呼ばれる。
 *          @param  当たった相手Executant
 */

//=========================================================================================================
/**
 * 当たり判定の領域を表すビヘイバ(リジッド)の基底。
 * 基底としては宿主のボディ矩形をそのまま使う。
 */
function RigidBehavior() {
    Behavior.call(this);

    // リジッドの種別。今のところ "rect", "circle" のみ。
    this.form = "rect";

    // 宿主の親の座標系における当たり領域の情報。
    this.adapted = null;
}

RigidBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 当たり判定の矩形を返す。
 *
 * 戻り値はリジッドの種別(メンバ変数 form)によって異なる。
 *      rect    Rectインスタンス
 *      circle  center(Point), radius(int) を持った構造体。
 */
RigidBehavior.prototype.getRigid = function() {

    if(this.host)
        return this.host.behaviors.need("body").getRect();
    else
        return Rect.zero.clone();
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 adapted と、引数で指定された矩形との当たり判定を行う。
 *
 * @param   Rectインスタンス。
 * @return  当たっているならtrue、当たっていないならfalse。
 */
RigidBehavior.prototype.againstRect = function(he) {

    return this.adapted.collide(he);
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 adapted と、引数で指定された真円との当たり判定を行う。
 *
 * @param   center(Point), radius(int) を持った構造体。
 * @return  当たっているならtrue、当たっていないならfalse。
 */
RigidBehavior.prototype.againstCircle = function(he) {

    throw "未実装";
}


//=========================================================================================================
/**
 * 指定した矩形を当たり領域とするリジッド。
 *
 * @param   当たり領域としたい矩形。
 */
function RectRigid(rect) {
    RigidBehavior.call(this);

    this.rect = rect;
}

RectRigid.prototype = Object.create(RigidBehavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 当たり判定の矩形を返す。
 */
RectRigid.prototype.getRigid = function() {

    return this.rect.clone();
}


//=========================================================================================================
/**
 * 円を当たり領域とするリジッド。
 * 今のところ、ボディ矩形の幅を基準とした真円として固定されている。
 */
function CircleRigid() {
    RigidBehavior.call(this);

    this.form = "circle";
}

CircleRigid.prototype = Object.create(RigidBehavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 当たり判定の矩形を返す。
 */
CircleRigid.prototype.getRigid = function() {

    if(this.host) {
        var body = this.host.behaviors.need("body").getRect();
        return {
            "center": rect.center(),
            "radius": rect.width() / 2,
        };
    }else {
        return {
            "center": Point.zero.clone(),
            "radius": 0,
        };
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 adapted と、引数で指定された矩形との当たり判定を行う。
 *
 * @param   Rectインスタンス。
 * @return  当たっているならtrue、当たっていないならfalse。
 */
CircleRigid.prototype.againstRect = function(he) {

    throw "未実装";
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 adapted と、引数で指定された真円との当たり判定を行う。
 *
 * @param   center(Point), radius(int) を持った構造体。
 * @return  当たっているならtrue、当たっていないならfalse。
 */
CircleRigid.prototype.againstCircle = function(he) {

    // 自身と相手との距離を取得。
    var distance = this.adapted.center.distance(he.center);

    // 距離が、自身と相手の半径の和より小さければ当たっている。
    return distance < this.adapted.radius + he.radius;
}


//=========================================================================================================
/**
 * 指定した相手との当たり判定を行うビヘイバの基底クラス。
 * 相手は宿主からプロパティでたどれるExecutantの配列になっていなければならない。
 * また、宿主と同じ親を持っていなくてはならない。
 *
 * @param   当たり判定相手を取得するとき、宿主からどのようにプロパティを辿れば良いか。
 *          指定の仕方は Object.prototype.route を参照。
 */
function ColliderBehavior(target) {
    Behavior.call(this);

    // 引数に指定された値を保持しておく。
    this.target = target;
}

ColliderBehavior.prototype = Object.create(Behavior.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * ステイフェーズごとに処理する。
 */
ColliderBehavior.prototype.after = function() {

    // 最適化のために、親座標系おける自身のリジッド領域を取得して、リジッドのadaptedメンバに格納しておく。
    this.rigid = this.host.behaviors.need("rigid");
    switch(this.rigid.form) {
        case "rect":
            this.rigid.adapted = this.host.parentCoord( this.rigid.getRigid() );
            break;
        case "circle":
            var circle = this.rigid.getRigid();
            circle.center = this.host.parentCoord( circle.center );
            this.rigid.adapted = circle;
            break;
    }

    // 当たり判定相手を取得。
    var competitors = this.host.route(this.target);

    // 一つずつ、判定していく。
    for(var i = 0, competitor ; competitor = competitors[i] ; i++) {
        if( this.isCollide(competitor) )
            this.host.collided(competitor);
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定されたExecutantとの当たり判定を行う。
 *
 * @param   判定したいExecutant
 * @return  当たっているならtrue、いないならfalse。
 */
ColliderBehavior.prototype.isCollide = function(competitor) {

    // 指定されたExecutantのリジッドを取得。親における座標を取得して、当たり判定する。
    var he = competitor.behaviors.need("rigid");
    switch(he.form) {

        case "rect":
            var area = competitor.parentCoord( he.getRigid() );
            return this.rigid.againstRect(area);

        case "circle":
            var area = he.getRigid();
            area.center = competitor.parentCoord( area.center );
            return this.rigid.againstCircle(area);
    }
}
