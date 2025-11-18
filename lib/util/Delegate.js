
/**
 * C#のデリゲートみたいなもん。registerで登録して、起動するときはtrigger。
 */
function Delegate() {

    this.callbacks = [];
}

//---------------------------------------------------------------------------------------------------------
/**
 * コールバックを登録する。
 *
 * @param   コールバック関数。thisや追加の引数が必要な関数は標準の bind() を使うと良い。
 *          同じ関数オブジェクトを複数登録した場合は未定義。
 * @param   ワンショットフラグ。true を指定すると起動された後に登録が解除される。
 */
Delegate.prototype.register = function(func, oneshot) {

    func.delegate_oneshot = oneshot;
    this.callbacks.push(func);
}

//---------------------------------------------------------------------------------------------------------
/**
 * コールバックの登録を解除する。
 */
Delegate.prototype.unregister = function(func) {

    for(var i = 0, callback ; callback = this.callbacks[i] ; i++) {
        if(callback == func) {
            this.callbacks.splice(i, 1);
            break;
        }
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * 登録されているコールバックをコールする。
 * 引数にはコールバックに渡したい引数を指定する。
 */
Delegate.prototype.trigger = function() {

    // 保持しているリスナー配列を取り出して、新しく張り替えておく。ついでにワンショットフラグを見ておく。
    // 張り替えておかないと、コールバックの中で新たに登録されたものが即座にコールされてしまう。
    var callbacks = this.callbacks;
    this.callbacks = [];
    for(var i = 0, callback ; callback = callbacks[i] ; i++) {
        if(!callback.delegate_oneshot)
            this.callbacks.push(callback);
    }

    // 取り出したリスナー配列を元にコールを行う。
    for(var i = 0, callback ; callback = callbacks[i] ; i++)
        callback.apply(null, arguments);
}
