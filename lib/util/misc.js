/**
 * 細かい定義を行うファイル。
 */

"use strict";

// 様々な環境に対応するための初期化や独自属性の処理を行う。
//=========================================================================================================

// console.log がエラーにならないようにする。
if(!console)      console = new Object();
if(!console.log)  console.log = function(){};

// requestAnimationFrameを確実に使えるようにする。
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(function(){
            callback( performance.now() );
        }, 1000/60);
    };

// performance.now() を確実に使えるようにする。
window.performance = window.performance || {
    "now": function() {
        return Date.now();
    },
};

// Fullscreen API のベンダー接頭辞対策。
Element.prototype.requestFullscreen = Element.prototype.requestFullscreen || Element.prototype.mozRequestFullScreen || Element.prototype.webkitRequestFullscreen || Element.prototype.msRequestFullscreen;
document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;

// devicePixelRatio を確実に参照できるようにする。
if(!window.devicePixelRatio)
    window.devicePixelRatio = 1;

// "resize_delayed" イベントの実装。"resize" イベントは一回のリサイズで複数回発生したりと都合が悪いので、
// それを一つにまとめたものとして "resize_delayed" を定義する。
$(window).on("resize", function(){

    // セットして発火待ちならスルー。
    if(window["set_resize_delayed"])
        return;

    // セットフラグをONに。
    window["set_resize_delayed"] = true;

    // 40msタイマーで遅延実行する。
    setTimeout(function(){

        // セットフラグをOFFにしてから、"resize_delayed" の発火。
        window["set_resize_delayed"] = false;
        $(window).trigger("resize_delayed");

    }, 40);
});

// $(document).ready(function(){
//
//     // "oneshot" という属性が付いている要素の click イベントが1回しか発火しないようにする。
//     // 決定ボタンの二度押し防止などに使う。
//     $('[oneshot]').each(function(){
//
//         // オリジナルのonclickを退避して...
//         this.onclick2 = this.onclick;
//
//         // 次の関数を使う。匿名関数にしていないのはメモリ効率のつもり。
//         this.onclick = oneshotOnClick;
//     });
// });
//
// function oneshotOnClick() {
//
//     if(this.oneshotFired)
//         return false;
//
//     this.onclick2();
//     this.oneshotFired = true;
// }


// Object拡張
//=========================================================================================================

/**
 * オブジェクトクラスにプロパティの数を返す count メソッドを追加。
 */
Object.defineProperty(Object.prototype, 'count', {
    enumerable:false,  configurable:false,  writable:true,
    value: function() {
        return Object.keys(this);
    }
});

/**
 * コピーを作成する clone メソッドを追加。
 * 引数はディープコピーかどうか。
 */
Object.defineProperty(Object.prototype, 'clone', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(deep) {

        // 同じ型のクローンを用意する。
        var result = Object.create(this.__proto__);

        for(var k in this) {
            if( this.hasOwnProperty(k) ) {
                if(deep  &&  typeof(this[k]) == "object")
                    result[k] = this[k].clone();
                else
                    result[k] = this[k];
            }
        }

        return result;
    }
});

/**
 * オブジェクトに引数で指定されたオブジェクトの内容をマージする。
 */
Object.defineProperty(Object.prototype, 'merge', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(source) {

        if(source === undefined  ||  source === null)
            return this;
        else
            return Object.assign(this, source);
    }
});

/**
 * 数値キーの順番を保証して取り出す。一応、javascript の規格的にはキーの順番は保証されていないようなので…
 */
Object.defineProperty(Object.prototype, 'indices', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(reverse) {

        var keys = Object.keys(this);

        keys.sort( function(a,b){return a-b} );

        if(reverse)
            keys.reverse();

        return keys;
    }
});

/**
 * キーを引数に指定された通りにたどって子孫要素の値を取得したり設定したりする。
 *
 * @param   たとえば、["abc"]["def"]["ghi"] を取得したいなら "abc.def.ghi" と指定する。
 * @param   対象のプロパティの値を変更したい場合は、変更後の値を指定する。
 * @param   変更を現在の値からの "+=" や "*=" で処理したい場合は "+", "*" を指定する。
 * @return  指定されたプロパティの値。変更した場合は変更前の値。見付からない場合は undefined。
 */
