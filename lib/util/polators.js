/**
 * 与えられた値に対して、決められたルールに従って値を返す「補間器」を収めたファイル。
 * ほとんどの補間器は 0.0～1.0 の範囲の値を受け取り、-1.0～+1.0 の値を返すが特記がある場合はその限りではない。
 * 補間器を入れ子にすることで様々な数値変化を表現できる。
 */

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた値をそのまま返す最も単純な補間器。
 * 任意の範囲の値を受け取り、任意の範囲の値を返す。
 */
function LinearPolator() {}
LinearPolator.prototype.get = function(x) {

    return x;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 最初は遅く徐々に加速する補間器。
 * 0.0-1.0の範囲の値を受け取り、0.0-1.0の範囲の値を返す。
 */
function EaseoutPolator() {}
EaseoutPolator.prototype.get = function(x) {

    return Math.pow(x, 3);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 最初は速く徐々にブレーキをかける補間器。
 * 0.0-1.0の範囲の値を受け取り、0.0-1.0の範囲の値を返す。
 */
function EaseinPolator() {}
EaseinPolator.prototype.get = function(x) {

    x = x - 1;
    return Math.pow(x, 3) + 1;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 正弦波を表す補間器。1.0でちょうど一週目を表す。つまり、0.25で1を、0.5で0を、0.75で-1を返す。
 * 任意の範囲の値を受け取り、-1.0～+1.0の範囲の値を返す。
 */
function SinPolator() {}
SinPolator.prototype.get = function(x) {

    return Math.sin(Math.PI * 2 * x);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 余弦波を表す補間器。1.0でちょうど一週目を表す。つまり、0.25で0を、0.5で-1を、0.75で0を返す。
 * 任意の範囲の値を受け取り、-1.0～+1.0の範囲の値を返す。
 */
function CosPolator() {}
CosPolator.prototype.get = function(x) {

    return Math.cos(Math.PI * 2 * x);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた値をそのまま返すが、0.0-1.0の範囲は超えないようにストップする補間器。
 * 任意の範囲の値を受け取り、0.0-1.0の範囲の値を返す。
 */
function StopPolator() {}
StopPolator.prototype.get = function(x) {

    if(x < 0.0)  return 0.0;
    if(1.0 < x)  return 1.0;
    return x;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた値をそのまま返すが、0.0-1.0の範囲を超えると反対側にループする補間器。
 * 任意の範囲の値を受け取り、0.0-1.0の範囲の値を返す。
 */
function LoopPolator() {}
LoopPolator.prototype.get = function(x) {

    if(x < 0.0) {
        x %= 1.0;
        x = 1.0 + x;

    }else if(1.0 < x) {
        x %= 1.0;
    }

    return x;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 与えられた値をそのまま返すが、0.0-1.0の範囲を行ったり来たりするように振舞う補間器。
 * 任意の範囲の値を受け取り、0.0-1.0の範囲の値を返す。
 */
function PingpongPolator() {}
PingpongPolator.prototype.get = function(x) {

    if(x < 0)
        x *= -1;

    if(2.0 < x)
        x %= 2.0;

    if(1.0 < x)
        x = 2.0 - x;

    return x;
}

// 他の補間器を元にする補間器
//=========================================================================================================

//---------------------------------------------------------------------------------------------------------
/**
 * 他の補間器を元にする補間器の基底クラス。
 */
function WrapperPolator(polator) {

    this.polator = WrapperPolator.normalize(polator);
}

/**
 * 補間器の指定を正規化する。
 *
 * @param   補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 * @return  正規化した結果の補間器。
 */
WrapperPolator.normalize = function(polator) {

    // 補間器が文字列で指定されている場合、インスタンスに変換する。
    if(typeof(polator) == "string") {
        name = this.timing.ucfirst() + "Polator";
        polator = new window[name]();
    }

    return polator;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された補間器が作るXYグラフのX軸方向に縮尺を掛けたグラフで値を返す補間器。
 * たとえば、2.0を掛けたなら、0.3を与えると0.6の時の値が、0.5を与えると1.0の時の値が返る。
 *
 * @param   操作したい補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 * @param   掛ける値。たとえば、二倍に延ばしたいなら2.0を、半分に縮めたいなら0.5を指定する。
 *          マイナスの値を掛けることもできるが、その場合は対象補間器がマイナスの値に対応している必要がある。
 */
function RunPolator(polator, running) {
    WrapperPolator.call(this, polator);

    this.running = running;
}

RunPolator.prototype.get = function(x) {

    return this.polator.get(x / this.running);
}

/**
 * RunPolatorは、分かりやすさを優先して、引数に与えられた値の商で計算しているが、素直に積で計算したい場合は
 * こちらを使う。
 */
function RunPolator2(polator, running) {
    WrapperPolator.call(this, polator);

    this.running = running;
}

RunPolator2.prototype.get = function(x) {

    return this.polator.get(x * this.running);
}

//---------------------------------------------------------------------------------------------------------
/**
 * RunPolatorと同じだが、X軸方向ではなくY軸方向に作用する。
 *
 * @param   操作したい補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 * @param   掛ける値。たとえば、二倍に延ばしたいなら2.0を、半分に縮めたいなら0.5を指定する。
 *          マイナスの値を掛けることもできる。
 */
function RisePolator(polator, rise) {
    WrapperPolator.call(this, polator);

    this.rise = rise;
}

RisePolator.prototype.get = function(x) {

    return this.polator.get(x) * this.rise;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された補間器を逆にたどる補間器。
 * つまり、0が指定されれば1のときの値を、1が指定されれば0のときの値を返す。
 * ちなみに、2を指定した場合は-1のときの値が返る。
 *
 * @param   逆にたどりたい補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 */
function ReversalPolator(polator) {
    WrapperPolator.call(this, polator);
}

ReversalPolator.prototype.get = function(x) {

    x = Math.mirror(x, 0.5);
    return this.polator.get(x);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された補間器が作るXYグラフを [0.5, 0.5] を中心に180度回転したようなグラフで値を返す補間器。
 *
 * @param   180度回転したい補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 */
function InversePolator(polator) {
    WrapperPolator.call(this, polator);
}

InversePolator.prototype.get = function(x) {

    var val = this.polator.get(1.0 - x);
    return 1.0 - val;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定された補間器に対して、別に指定された補間器で減衰をかける補間器。
 * 例えばLinearPolatorで減衰を掛けると、線形的に 0 に収束する補間器になる。
 *
 * @param   操作したい補間器のインスタンスかクラス名。
 *          クラス名を指定する場合は "LinearPolator" なら "linear" とする。
 * @param   減衰係数を得るための補間器。省略時はLinearPolatorが使われる。
 *          この補間器が 0.0 ならそのまま、0.5なら50%減衰した値を、1.0なら 0 を返す。
 */
function DecayPolator(polator, decayer) {
    WrapperPolator.call(this, polator);

    if(decayer == undefined)
        decayer = new LinearPolator();

    this.decayer = WrapperPolator.normalize(decayer);
}

DecayPolator.prototype.get = function(x) {

    // 本来の値。
    var val = this.polator.get(x);

    // 減衰率。
    var decay = this.decayer.get(x);

    return val * (1.0 - decay);
}
