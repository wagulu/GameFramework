import auto_Test from "../../../Data/AutoUI/scene/auto_Test";
import UIBase from "../../../framework/ui/UIBase";
import UIHelp from "../../../framework/ui/UIHelp";
import UINotice from "../notice/UINotice";
import { NetWork } from "../../../framework/net/NetWork";
import { CEventName } from "../../../data/CEventName";
import { Login } from "../../../ProtoMessage";
import ProtoLoader from "../../../protobuf/ProtoLoader";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/scene/UITest")
export default class UITest extends UIBase {
	ui: auto_Test = null;

	protected static prefabUrl = "db://a";
	protected static className = "UITest";

	private _network: NetWork;

	onUILoad() {
		this.ui = this.node.addComponent(auto_Test);
	}

	onShow() {
		this.onRegisterEvent(this.ui.btnNetwork, this.onConnectNetwork, this);
		this.onRegisterEvent(this.ui.btnUI, this.onOpenUI, this);

		this.initEvent(CEventName.SOCKET_OPEN, this.onSendMsg);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btnNetwork, this.onConnectNetwork, this);
		this.unRegisterEvent(this.ui.btnUI, this.onOpenUI, this);
	}

	onStart() {
		ProtoLoader.load();
	}

	onConnectNetwork() {
		// 创建连接
		this._network = new NetWork();
		let url = 'ws://localhost:3000';
		this._network.connect(url);
	}

	onSendMsg() {
		UIHelp.ShowTips('连接成功，开始发送信息');

		this._network.send('Hello');

		let login = new Login();
		login.cmd = 'login';
		login.name = 'Clever';
		login.pw = '123456';
		this._network.send(login);
	}

	onOpenUI() {
		UIHelp.ShowUI(UINotice);
	}
}