/** This is an automatically generated class by Auto-UI. Please do not modify it. **/
const {
	ccclass,
	property
} = cc._decorator;

@ccclass
export default class auto_tipsItem extends cc.Component {
	tipsItem: cc.Node;
	TipsBg: cc.Node;
	Label: cc.Node;
	public static URL:string = "db://assets/resources/prefab/tips/tipsItem.prefab"

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.tipsItem = this.node
		this.TipsBg = this.tipsItem.getChildByName("TipsBg");
		this.Label = this.TipsBg.getChildByName("Label");

	}
    start() {}

    // update (dt) {}
}

