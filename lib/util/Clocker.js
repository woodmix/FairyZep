/**
 * 一定間隔ごとに処理を行う必要があるときに利用するユーティリティクラス。
 * 経過時間は手動で渡す必要がある。
 *
 * 例) 1000ms ごとにログを出力する。
 *
 *      // 1000ms 秒毎の間隔とする。
 *      var clocker = new Clocker(1000);
 *
 *      // タイミングが来る毎にログを出す。
 *      clocker.onclock = function(delay) {
 *          console.log('hi');
 *      }
 *
 *      // あとは適宜、経過秒数を渡していく。
 *      clocker.time(200);
 *      clocker.time(300);
 *      clocker.time(600);  // ここで累積が1000msになるため、"hi" と出力される。
 *      clocker.time(600);
 *      clocker.time(300);  // ここで累積が2000msになるため、再び "hi" と出力される。
 *      clocker.time(2000); // クロック二回分の時間が経過したため、"hi" が二回出力される。
 */

//---------------------------------------------------------------------------------------------------------
/**
 * コンストラクタ。
 *
 * @param   クロックが発生する間隔(ms)。FuzzyValueも可。
 * @param   最初のクロックまでの時間(ms)。FuzzyValueも可。省略時は第一引数と同じ。
 */
function Clocker(interval, initial) {

    // クロックが発生する間隔。
    this.interval = FuzzyValue.cast(interval);

    // クロックタイミングでのクロック発生回数。
    this.multiplier = new FuzzyValue(1);

    // クロックタイミングが来た場合に呼ばれる関数。引数には超過時間が渡される。
    this.onclock = undefined;

    // 次のクロックまでの時間。
    this.count = (initial == undefined) ? this.next() : FuzzyValue.int(initial);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定した時間が経過した場合の処理を行う。
 *
 * @param   経過した時間(ms)
 */
Clocker.prototype.time = function(delta) {

    // 次のクロックまでの時間を減算。
    this.count -= delta;

    // クロックタイミングが来ている限り処理する。
    while(this.count <= 0) {

        // onclockを起動。
        if(this.onclock) {
            var kicks = this.multiplier.int();
            for(var i = 0 ; i < kicks ; i++)
                this.onclock(-this.count);
        }

        // 次のクロックまでの時間を得る。
        this.count += this.next();
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * メンバ変数 interval を参照して、次のクロックまでの時間を決める。
 *
 * @return  次のクロックまでの時間
 */
Clocker.prototype.next = function() {

    return this.interval.int();
}


//=========================================================================================================
/**
 * 間隔が段々遅くなっていくようにしたもの。
 *
 * @param   クロックが発生する間隔(ms)。FuzzyValueも可。
 * @param   最初のクロックまでの時間(ms)。FuzzyValueも可。省略時は第一引数と同じ。
 * @param   遅くなっていく速度。一クロックごとに何ms遅くなるか。
 * @param   減速に加速度を付けたい場合は指定する。指定した場合、一クロックごとに適用される減速加速度として作用する。
 */
function SlowdownClocker(interval, initial, downspeed, decelerate) {
    Clocker.call(this, interval, initial);

    this.downspeed = downspeed;
    this.decelerate = decelerate || 0;
    this.padding = 0;
}

SlowdownClocker.prototype = Object.create(Clocker.prototype);

//---------------------------------------------------------------------------------------------------------
/**
 * 次のクロックまでの時間を決める。
 */
SlowdownClocker.prototype.next = function() {

    this.padding += this.downspeed;
    this.downspeed += this.decelerate;

    return this.padding + Clocker.prototype.next.call(this);
}
