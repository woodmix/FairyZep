
/**
 * 音を管理するためのシングルトンクラス。
 * sound() でSEを、play() でBGMを鳴らす。BGMは同時に一つしか鳴らすことができない。
 *
 * 例) SEの設定音量を 0.6 にする。
 *      AudioSequencer.segain.gain.value = 0.6;
 *
 * 例) プログラム上の演出として、特定のSEの音量を操作する。
 *      ※これはまだ未実装。sound() の引数で音量を指定できるようにするのが適切か…
 *
 * 例) BGMの設定音量を 0.6 にする。
 *      AudioSequencer.bgmvol = 0.6;
 *      AudioSequencer.update();
 *
 * 例) BGMのプログラム音量を 0.4 にする。
 *      AudioSequencer.playvol = 0.4;
 *      AudioSequencer.update();
 *      // あるいは play() 時に指定する。
 *
 * 例) ミュートをONにする。
 *      AudioSequencer.mute(true);
 *      // ミュート中はサウンド処理を行わないようになっているので、ミュート中に play() ⇒ ミュート解除
 *      // としてもBGMは復帰しない。
 *      // これは、ミュートモードなら音ファイル自体のダウンロードをスキップすることを考えているため。
 *      // アプリ側でミュート解除時に「場面転換などするまで反映されない」旨を説明する必要がある。
 *
 * SEは WebAudio API を、BGMは <audio> を利用している。いずれはBGMも WebAudio API の MediaElementAudioSourceNode
 * を利用するようにしたいが、モバイル端末はまだ対応していないっぽい…鳴るには鳴るのだが、ゲイン調整効いてないし…多分。(2016/12/27)
 */
var AudioSequencer = {};

(function(){

    // ミュートされているかどうか。
    this.muteFlag = false;

    // SEのゲインを調整出来るようにする。
    this.segain = AudioContext.instance.createGain();
    this.segain.connect(AudioContext.instance.destination);

    // BGMの設定ボリュームとプレイボリューム。0.0-1.0。この二つを掛けた値が実際のボリュームになる。
    // 更新したら update() を呼ばないと反映されない。
    // 将来的には GainNode を使うことになるだろう。
    this.bgmvol = 1.0;
    this.playvol = 1.0;

    // 現在演奏中のBGM(Audioインスタンス)。
    this.bgm = undefined;

}).call(AudioSequencer);

//---------------------------------------------------------------------------------------------------------
/**
 * 指定されたSEを鳴らす。40ms(60fpsにおける2.5フレーム)以内に同じ音を鳴らそうとしても無視するので留意。
 *
 * @param   AudioBufferオブジェクトか、それを指す Resources のキー名。
 * @return  再生のために作成した AudioBufferSourceNode オブジェクト。
 * 			このオブジェクトのstop()を呼び出すことでSEを途中で止めることが出来る。
 */
AudioSequencer.sound = function(buffer) {

    // ミュートされている場合は処理しない。
    if(this.muteFlag)
        return;

    // 文字列で指定されている場合は、それをキー名として Resources から取得する。
    if(typeof(buffer) == "string")
        buffer = Resources.need(buffer);

    // 前回鳴らした時刻よりも前なら無視する。
    var now = performance.now();
    if(now < buffer.previousTime + 40)
        return;

    // 鳴らす。
    var source = AudioContext.instance.createBufferSource();
    source.buffer = buffer;
    source.connect(this.segain);
    source.start(0);

    // 前回鳴らした時刻を持っておく。
    buffer.previousTime = now;

    return source;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 指定されたBGMを鳴らす。すでに鳴っているBGMはストップするので留意。
 * モバイル系端末のブラウザではユーザイベント(onclickとか)の中でないと効かないので注意。
 *
 * @param   Audioオブジェクトか、それを指す Resources のキー名。
 * @param   ループする場合はループ範囲終端の時間位置。省略時はメディア終端。
 *          ループさせたくない場合は 0 か false を指定する。
 * @param   ループする場合はループ範囲始端の時間位置。省略時は 0。
 * @param   ボリューム。0.0-1.0。省略時は 1.0。
 */
AudioSequencer.play = function(music, until, since, volume) {

    // 現在演奏中のBGMがある場合はストップする。
    this.stop();

    // ミュートされている場合は処理しない。
    if(this.muteFlag)
        return;

    // 文字列で指定されている場合は、それをキー名として Resources から取得する。
    if(typeof(music) == "string")
        music = Resources.need(music);

    // 現在演奏中のBGMとして保持しておく。
    this.bgm = music;

    // ボリュームをセット。
    if(volume == undefined)
        volume = 1.0;

    this.playvol = volume;
    this.update();

    // 先頭から鳴らす。
    music.currentTime = 0.0;
    music.play();

    // ループ終端が省略されている場合はメディア終端。
    if(until == undefined)
        until = music.duration;

    // ループが指定されているならセットする。
    if(until)
        music.setLoop(until, since);
}

/**
 * 現在鳴っているBGMをストップする。
 */
AudioSequencer.stop = function() {

    this.pause();
    this.bgm = undefined;
}

//---------------------------------------------------------------------------------------------------------
/**
 * 現在鳴っているBGMをポーズ・続行する。
 */
AudioSequencer.pause = function() {

    if(this.bgm)
        this.bgm.pause();
}

AudioSequencer.continue = function() {

    if(this.bgm)
        this.bgm.play();
}

//---------------------------------------------------------------------------------------------------------
/**
 * BGMボリュームの変更を反映する。
 */
AudioSequencer.update = function() {

    if(this.bgm)
        this.bgm.volume = this.playvol * this.bgmvol;
}

//---------------------------------------------------------------------------------------------------------
/**
 * ミュートの状態を変更する。
 *
 * @param   ミュートにするなら true、解除するなら false。
 */
AudioSequencer.mute = function(muteFlag) {

    this.muteFlag = muteFlag;

    if(this.bgm)
        muteFlag ? this.pause() : this.continue();
}
