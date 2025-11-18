
// 風船の出現位置の定義を保持するオブジェクト。
var Plot = {};

// 出現位置の配列。
Plot.pins = undefined;

//---------------------------------------------------------------------------------------------------------
/**
 * ステージの終端Ｘ座標を返す。
 */
Plot.getEnd = function() {

    // 最後のピンより少し後の位置とする。
    return this.pins[ this.pins.length - 1 ].x + 500;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 風船出現位置配列を初期化する。
 */
Plot.initialize = function() {

    var CASCADE = 200;      // 風船を連続配置するときのX間隔
    var CASC = 100;         // 同様だが、より密接に配置するときの間隔
    var PAUSE = 300;        // グループごとのX間隔
    var PITCH = 100;        // 登ったり下ったりするときのY間隔
    var FAN = 200;          // 散開配置するときの X, Y 間隔

    var result = [];

    // 開始点。やや下
    var cursor = new Point(500, 1500);
    result.push( cursor.clone() );

    // 登る3
    cursor.x += PAUSE;          cursor.y -= 300;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );

    // 下る3
    cursor.x += PAUSE;          cursor.y += 200;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );

    // 登る5
    cursor.x += PAUSE;          cursor.y -= 200;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= PITCH;          result.push( cursor.clone() );

    // 下る5
    cursor.x += PAUSE;          cursor.y += 200;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y += PITCH;          result.push( cursor.clone() );

    // 水平3
    cursor.x += PAUSE;          cursor.y += 200;            result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );

    // 水平3
    cursor.x += PAUSE;          cursor.y -= 300;            result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );

    // 水平3
    cursor.x += PAUSE;          cursor.y += 500;            result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );
    cursor.x += CASCADE;                                    result.push( cursor.clone() );

    // 山5
    cursor.x += PAUSE;          cursor.y -= 300;            result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );

    // 逆山5
    cursor.x += PAUSE;          cursor.y += 300;            result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );

    // 縦3
    cursor.x += PAUSE;          cursor.y -= 300;            result.push( cursor.clone() );
                                cursor.y -= PITCH;          result.push( cursor.clone() );
                                cursor.y -= PITCH;          result.push( cursor.clone() );

    // 下に縦3
    cursor.x += PAUSE;          cursor.y += 300;            result.push( cursor.clone() );
                                cursor.y += PITCH;          result.push( cursor.clone() );
                                cursor.y += PITCH;          result.push( cursor.clone() );

    // 水平3-登り5-水平2
    cursor.x += PAUSE;          cursor.y += 300;            result.push( cursor.clone() );
    cursor.x += CASC;                                       result.push( cursor.clone() );
    cursor.x += CASC;                                       result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;                                       result.push( cursor.clone() );
    cursor.x += CASC;                                       result.push( cursor.clone() );

    // 下る3
    cursor.x += PAUSE;          cursor.y += 300;            result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );

    // 山10
    cursor.x += PAUSE;          cursor.y -= 300;            result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y -= PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );
    cursor.x += CASC;           cursor.y += PITCH;          result.push( cursor.clone() );

    // 散開10
    cursor.x += PAUSE;          cursor.y -= FAN;            result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y -= FAN*2;          result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y += FAN;            result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y += FAN+2;          result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y -= FAN*2;          result.push( cursor.clone() );
                                cursor.y += FAN;            result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y -= FAN*2;          result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y += FAN*3;          result.push( cursor.clone() );
                                cursor.y -= FAN;            result.push( cursor.clone() );
    cursor.x += FAN;            cursor.y -= FAN*2;          result.push( cursor.clone() );

    // 上・下単発6段々広く
    cursor.x += PAUSE;          cursor.y += 300;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= 300;            result.push( cursor.clone() );
    cursor.x += PAUSE;          cursor.y += 400;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= 400;            result.push( cursor.clone() );
    cursor.x += PAUSE;          cursor.y += 500;            result.push( cursor.clone() );
    cursor.x += CASCADE;        cursor.y -= 500;            result.push( cursor.clone() );

    // ランダム100
    cursor.x += PAUSE;

    for(var i = 0 ; i < 100 ; i++) {
        result.push(new Point(
            cursor.x + Math.randomInt(0, 1500),
            cursor.y + Math.randomInt(-800, +800)
        ));
    }

    // 終了点
    cursor.x += 1500;                                       result.push( cursor.clone() );

    // X座標昇順になるように並べ替える。
    result.sort(function(a, b){
        return a.x - b.x;
    });

    Plot.pins = result;
}

Plot.initialize();
