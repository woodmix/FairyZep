
/**
 * ランダムな数値を表すクラス。
 *
 * @param   最小値。
 * @param   最大値。省略すると最小値と同じ、つまりランダムでない数値になる。
 */
function FuzzyValue(min, max) {

    // 最大値省略時は最小値と同じ。
    if(max == undefined)
        max = min;

    this.min = min;
    this.max = max;
}

//---------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。中央値と振れ幅でインスタンスを作成する。
 *
 * @param   中央値
 * @param   振れ幅
 * @return  このクラスのインスタンス。
 */
FuzzyValue.fuzz = function(value, fuzz) {

    return new FuzzyValue(value - fuzz, value + fuzz);
}

//---------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。中央値と振れ幅の割合でインスタンスを作成する。
 *
 * @param   中央値。
 * @param   中央値に対する振れ幅の割合。小数で指定する。
 * @return  このクラスのインスタンス。
 */
FuzzyValue.rate = function(value, rate) {

    return FuzzyValue.fuzz(value, value * rate);
}

//---------------------------------------------------------------------------------------------------
/**
 * 静的メソッド。引数に指定された値をFuzzyValueに統一する。
 *
 * @param   統一したい値。
 * @return  引数に指定されたのが FuzzyValue ならそのまま、そうでないなら FuzzyValue に変換されたもの。
 */
FuzzyValue.cast = function(value) {

    return (value instanceof FuzzyValue) ? value : new FuzzyValue(value);
}

//---------------------------------------------------------------------------------------------------
/**
 * メンバ変数にセットされた範囲のランダム値を返す。
 */
FuzzyValue.prototype.get = function() {

    if(this.min == this.max)
        return this.min;
    else
        return Math.randomRange(this.min, this.max);
}

/**
 * 静的メソッド。引数に指定された値を数値に統一する。
 *
 * @param   統一したい値。
 * @return  引数に指定されたのが数値の場合はそのまま。FuzzyValueならget()で値を取得して返される。
 */
FuzzyValue.get = function(value) {

    return (value instanceof FuzzyValue) ? value.get() : value;
}

//---------------------------------------------------------------------------------------------------
/**
 * メンバ変数にセットされた範囲のランダムな整数値を返す。
 * メンバ変数は整数で指定されていなければならない。
 */
FuzzyValue.prototype.int = function() {

    if(this.min == this.max)
        return this.min;
    else
        return Math.randomInt(this.min, this.max);
}

/**
 * 静的メソッド。引数に指定された値を整数に統一する。
 *
 * @param   統一したい値。
 * @return  引数に指定されたのが数値の場合はそのまま。FuzzyValueならint()で値を取得して返される。
 */
FuzzyValue.int = function(value) {

    return (value instanceof FuzzyValue) ? value.int() : value;
}
