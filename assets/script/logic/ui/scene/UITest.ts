import auto_Test from "../../../Data/AutoUI/scene/auto_Test";
import { EventName } from "../../../data/const/EventName";
import { Network } from "../../../network/Network";
import ProtoLoader from "../../../network/ProtoLoader";
import { Login } from "../../../ProtoMessage";
import UIHelp from "../../../utils/UIHelp";
import UINotice from "../notice/UINotice";
import UIBase from "../UIBase";
import GameController from "../../../GameController";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/scene/UITest")
export default class UITest extends UIBase {
	ui: auto_Test = null;

	protected static prefabUrl = "db://a";
	protected static className = "UITest";

	onUILoad() {
		this.ui = this.node.addComponent(auto_Test);
	}

	onShow() {
		this.onRegisterEvent(this.ui.btnNetwork, this.onConnectNetwork, this);
		this.onRegisterEvent(this.ui.btnUI, this.onOpenUI, this);

		this.initEvent(EventName.SOCKET_OPEN, this.onSendMsg);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btnNetwork, this.onConnectNetwork, this);
		this.unRegisterEvent(this.ui.btnUI, this.onOpenUI, this);
	}

	onStart() {
		ProtoLoader.load();
		GameController.initModule();
	}

	onConnectNetwork() {
		GameController.network.connect();
	}

	onSendMsg() {
		UIHelp.ShowTips('连接成功，开始发送信息');

		GameController.network.send('Hello');

		let login = new Login();
		login.cmd = 'login';
		login.name = 'Clever';
		login.pw = '123456';
		GameController.network.send(login);
	}

	onOpenUI() {
		UIHelp.ShowUI(UINotice);
	}
}