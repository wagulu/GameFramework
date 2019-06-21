/** This is an automatically generated class by Auto-UI. Please do not modify it. **/
const {
	ccclass,
	property
} = cc._decorator;

@ccclass
export default class auto_tips extends cc.Component {
	tips: cc.Node;
	public static URL:string = "db://assets/resources/prefab/tips/tips.prefab"

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.tips = this.node

	}
    start() {}

    // update (dt) {}
}

