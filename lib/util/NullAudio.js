
/**
 * AudioContext が使えない場合のダミークラス。
 */
function NullAudio() {
}

NullAudio.prototype.decodeAudioData = function(buffer, callback) {
    callback(new Object());
};

NullAudio.prototype.createGain = function() {

    return {
        "connect": function(){},
    };
};

NullAudio.prototype.createBufferSource = function() {

    return {
        "connect": function(){},
        "start": function(){},
    };
};
