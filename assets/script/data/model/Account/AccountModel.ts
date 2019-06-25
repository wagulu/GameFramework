import { G2C_Login, C2G_Login } from "../../../ProtoMessage";
import IDataModel from "../IDataModel";
import UIHelp from "../../../utils/UIHelp";

export default class AccountModel extends IDataModel {
    player_id: number;
    user_name: string;

    constructor() {
        super('account');
    }

    getMessageListeners() {
        return {
            ['G2C_Login']: (msg) => { this.G2C_LoginSuccess(msg) },
        }
    }

    Login() {
        let login = new C2G_Login();
        login.cmd = 'login';
        login.name = 'Clever';
        login.pw = '123456';
        this.sendProtocolMsg(login);
    }

    G2C_LoginSuccess(msg: G2C_Login) {
        UIHelp.ShowTips('登录成功！' + msg.msg);
    }
}