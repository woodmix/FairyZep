/**
 * 与えられた「動き」の定義に従って、任意の時間における位置を取得するユーティリティ「ウォーカー」を
 * 定義するファイル。
 *
 * 例1) 座標 [0,0] から [200,200] に等速で移動する場合の、進行率30%における位置を取り出す。
 *
 *      // 直線軌道ウォーカーの作成。
 *      var walker = new LineWalker({"dest":new Point(200, 200)});
 *
 *      // 進行率30%における位置を取り出す。
 *      var position = walker.get(0.3);    // 60,60
 *
 *      // すべてのウォーカーはスタート地点が[0,0]になっている。
 *      // 軌道を [100,100] だけ動かして、スタートを[100,100]、ゴールを[300,300]のようにしたい場合は次のようにする。
 *      var walker = new LineWalker({"dest":new Point(200, 200), "offset":new Point(100, 100)});
 *      var position = walker.get(0.3);    // 160,160
 *
 * 例2) 進行率が0%～100%から外れている場合の処理。
 *
 *      // 例1の状態から…
 *
 *      // ストップする。デフォルト。
 *      walker.style = new StopPolator();
 *      var position = walker.get(1.3);    // 200,200
 *      var position = walker.get(-0.3);   // 0,0
 *
 *      // ピンポンのように行ったり来たりする。
 *      walker.style = new PingpongPolator();
 *      var position = walker.get(1.1);    // 180,180
 *      var position = walker.get(-0.1);   // 20,20
 *
 *      // ループする。
 *      walker.style = new LoopPolator();
 *      var position = walker.get(1.2);    // 40,40
 *      var position = walker.get(-0.2);   // 160,160
 *
 * 例3) タイミング関数(イーズイン・アウト)の指定
 *
 *      // 例1と同じだが、徐々に減速するようにする。
 *      var walker = new LineWalker({"dest":new Point(200, 200), "timing":new EaseinPolator()});
 *
 *      var position = walker.get(0.1);    //  54.2,  54.2
 *      var position = walker.get(0.2);    //  97.6,  97.6
 *      var position = walker.get(0.3);    // 131.4, 131.4
 *      var position = walker.get(0.4);    // 156.8, 156.8
 *      var position = walker.get(0.5);    // 175.0, 175.0
 *      var position = walker.get(0.6);    // 187.2, 187.2
 *      var position = walker.get(0.7);    // 194.6, 194.6
 *      var position = walker.get(0.8);    // 198.4, 198.4
 *      var position = walker.get(0.9);    // 199.8, 199.8
 */


//=========================================================================================================
/**
 * ウォーカーの基底クラス。直接扱うことはできないので、派生クラスを利用すること。
 *
 * @param   動きを定義する連想配列。共通のキーとして次のものがある。
 *              style   進捗補間器その1。普通、進捗が始端・終端を超えている場合の補間器として設定する。
 *                      polators.js にあるような補間器で、任意の範囲の値を受け取り0.0-1.0の範囲の値を返す
 *                      ものを指定する。
 *                      インスタンスを直接指定することもできるが、クラス名を指定することもできる。
 *                      クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 *                      省略時は "stop"。
 *              timing  進捗補間器その2。普通、タイミング補間器として設定する。
 *                      style キーと同様の指定の仕方だが、0.0-1.0の範囲を受け取り、返すものを指定する。
 *                      省略時は "linear"。
 *              offset  軌道を一定量スライドさせたい場合は、そのスライド量をPointで指定する。
 *          ここで指定されたキーはインスタンスのプロパティとして参照できる。
 *              例)
 *                  var walker = new LineWalkder({"dest":new Point(100, 100), "timing":"easein", "style":"stop"});
 *                  console.log(walker.dest);       // Point(100, 100)
 *                  console.log(walker.timing);     // EaseinPolator
 *                  console.log(walker.style);      // StopPolator
 */
