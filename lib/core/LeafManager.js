
/**
 * Executant や Particle の childs, behaviors を管理するためのクラス。
 * 基本的に連想配列として名前と共に値を保持するだけだが、操作に干渉したりできる。
 *
 * prop() をオーバーライドしているので、route() や prop() で "leaves" を挟む必要がない点に注意。…だが、これは廃止したほうが良いな。
 */
function LeafManager() {

    // 保持している名前と値の連想配列。
    this.leaves = {};

    // set(), remove() で要素を操作したときに呼ばれる。
    // 引数は (名前, 操作前の値, 操作後の値)。
    // remove() の場合、操作後の値は null になる。
    this.onoperate = new Function();

    // need() で値が求められたが、まだない場合に呼ばれる。
    // 引数は (名前)。戻り値は作成した要素。
    this.onneed = new Function();

    // bid() によってキューされているコマンドの配列。
    this.commands = Array();
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された要素を返す。
 *
 * @param   要素の名前。
 * @return  指定された要素。なかった場合は undefined。
 */
LeafManager.prototype.get = function(name) {

    return this.leaves[name];
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された要素を、指定された名前で保持する。
 *
 * @param   要素。null の場合は削除となる。
 * @param   要素の名前。指定しなかった場合は、省略した場合は数値キーが自動的に割り当てられる。
 */
LeafManager.prototype.set = function(leaf, name) {

    // 名前省略時は数値で自動決定する。
    if(name == undefined)
        for(name = 0 ; this.leaves[name] ; name++);

    // onoperate をコールバック。
    this.onoperate(name, this.leaves[name], leaf);

    // 指定の名前で保持するが、null の場合は削除。
    if(leaf == null)
        delete this.leaves[name];
    else
        this.leaves[name] = leaf;
}

//---------------------------------------------------------------------------------------------------------
/**
 * prop() をオーバーライドして route() でたどれるようにする。
 */
LeafManager.prototype.prop = function(name, value) {

    if(value === undefined)
        return this.get(name);
    else
        this.set(value, name);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された要素を削除する。
 *
 * @param   削除したい要素、あるいはその名前。
 */
LeafManager.prototype.remove = function(leaf) {

    // インスタンスで指定されている場合は...
    if(typeof(leaf) != "string") {

        // その名前を探す。見付からない場合は何もしない。
        leaf = this.index(leaf);
        if(leaf == undefined)
            return;
    }

    this.set(null, leaf);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数で指定された要素を削除する。
 *
 * @param   削除したい要素、あるいはその名前。
 */
LeafManager.prototype.destroy = function(leaf) {

    // 名前で指定されている場合は...
    if(typeof(leaf) == "string") {

        // その名前で保持されている値を探す。見付からない場合は何もしない。
        leaf = this.get(leaf);
        if(leaf == undefined)
            return;
    }

    leaf.destroy();
}

//---------------------------------------------------------------------------------------------------------
/**
 * すべての要素を削除する。
 */
LeafManager.prototype.clear = function() {

    for(var k in this.leaves)
        this.remove(k);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 保持している各要素に対して反復処理する。
 *
 * @param   処理を行う関数。引数に各要素が渡される。
 */
LeafManager.prototype.each = function(func) {

    for(var k in this.leaves)
        func(this.leaves[k]);
}

//---------------------------------------------------------------------------------------------------------
/**
 * 引数に指定された要素の名前を返す。
 *
 * @param   名前が知りたい要素。
 * @return  名前。保持していない要素の場合は undefined。
 */
LeafManager.prototype.index = function(leaf) {

    for(var k in this.leaves) {
        if(this.leaves[k] == leaf)
            return k;
    }

    return undefined;
}

//---------------------------------------------------------------------------------------------------------
/**
 * set(), remove() の呼び出しを遅延実行する。
 * 次に act() を呼んだときにまとめて処理される。
 *
 * @param   操作コマンド。"set", "remove", "destroy" のいずれか。
 * @param   各メソッド第一引数。
 * @param   各メソッド第二引数。
 */
LeafManager.prototype.bid = function(ope, leaf, name) {

    this.commands.push([ope, leaf, name]);
}

//---------------------------------------------------------------------------------------------------------
/**
 * bid() で予約されているコマンドを実行する。
 */
LeafManager.prototype.act = function() {

    // キューされているコマンドを一つずつ処理する。
    for(var i = 0, command ; command = this.commands[i] ; i++)
        this[ command[0] ](command[1], command[2]);

    // キューをクリアする。
    this.commands.length = 0;
}

//---------------------------------------------------------------------------------------------------------
/**
 * get() と同じだが、指定した名前の要素がない場合は bid() で予約されている要素も探すし、onneed() をコール
 * バックして準備しようともする。最終的に準備できないならエラーになる。
 *
 * @param   必要なビヘイバの名前。
 * @return  指定されたビヘイバ。
 */
LeafManager.prototype.need = function(name) {

    // 普通にあるならそれをリターン。
    var result = this.get(name);
    if(result)
        return result;

    // なかったら保留中のコマンドからも探す。
    for(var i = 0, command ; command = this.commands[i] ; i++) {
        if(command[0] == "set"  &&  command[2] == name)
            return command[1];
    }

    // そこにもないなら onneed() をコールバックして作成する。
    var result = this.onneed(name);
    if(result) {
        this.set(result, name);
        return result;
    }

    // それもないならエラー。
    throw '管理素子 "' + name + '" が必要です。';
}
