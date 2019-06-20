import ProtoLoader from "./Net/ProtoLoader";
import { NetWork } from "./Net/NetWork";
import { Login } from "./ProtoMessage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    start() {
        // init logic
        this.label.string = this.text;

        let cfgman = require('CfgMan');
        console.log(cfgman[1].name);  // 小明

        ProtoLoader.load(() => {
            let network = new NetWork();
            let url = 'ws://localhost:3000';
            network.connect(url);
            setTimeout(() => {
                network.send('hello');

                let login = new Login();
                login.cmd = 'login';
                login.name = 'Clever';
                login.pw = '123456';
                network.send(login);
            }, 1000);
        });
    }
}
