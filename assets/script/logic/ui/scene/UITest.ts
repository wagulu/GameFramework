import auto_Test from "../../../Data/AutoUI/scene/auto_Test";
import GameController from "../../../GameController";
import ProtoLoader from "../../../network/ProtoLoader";
import UIHelp from "../../../utils/UIHelp";
import UINotice from "../notice/UINotice";
import UIBase from "../UIBase";
import { C2G_Login } from "../../../ProtoMessage";
import { SocketEvent } from "../../../data/const/EventConst";

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
		this.onRegisterEvent(this.ui.btnLogin, this.onLogin, this);
		this.onRegisterEvent(this.ui.btnUI, this.onOpenUI, this);

		this.initEvent(SocketEvent.SOCKET_OPEN, this.onSendMsg);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btnNetwork, this.onConnectNetwork, this);
		this.unRegisterEvent(this.ui.btnLogin, this.onLogin, this);
		this.unRegisterEvent(this.ui.btnUI, this.onOpenUI, this);
	}

	onStart() {
		this.ui.btnLogin.active = false;
		ProtoLoader.load();
		GameController.initModule();
	}

	onConnectNetwork() {
		GameController.network.connect();
	}

	onLogin() {
		GameController.account.Login();
	}

	onSendMsg() {
		UIHelp.ShowTips('连接成功!');
		this.ui.btnNetwork.active = false;
		this.ui.btnLogin.active = true;
	}

	onOpenUI() {
		UIHelp.ShowUI(UINotice);
	}
}