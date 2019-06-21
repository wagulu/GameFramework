import ProtoLoader from "./protobuf/ProtoLoader";
import { NetWork } from "./framework/net/NetWork";
import { Login } from "./ProtoMessage";
import { CEventName } from "./data/CEventName";
import EventMng from "./framework/event/EventMng";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    private _network: NetWork;

    onEnable() {
        EventMng.on(CEventName.SOCKET_OPEN, this.onSocketOpen, this);
        EventMng.on(CEventName.SOCKET_CLOSE, this.onSocketClose, this);
    }

    onDisable() {
        EventMng.off(CEventName.SOCKET_OPEN, this.onSocketOpen, this);
        EventMng.off(CEventName.SOCKET_CLOSE, this.onSocketClose, this);
    }

    start() {
        // init logic
        this.label.string = this.text;

        let cfgman = require('CfgMan');
        console.log(cfgman[1].name);  // 小明

        ProtoLoader.load();

        this._network = new NetWork();
        let url = 'ws://localhost:3000';
        this._network.connect(url);
    }

    onSocketOpen() {
        this._network.send('hello');

        let login = new Login();
        login.cmd = 'login';
        login.name = 'Clever';
        login.pw = '123456';
        this._network.send(login);
    }

    onSocketClose() {
        this._network = null;
    }
}
