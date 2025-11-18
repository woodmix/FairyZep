
/**
 * イメージ・サウンドファイルなどのロードを管理するシングルトンクラス。
 */
Resources = {}

// 管理しているリソースの連想配列。
Resources.items = {};

// ロード中リソースのキー一覧。
Resources.loadings = {};

// load() などで要求されたリソースの読み込みがすべて完了したら起動するイベント。
Resources.onComplete = new Delegate();

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたリソースをロードする。
 *
 * @param   リソースのパス。
 * @param   リソースの種別。"image", "se", "bgm" のいずれか。省略した場合は拡張子から決定される。
 * @param   ロードしたリソースを参照するキー。省略した場合はパスに含まれるファイルベース名が使われる。
 *          すでに使っているキーを指定した場合は呼び出しを無視する。
 */
Resources.load = function(path, type, name) {

    if(type == undefined  ||  name == undefined)
        var info = this.getPathInfo(path);

    // キーが省略されている場合はパスから取得。
    if(name == undefined)
        name = info[0];

    // すでに使っている場合は差し替える。
    if(this.items[name])
        this.remove(name);

    // 種別が省略されている場合はパスの拡張子から推理。
    if(type == undefined) {

        switch( info[1].toLowerCase() ) {
            case ".bmp":  case ".jpg":  case ".png":  case ".gif":  case ".svg":
                type = "image";
                break;
            case ".wav":
                type = "se";
                break;
            case ".mp3":  case ".ogg":
                type = "bgm";
                break;
        }
    }

    // 種別にしたがってロード。
    switch(type) {
        case "image":
            this.items[name] = this.loadImage(path);
            break;
        case "se":
            this.loadSe(path, name);
            this.items[name] = "se";
            break;
        case "bgm":
            this.items[name] = this.loadBgm(path);
            break;
        default:
            throw "リソース種別が不明です。path(" + path + "), name(" + name + "), type (" + type + ")";
    }

    //
    this.loadings[name] = 1;
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたリソースをすべてロードする。
 *
 * @param   リソースのパス。複数指定可能。
 */
Resources.loadAll = function() {

    for(var i = 0 ; i < arguments.length ; i++)
        this.load(arguments[i]);
}

//---------------------------------------------------------------------------------------------------
/**
 * ダミーのロードロジックを起動して、完了イベントをチェックする。
 * ロードするリソースがあるかどうか分からない状態で onComplete イベントをセットしているときに、
 * 結果的に何もロードしなかった場合でもイベントを起動したいときに呼ぶ。
 */
Resources.loadDummy = function() {

    // 遅延後、完了チェックするようにする。
    window.setTimeout(function(){
        Resources.check();
    }, 0);
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたキーのリソースを返す。
 *
 * @param   リソースのキー。
 * @return  指定されたキーのリソース。<img> や <audio>、AudioBuffer など。
 */
Resources.get = function(name) {

    return this.items[name];
}

//---------------------------------------------------------------------------------------------------
/**
 * get() と同じだが、指定されたリソースがない場合にエラーを投げる。
 *
 * @param   リソースのキー。
 * @return  指定されたキーのリソース。<img> や <audio>、AudioBuffer など。
 */
Resources.need = function(name) {

    var res = this.get(name);

    if(!res)
        throw '指定されたリソース "' + name + '" がありません。';

    return res;
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたキーのリソースを削除する。
 *
 * @param   削除したいリソースのキー。
 */
Resources.remove = function(name) {

    delete this.items[name];
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたイメージをロードする。
 *
 * @param   パス
 * @return  Imageオブジェクト。
 */
Resources.loadImage = function(path) {

    var image = new Image();
    image.src = path;
    image.onload = this.ready;
    image.onerror = this.error;

    return image;
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたSEをロードする。
 * XMLHttpRequest で取得するのでドメインの制約にかからない必要がある。
 * 得られるオブジェクトは AudioBuffer だが、直ちには得られないので、戻り値としては返らないことに注意。
 *
 * @param   パス
 * @param   ロードしたリソースを参照するキー。
 */
Resources.loadSe = function(path, name) {

    // リクエスト。
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {

        // エラー時は…
        if(parseInt(this.status / 100) != 2) {
            console.log(this.responseURL + " の読込に失敗しました。");
            delete Resources.items[name];
            delete Resources.loadings[name];
            Resources.check();
        }

        // リクエストが完了したらデコードして AudioBuffer を得る。
        AudioContext.instance.decodeAudioData(this.response, function(buffer){
            Resources.items[name] = buffer;
            Resources.ready.call(buffer);
        });
    }

    request.send();
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたオーディオをロードする。
 * モバイル系端末のブラウザではユーザイベント(onclickとか)の中でないと play() が効かないので注意。
 * ちなみに iOS系(10) では、タブを切り替えようがブラウザがバックグラウンドになろうが、タブを閉じない
 * 限り鳴り続ける(！)
 *
 * @param   パス
 * @return  Audioオブジェクト。
 */
Resources.loadBgm = function(path) {

    var audio = new Audio(path);

    audio.load();
    audio.addEventListener("canplaythrough", this.ready, false);

    return audio;
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたパスからファイルのベース名と拡張子を返す。
 *
 * @param   パス
 * @return  第0要素にベース名、第1要素に拡張子を含む配列。
 */
Resources.getPathInfo = function(path) {

    var match = /([^\/]+?)(\.\w+)?(?=\?|$)/.exec(path);
    return Array(match[1], match[2]);
}

//---------------------------------------------------------------------------------------------------
/**
 * リソースが一つロードされたら呼ばれる。
 * thisはロードされたリソースを表していることに注意。
 */
Resources.ready = function() {

    // Audioの canplaythrough はなんか知らんが複数回実行されるときがある…
    if(this instanceof Audio)
        this.removeEventListener("canplaythrough", Resources.ready, false);

    Resources.finish(this);
}

//---------------------------------------------------------------------------------------------------
/**
 * リソースのロードが一つ失敗したら呼ばれる。今のところ Image のみ。
 * thisはロードされたリソースを表していることに注意。
 */
Resources.error = function(arg) {

    console.log(this.src + " の読込に失敗しました。");

    Resources.finish(this);
}

//---------------------------------------------------------------------------------------------------
/**
 * 引数で指定されたリソースのロード処理が終了(完了orエラー)したら呼ばれる。
 */
Resources.finish = function(finished) {

    // 何のキーで管理しているリソースなのかを調べて...
    for(var i in Resources.items) {
        if(Resources.items[i] == finished) {

            // 該当のキーのローディングフラグを削除、完了チェックする。
            delete Resources.loadings[i];
            Resources.check();
        }
    }
}

//---------------------------------------------------------------------------------------------------
/**
 * ロード済みの数をチェックして、すべて完了していたらイベントを起動する。
 */
Resources.check = function() {

    // すべてロードしたら onComplete を起動する。
    if(this.loadings.count() == 0)
        this.onComplete.trigger();
}
