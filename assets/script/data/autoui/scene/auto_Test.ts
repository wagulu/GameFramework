/** This is an automatically generated class by Auto-UI. Please do not modify it. **/
const {
	ccclass,
	property
} = cc._decorator;

@ccclass
export default class auto_Test extends cc.Component {
	Canvas: cc.Node;
	background: cc.Node;
	btnNetwork: cc.Node;
	btnLogin: cc.Node;
	btnUI: cc.Node;
	public static URL:string = "db://assets/scene/Test.fire"

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		let parent = this.node.getParent();
		this.Canvas = parent.getChildByName("Canvas");
		this.background = this.Canvas.getChildByName("background");
		this.btnNetwork = this.Canvas.getChildByName("btnNetwork");
		this.btnLogin = this.Canvas.getChildByName("btnLogin");
		this.btnUI = this.Canvas.getChildByName("btnUI");

	}
    start() {}

    // update (dt) {}
}