Object.defineProperty(Object.prototype, 'route', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(spec, change, ope) {

        // 引数を "." で区切る。
        var strata = spec.split(".");

        // 最後のキーは取り出しておく。
        var last = strata.pop();

        // 変数 cursor で最後の一つ手前までたどっていく。
        var cursor = this;
        for(var i = 0 ; i < strata.length ; i++) {

            // プリミティブ値から先をたどるのはおかしい…
            if(typeof(cursor) != "object")
                return undefined;

            // たどる。
            cursor = cursor.prop(strata[i]);
        }

        if(typeof(cursor) != "object")
            return undefined;

        // 戻り値を取得。
        var before = cursor.prop(last);

        // 変更が指定されている場合は処理する。
        if(change !== undefined) {
            switch(ope) {
                case "+":   cursor.prop(last, before + change);     break;
                case "*":   cursor.prop(last, before * change);     break;
                default:    cursor.prop(last, change);
            }
        }

        return before;
    }
});

/**
 * 指定されたキーの値を取得・設定する。PHPの offsetGet, offsetSet のようなことがやりたい場合に利用する
 * のだが、呼び出し側がちゃんと prop() でアクセスしてくれないと意味がない...
 *
 * @param   プロパティの名前
 * @param   設定する場合はその値
 * @return  第二引数を省略した場合に、プロパティの値。
 */
Object.defineProperty(Object.prototype, 'prop', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(name, value) {

        if(value === undefined)
            return this[name];
        else
            this[name] = value;
    }
});

/**
 * Object.assign() を保証する。
 */
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
}

/**
 * 孫要素を追加するためのメソッド。
 *
 * 例)
 *      var obj = {
 *          "a": {"a1":"A1"},
 *      }
 *
 *      obj.grandpush("a", "a2", "A2");
 *      // obj はこうなる。
 *      // {
 *      //     "a": {"a1":"A1", "a2":"A2"},
 *      // }
 *
 *      obj.grandpush("b", "b2", "B2");
 *      // obj はこうなる。
 *      // {
 *      //     "a": {"a1":"A1", "a2":"A2"},
 *      //     "b": {"b2":"B2"},
 *      // }
 *
 *      obj.grandpush("c", null, "C1");
 *      obj.grandpush("c", null, "C2");
 *      // obj はこうなる。
 *      // {
 *      //     "a": {"a1":"A1", "a2":"A2"},
 *      //     "b": {"b2":"B2"},
 *      //     "c": ["C1", "C2"],   // 配列になっている
 *      // }
 *
 * @param   第一次元のキー。
 * @param   第二次元のキー。null を指定すると配列要素として追加する。
 * @param   追加したい値。
 */
Object.defineProperty(Object.prototype, 'grandpush', {
    enumerable:false,  configurable:false,  writable:true,
    value: function(index, sub, value) {

        if(sub == null) {

            if(!this[index])
                this[index] = [];

            this[index].push(value);

        }else {

            if(!this[index])
                this[index] = {};

            this[index][sub] = value;

        }
    }
});

/**
 * 例えば次のようなオブジェクトで実行すると...
 *
 *      var a = {
 *          "a": {"hello":"World"},
 *          "b": {"hello":"World"},
 *          "c": "hi",
 *      };
 *
 *      a.embedKey();
 *
 * 次のようになる。
 *
 *      {
 *          "a": {"hello":"World", "key":"a"},
 *          "b": {"hello":"World", "key":"b"},
 *          "c": "hi",
 *      }
 */
Object.defineProperty(Object.prototype, 'embedKey', {
    enumerable:false,  configurable:false,  writable:true,
    value: function() {
        for(var i in this) {
            if(typeof(this[i]) == "object")
                this[i]["key"] = i;
        }
        return this;
    }
});


// String拡張
//=========================================================================================================

// toLowerCase() と toUpperCase() って、ブラウザーのロケーション設定がトルコだと一般的でない動作をするらしい。
//      http://qiita.com/niusounds/items/fff91f3f236c31ca910f
// …ので、保証する。
if('i' !== 'I'.toLowerCase()) {

    String.prototype.toLowerCase = function() {
        return this.replace(/[A-Z]/g, function(ch){return String.fromCharCode(ch.charCodeAt(0) | 32)});
    };

    String.prototype.toUpperCase = function() {
        return s.replace(/[a-z]/g, function(ch){return String.fromCharCode(ch.charCodeAt(0) & ~32)});
    };
}

/**
 * 引数で指定された長さのランダム文字列を返す。
 *
 * @param   ほしい文字列の長さ。省略した場合は8。
 */
