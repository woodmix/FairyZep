
/**
 * 描画に関するユーティリティを収めたオブジェクト。
 */
Drawer = {};

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された情報で簡単なゲージを描く。
 *
 * @param   描画に使うCanvasRenderingContext2D。
 * @param   ゲージを描く領域を表すRect。
 * @param   領域の何パーセントを棒で埋めるか。0.0-1.0で指定する。
 * @param   棒を描くときの fillStyle。
 */
Drawer.drawGauge = function(context, rect, length, style) {

    // 背景描画。
    context.fillStyle = "black";
    context.fillRect(rect.lt.x, rect.lt.y, rect.width(), rect.height());

    // ゲージ描画。
    context.fillStyle = style;
    context.fillRect(rect.lt.x, rect.lt.y, rect.width() * length, rect.height());
}