function Walker(definition) {

    // デフォルトのプロパティをセット。
    this.style = "stop";
    this.timing = "linear";
    this.offset = Point.zero;

    // 指定されたキーを保持する。
    for(var k in definition)
        this[k] = definition[k];

    // timing が文字列で指定されている場合、可能ならインスタンスに変換する。
    if(typeof(this.timing) == "string") {
        var polator = this.timing.ucfirst() + "Polator";
        if(window[polator])
            this.timing = new window[polator]();
    }

    // 同様に、style。
    if(typeof(this.style) == "string") {
        var polator = this.style.ucfirst() + "Polator";
        if(window[polator])
            this.style = new window[polator]();
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された進行率における位置を取り出す。
 *
 * @param   進行率。0%を0.0、100%を1.0で表現する。
 * @return  指定された進行率における位置。
 */
Walker.prototype.get = function(progress) {

    // プロパティ "style" を参照して、指定された進捗率に補間器を適用。
    progress = this.style.get(progress);

    // 同様に、timing。
    progress = this.timing.get(progress);

    // 指定された進行率における位置を取得、offset を適用してリターン。
    return this.processRail(progress).add(this.offset);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された進行率における位置を返す。
 *
 * @param   進行率。
 * @return  指定された進行率における位置。
 */
Walker.prototype.processRail = function(progress) {

    throw "実装してください";
}


//=========================================================================================================
/**
 * 直線軌道を処理するウォーカー。
 *
 * @param   基底が定めるプロパティに加えて以下のキーを指定する。
 *              dest    終端における座標。
 */
function LineWalker(definition) {
    Walker.call(this, definition);
}

LineWalker.prototype = Object.create(Walker.prototype);

//---------------------------------------------------------------------------------------------------------
LineWalker.prototype.processRail = function(progress) {

    return this.dest.clone().multi(progress);
}


//=========================================================================================================
/**
 * 真円軌道を処理するウォーカー。
 *
 * @param   基底が定めるプロパティに加えて以下のキーを指定する。
 *              center  中心座標
 *              rotate  終端における始端からの回転角度。時計回りならプラス、反時計回りならマイナスで指定する。
 */
function ArcWalker(definition) {
    Walker.call(this, definition);

    // 原点から中心点への距離が半径となる。
    this.radius = this.center.distance();

    // 中心から見たときの原点への角度を求める。
    this.angle = (new Point(-this.center.x, -this.center.y)).angle();
}

ArcWalker.prototype = Object.create(Walker.prototype);

//---------------------------------------------------------------------------------------------------------
ArcWalker.prototype.processRail = function(progress) {

    // 指定された進行率における角度を取得。
    var angle = this.angle + (this.rotate * progress);

    // その角度における単位円上の座標を取得して、半径・中心点から戻り値となる座標を取得する。
    var point = new Point(Math.cos(angle), Math.sin(angle));
    return point.multi(this.radius).add(this.center);
}


//=========================================================================================================
/**
 * 他のウォーカーを直列に並べて進行率によって切り替えながら軌道を決定するウォーカー。
 *
 * 基本的には次のように、他のウォーカーのインスタンスをパラメータとするのだが…
 *
 *      var walker = new CoalesceWalker({
 *          "offset": new Point(100, 100),
 *          "rail": {
 *
 *              // 33%までは横に移動。このウォーカーのoffsetは強制的に[0,0]になるので、必要な場合は上の
 *              // ように指定する。
 *               33: new LineWalker({"dest":new Point(100, 0)}),
 *
 *              // 次に66%までは縦に移動。二つ目以降のoffsetは直前のウォーカーの終端となる。
 *               66: new LineWalker({"dest":new Point(0, 100)}),
 *
 *              // 最後にまた横に移動。
 *              100: new LineWalker({"dest":new Point(100, 0)})
 *          }
 *      });
 *
 * 次のように他のウォーカーのパラメータのみでも初期化できる。ウォーカーのクラス名は "type" プロパティで指定する。
 *
 *      var walker = new CoalesceWalker({
 *          "offset": new Point(100, 100),
 *          "rail": {
 *               33: {"type":"line", "dest":new Point(100, 0)},
 *               66: {"type":"line", "dest":new Point(0, 100)},
 *              100: {"type":"line", "dest":new Point(100, 0)}
 *          }
 *      });
 *
 * ちなみに、直線軌道であれば "dest" となる座標だけで指定できる。
 *
 *      var walker = new CoalesceWalker({
 *          "offset": new Point(100, 100),
 *          "rail": {
 *               33: new Point(100, 0),
 *               66: new Point(0, 100),
 *              100: new Point(100, 0)
 *          }
 *      });
 *
 * このウォーカーを入れ子にすることもできる。
 *
 *      var walker = new CoalesceWalker({
 *          "timing": "easein",
 *          "style": "pingpong",
 *          "rail": {
 *               20: {"type":"line", "dest":new Point(100, 100)},
 *               80: {
 *                  "type":"coalesce",
 *                  "rail": {
 *                       33: {"type":"line", "dest":new Point(100, 0)},
 *                       66: {"type":"line", "dest":new Point(0, 100)},
 *                      100: {"type":"line", "dest":new Point(100, 0)}
 *                  }
 *              },
 *              100: {"type":"line", "dest":new Point(100, 100)},
 *          }
 *      });
 *
 * @param   基底が定めるプロパティに加えて以下のキーを指定する。
 *              rail    直列に並べる他のウォーカーか、そのパラメータ。
 *                      キーに、そのウォーカーが何パーセントまでを支配するのかを示す。
 *                      キーは進捗率の順序通りに並んでおり、必ず "100" のキーを含んでいる必要がある。
 */
function CoalesceWalker(definition) {
    Walker.call(this, definition);

    // 最初の "offset" を保持する。
    var point = Point.zero;

    // "rail" に指定されたキーを一つずつ見ていく。
    for(var k in this.rail) {

        // ウォーカーでないならば…
        if( !(this.rail[k] instanceof Walker) ) {

            // 一旦パラメータを取得。
            var params = this.rail[k];

            // 座標のみで指定されているならば直線軌道のウォーカーを使う。
            if(params instanceof Point)
                params = {"type":"line", "dest":params};

            // ウォーカーの正確なクラス名を取得。
            var type = params.type.ucfirst() + "Walker";
            delete params.type;

            // ウォーカー作成。
            this.rail[k] = new window[type](params);
        }

        // offset を上書き。
        this.rail[k].offset = point;

        // 次の"offset"とするため、1.0の時の座標を取得しておく。
        point = this.rail[k].get(1.0);
    }
}

CoalesceWalker.prototype = Object.create(Walker.prototype);

//---------------------------------------------------------------------------------------------------------
CoalesceWalker.prototype.processRail = function(progress) {

    // 進行率をパーセンテージに直す。
    progress = progress * 100;

    // 指定の進行率が含まれるエントリのキーを取得する。
    var prev = 0;
    for(var next in this.rail) {

        if(progress <= next)
            break;

        prev = next;
    }

    // そのモーションエントリがカバーしている進行率の幅を取得。
    var width = next - prev;

    // その幅において、指定された進行率は何パーセント進行したものかを取得。
    var rate = (progress - prev) / width;

    // 該当のウォーカーから座標を得る。
    return this.rail[next].get(rate);
}