String.random = function(length) {

    // 引数省略時の対応。
    if(length == undefined)
        length = 8;

    // とりあえず8文字生成。
    // ネットでは Math.random().toString(36).substr(-8) というのがよくあるが、1000回試行すると10個以上は
    // 重複する。末尾じゃなくて先頭側を使うとだいぶ軽減される。
    var result = Math.random().toString(36).substr(2, 8);

    // 長さが足りない場合は再帰して対処。余る場合はカットする。
    if(result.length < length)
        result += String.random(length - result.length);
    else if(length < result.length)
        result = result.substr(0, length);

    return result;
}

/**
 * 先頭文字のみを大文字化した文字列を返す。
 */
String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * 引数で指定された配列の中にこの文字列と同じ値があるかどうかを返す。
 */
String.prototype.existsIn = function(collection) {

    // toString() しとかないとうまく動作しない。オブジェクトとしてのStringとプリミティブString型で違いがあるのだろう。
    return collection.includes( this.toString() );
};

/**
 * printf() と同様に文字埋め込みを行う。
 *
 * 例)
 *      var ret = "%05d is %s. %d is %s.".format(100, "hundred", 5, "five");
 *      // ret = "00100 is hundred. 5 is five."
 *
 * …と言っても、対応しているのは %s, %d, %0Nd, %f, %.Nf, %% のみ。
 */
String.prototype.format = function() {

    // 指定された引数を取っておく。
    var args = arguments;

    // カウンタ変数初期化。
    var count = -1;

    // 置き換え文字列にマッチする正規表現で置き換え処理。
    return this.replace(/%\.?(\d+)?([\w%])/g, function(match, p1, p2){

        count++;

        if(args[count] == undefined  ||  args[count] == null)
            return args[count];

        switch(p2) {

            case "s":
                return args[count];

            case "d":
                if(p1 == undefined)
                    return args[count].toFixed();
                else
                    return ("0".repeat(p1) + args[count].toFixed()).slice(-p1);

            case "f":
                if(p1 == undefined)
                    return args[count];
                else
                    return args[count].toFixed(p1);

            case "%":
                return "%";

            default:
                return match;
        }
    })
}

/**
 * startsWith() を保証する。
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

/**
 * endsWith() を保証する。
 */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

/**
 * repeat() を保証する。
 */
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        return Array( parseInt(count) + 1 ).join(this);
    };
}


// Array拡張
//=========================================================================================================

/**
 * 全要素の値の合計を返す。
 */
Array.prototype.sum = function() {

    var total = 0;

    for(var i = 0 ; i < this.length ; i++) {
        if(this[i] != undefined)
            total += this[i];
    }

    return total;
}

/**
 * 全要素の値の平均を返す。
 */
Array.prototype.average = function() {

    return this.sum() / this.length;
}

/**
 * pop() に引数を一つ取れるようにして、引数が指定された場合は指定されたインデックスの要素に対して
 * 働くものとする。
 */
Array.prototype.pop_org = Array.prototype.pop;
Array.prototype.pop = function(index) {

    // 引数が指定されていないならオリジナルの pop() を呼ぶ。
    if(index == undefined)
        return this.pop_org();

    // 指定されているなら、その要素を取り出すとともに削除する。
    var ret = this.splice(index, 1);

    // 取り出した値をリターン。
    return ret[0];
}

/**
 * 指定された要素を探して、そのインデックス値を返す。
 * 見付からない場合は -1 を返す。
 */
Array.prototype.search = function(target) {

    return this.findIndex(function(predicate){
        return predicate == target;
    });
}

/**
 * 要素をランダムに一つ取り出す。
 */
Array.prototype.random = function() {

    // 要素が一つもない場合は undefined を返す。
    if(this.length == 0)
        return undefined;

    // 要素番号をランダムに一つ選択。
    var index = Math.randomInt(0, this.length - 1);

    // 選択した値をリターン。
    return this[index];
}

/**
 * 要素をランダムに一つ取り出して、その要素を削除する。
 */
Array.prototype.popRandom = function() {

    // 要素が一つもない場合は undefined を返す。
    if(this.length == 0)
        return undefined;

    // 要素番号をランダムに一つ選択。
    var index = Math.randomInt(0, this.length - 1);

    // 選択した値をリターン。
    return this.pop(index);
}

/**
 * indexOf() を保証する。
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";

    if (this == null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = 0;

    if (arguments.length > 0) {
      n = Number(arguments[1]);

      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
         n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    if (n >= len) {
      return -1;
    }

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}

/**
 * includes() を保証する。
 */
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        return this.indexOf(searchElement, arguments[1]) >= 0;
    };
}

