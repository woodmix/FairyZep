
/**
 * ExecutantやParticleのように、ビヘイバを持つクラスの基底。
 * ビヘイバを扱うための基本機能を実装する。
 */
function BehaviorHost() {

    // ビヘイバー管理オブジェクト。
    this.behaviors = new LeafManager();
    this.behaviors.onoperate = this.behaviorOperated.bind(this);
    this.behaviors.onneed = this.getDefaultBehavior.bind(this);
}

//---------------------------------------------------------------------------------------------------------
/**
 * behaviors メンバ変数で need() されたときに、該当がなかった場合にコールされる。
 *
 * @param   必要なビヘイバのキー。
 * @return  デフォルトのビヘイバ。
 */
BehaviorHost.prototype.getDefaultBehavior = function(name) {

    switch(name) {
        case "body":        return new ImageBody();
        case "sensor":      return new BodySensor();
        case "interactor":  return new InteractBehavior();
        case "rigid":       return new RigidBehavior();
    }
}

//---------------------------------------------------------------------------------------------------------
/**
 * ビヘイバが追加・削除されたら呼ばれる。
 *
 * @param   キー
 * @param   操作前の値
 * @param   操作後の値
 */
BehaviorHost.prototype.behaviorOperated = function(name, before, after) {

    // ビヘイバのattached()を適切にコールする。
    if(before)
        before.attached(null);

    if(after)
        after.attached(this);
}