/**
 * findIndex() を保証する。
 */
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

/**
 * find() を保証する。
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    var index = this.findIndex(predicate, arguments[1]);
    return (index >= 0) ? this[index] : undefined;
  };
}


// Date拡張
//=========================================================================================================

/**
 * 引数に与えられた日時文字列を Date 型に変換する。Dateコンストラクタと似ているが、アプリで標準的に
 * 扱っている "YYYY-MM-DD hh:mm:ss" 形式の日付を iOS でも確実に解析できるようにする。
 *
 * @param   日時を表す文字列。
 * @return  Date型の値。
 */
Date.generate = function(datetime) {

    if( datetime  &&  datetime.match(/^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/) )
        datetime = datetime.replace(" ", "T") + "+09:00";

    return new Date(datetime);
}

/**
 * 日付を引数で指定されたフォーマットで返す。
 *
 * @param   フォーマット文字列。今のところ、以下の文字列が変換される。
 *              YYYY, YY, MM, DD, hh, mm, ss, S(ミリ秒)
 * @return  フォーマット後の文字列。
 */
Date.prototype.format = function(format) {

    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';

    format = format.replace( /YYYY/g, this.getFullYear() );
    format = format.replace( /YY/g, this.getFullYear().toString().slice(-2) );
    format = format.replace( /MM/g, ('0' + (this.getMonth() + 1)).slice(-2) );
    format = format.replace( /M/g,  this.getMonth() + 1 );
    format = format.replace( /DD/g, ('0' + this.getDate()).slice(-2) );
    format = format.replace( /D/g,  this.getDate() );
    format = format.replace( /hh/g, ('0' + this.getHours()).slice(-2) );
    format = format.replace( /h/g, this.getHours() );
    format = format.replace( /mm/g, ('0' + this.getMinutes()).slice(-2) );
    format = format.replace( /m/g, this.getMinutes() );
    format = format.replace( /ss/g, ('0' + this.getSeconds()).slice(-2) );
    format = format.replace( /s/g, this.getSeconds() );

    if (format.match(/S/g)) {
        var milliSeconds = ('00' + this.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace( /S/, milliSeconds.substring(i, i + 1) );
    }

    format = format.replace( /W/g, '日月火水木金土'[this.getDay()] );

    return format;
}


// Math拡張
//=========================================================================================================

Math.PI45 = Math.PI / 4;
Math.PI90 = Math.PI / 2;
Math.PI180 = Math.PI;
Math.PI270 = Math.PI * 1.5;
Math.PI360 = Math.PI * 2;

/**
 * 指定された範囲内のランダム値(小数)を返すメソッドを追加。
 * 第三引数にtrueを指定すると符号もランダムになる。
 */
Math.randomRange = function(min, max, sign) {

    var ret = Math.random() * (max - min) + min;

    if(sign  &&  Math.random() < 0.5)
        ret *= -1;

    return ret;
}

/**
 * 同じく、ランダム整数を返すメソッドを追加。返される値にはmaxの値も含まれる。
 */
Math.randomInt = function(min, max, sign) {

    var ret = Math.floor( Math.randomRange(min, max + 1) );

    if(sign  &&  Math.random() < 0.5)
        ret *= -1;

    return ret;
}

/**
 * 指定された値を中心に、指定された上下幅の数をランダムで返す。
 * たとえば中心に100、幅に10を指定したなら、90～110の値が返る。
 *
 * @param   中心となる値。
 * @param   幅。
 * @return  指定された範囲内のランダムな値。
 */
Math.randomFuzz = function(base, fuzz) {

    return base + this.randomRange(-fuzz, fuzz);
}

/**
 * randomFuzz() と同じだが、第二引数を割合で指定する点が異なる。
 *
 * 例)
 *      var ret = Math.swingRandom(100, 0.1);   // 90～110 の値を返す。
 *      var ret = Math.swingRandom(200, 0.2);   // 160～240 の値を返す。
 *
 * @param   中心となる値。
 * @param   第一引数に対する幅の割合。小数で指定する。
 * @return  指定された範囲内のランダムな値。
 */
Math.randomSwing = function(base, rate) {

    var fuzz = Math.abs(base * rate);

    return Math.randomFuzz(base, fuzz);
}

/**
 * 指定された配列から、指定された重み付けで要素を一つ選び、そのキーを返す。
 * 例えば、次のような連想配列を指定したとき...
 *     {
 *         'alpha': 10,
 *         'beta': 15,
 *         'gamma': 20,
 *     }
 * 次のような確率で値が返る。
 *     'alpha'    10 / (10 + 15 + 20)
 *     'beta'     15 / (10 + 15 + 20)
 *     'gamma'    20 / (10 + 15 + 20)
 *
 * @param   キーを戻り値、値を重みとする連想配列
 * @return  的中した要素のキー
 */
Math.weightedDraw = function(drops) {

    // 重みの合計を求める
    var total = 0;
    for(var k in drops)
        total += drops[k];

    // 合計が変なのはカラ配列とか考えられるので、nullリターン。
    if(total == 0)
        return null;

    // 1～合計値でランダム値を取得。
    pick = Math.randomInt(1, total);

    // ランダムにしたがって値を一つ返す。
    for(var k in drops) {

        if(pick <= drops[k])
            return k;

        pick -= drops[k];
    }

    // ここに来るのはエラー。
    throw 'ここに制御は来ないはず';
}

/**
 * 引数で与えられた値と同じ符号を持つ絶対値 1 の値を返す。
 * 0 が与えられた場合は 0 を返す。
 */
Math.sign = function(num) {

    if(num < 0)  return -1;
    if(num > 0)  return +1;
    return 0;
}

/**
 * 引数で与えられた値を、与えられたピボットで反転した値を返す。
 * 例)
 *     var x = Math.mirror(5, 10);   // 15
 *     var x = Math.mirror(8, 10);   // 12
 *     var x = Math.mirror(-3, 10);  // 23
 */
Math.mirror = function(num, pivot) {

    return num + (pivot - num) * 2;
}

/**
 * 指定された開始から終了までの値で、指定された進捗率における値を返す。
 *
 * @param   開始値
 * @param   終了値
 * @param   進捗率。0.0 ～ 1.0。
 * @return  指定された進捗率における値。
 */
Math.lerp = function(start, end, t) {

    return (end - start) * t + start;
}

/**
 * 引数で与えられた単位で切り捨てを行う。
 * つまり、第二引数の倍数のうち、第一引数以下の最大値を返す。
 * 第二引数を負で指定した場合、その絶対値の倍数のうち、第一引数以上の最小値を返す。
 *
 * 例)
 *     var x = Math.step(10, 3);   // 9
 *     var x = Math.step(20, 3);   // 18
 *     var x = Math.step(21, 3);   // 21
 *     var x = Math.step(-10, 3);  // -12
 *     var x = Math.step(10, -3);  // 12
 */
Math.step = function(num, width) {

    return Math.floor(num / width) * width;
}

/**
 * 指定された範囲のループにおける、指定された値の位置を返す。
 * 例) 2-5 の範囲のループにおける、各値の位置。
 *     var x = Math.loop(0, 5, 2);      // 3
 *     var x = Math.loop(1, 5, 2);      // 4
 *     var x = Math.loop(2, 5, 2);      // 2
 *     var x = Math.loop(3, 5, 2);      // 3
 *     var x = Math.loop(4, 5, 2);      // 4
 *     var x = Math.loop(5, 5, 2);      // 2
 *     var x = Math.loop(6, 5, 2);      // 3
 *
 * @param   ループ位置を求めたい値。
 * @param   ループ終端値
 * @param   ループ始端値。省略時は 0。
 */
Math.loop = function(num, end, start) {

    // 始端省略時は 0。
    if(start === undefined)
        start = 0;

    // ループの幅を求める。
    var width = end - start;

    // ループ始端をゼロとして解を求める。
    var d = (num - start) % width;
    if(d < 0)
        d += width;

    // 始端を戻してリターン。
    return start + d;
}

/**
 * 指定された角度が、指定された範囲にあるかどうかを返す。
 * 0～360の範囲外の角度が混在指定も正しく判定するが、始端と終端の指定方法には留意が必要となる。
 * たとえば、角度360°を判定している場合、次のようになる。
 *      正向・正順  -90～+90    ⇒ true
 *      逆向・正順  +90～-90    ⇒ true
 *      正向・逆順  +90～270    ⇒ false
 *      逆向・逆順  270～+90    ⇒ false
 * ここでは度数で説明したが、引数はすべてラジアンで指定すること。
 * 一周を超えているような範囲指定は想定していないので注意。
 *
 * @param   判定したい角度。
 * @param   始端角度。
 * @param   終端角度。
 * @return  範囲内ならtrue、範囲外ならfalse。始端と同じならtrueと評価されるが、終端と同じなのはfalseと
 *          される。
 */
Math.inAngle = function(angle, begin, end) {

    // まずは正向かどうかを取得。正向ならtrue。
    var dir = begin < end;

    // 指定角度をすべて正規化。
    angle = Math.loop(angle, Math.PI360);
    begin = Math.loop(begin, Math.PI360);
    end = Math.loop(end, Math.PI360);

    // 始端と同じケースをまずはカットしておく。
    if(angle == begin)
        return true;

    // 正順かどうかを取得。正順ならtrue。
    var order = begin < end;

    // 範囲角度の大小を取る。
    var min = Math.min(begin, end);
    var max = Math.max(begin, end);

    // その範囲にあるかどうかを取得。
    var inside = (min < angle)  &&  (angle < max);

    // 範囲内か、向き、順によって戻り値が決まる。
    return inside ^ dir ^ order;
}

/**
 * ラジアンを度数に直す。
 */
Math.degree = function(radian) {

    return radian / Math.PI * 180;
}


// CanvasRenderingContext2D拡張
//=========================================================================================================

/**
 * drawImage() を引数7つでも呼べるようにする。
 */
CanvasRenderingContext2D.prototype._drawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {

    var args = Array.apply(null, arguments);

    if(dy != undefined  &&  dw == undefined) {
        args.push(sw);
        args.push(sh);
    }

    this._drawImage.apply(this, args);
}

/**
 * 指定された座標を中心点として画像を描画する。サイズを省略した場合はイメージから自動取得。
 */
CanvasRenderingContext2D.prototype.drawImageC = function(image, dx, dy, dw, dh) {

    if(dw == undefined) {
        dw = image.width;
        dh = image.height;
    }

    dx -= dw >> 1;
    dy -= dh >> 1;
    this.drawImage(image, dx, dy, dw, dh);
}


// Audio拡張
//=========================================================================================================

// AudioContext を統一的に使えるようにする。
window.AudioContext = window.AudioContext || window.webkitAudioContext || NullAudio;

// そのインスタンスを作成しておく。
AudioContext.instance = new AudioContext();

/**
 * 引数に指定された範囲をループするようにする。
 *
 * @param   ループ終端の時間。
 * @param   ループ始端の時間。省略時は0秒。
 */
Audio.prototype.setLoop = function(until, since) {

    this.loopUntil = until;
    this.loopSince = since || 0;
    this.addEventListener("timeupdate", Audio.watchLoop, false);
    this.addEventListener("ended", Audio.watchLoop, false);
}

/**
 * setLoop() で使われるイベントリスナ。
 */
Audio.watchLoop = function(event) {

    if(this.loopUntil <= this.currentTime)
        this.currentTime = this.loopSince + (this.currentTime - this.loopUntil);

    if(event.type == "ended")
        this.play();
}


// location拡張
//=========================================================================================================

/**
 * ●第一引数のみを指定する場合
 *
 *      引数で指定されたGET変数の値を返す。引数を指定しなかった場合はすべてのGET変数を返す。
 *
 * ●第一, 第二引数を指定する場合
 *
 *      第一引数で指定されたGET変数の値を、第二引数で指定された値に一時的に書き直す。
 */
location.query = function(name, value) {

    // メンバ変数 params にデコード結果を保存する。
    if(!this.params)
        this.params = this.parse();

    if(value == undefined)
        return (name == undefined) ? this.params : this.params[name];
    else
        this.params[name] = value;
}

/**
 * 引数で指定されたクエリ文字列を解析して返す。
 * 引数を指定しなかった場合は location.search を解析する。
 */
location.parse = function(search) {

    if(search == undefined)
        search = this.search.substring(1);

    var params = {};

    var pairs = search.split('&');
    for(var i = 0, entry ; entry = pairs[i] ; i++) {

        var kv = entry.split('=');
        params[ kv[0] ] = decodeURIComponent(kv[1]);
    }

    return params;
}


// Storage拡張
//=========================================================================================================

/**
 * 現在の値を全て取得する。
 *
 * @param   現在保持している全てのキーと値を含む構造体。
 */
Storage.prototype.getAll = function() {

    var result = {};

    for(var i = 0 ; i < this.length ; i++) {
        var name = this.key(i);
        result[name] = this.getItem(name);
    }

    return result;
}
