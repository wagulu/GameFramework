/**
 * 此文件为协议自动生成文件，不可手动编辑
 * 如协议有变动，只需执行【扩展/proto/create-message】即可
 * Clever
 */

// proto插件main.js 252行可以修改
import { CMessageBase, MessageRegister } from "./network/Message";

/**协议文件 */
export let ProtoFile = [
   "base",
   "login",
];

   
/**一维整数数组 */
export class NUMBER_ARRAYS extends CMessageBase {
    constructor (databuff = null) {
        super();
        this.protocolType = -1;
        this.messageName = 'NUMBER_ARRAYS';
        this.initMsgObj(databuff);
    }

    /**undefined */
    set numbers (param : Array<number>) {
        this.msgObj.numbers = param;
    }
    get numbers () : Array<number> {
        return this.msgObj.numbers;
    }
}
MessageRegister.registerClass(-1, NUMBER_ARRAYS);
   
/**登录 */
export class Login extends CMessageBase {
    constructor (databuff = null) {
        super();
        this.protocolType = 10000;
        this.messageName = 'Login';
        this.initMsgObj(databuff);
    }

    /**undefined */
    set cmd (param : string) {
        this.msgObj.cmd = param;
    }
    get cmd () : string {
        return this.msgObj.cmd;
    }

    /**登录名 */
    set name (param : string) {
        this.msgObj.name = param;
    }
    get name () : string {
        return this.msgObj.name;
    }

    /**密码 */
    set pw (param : string) {
        this.msgObj.pw = param;
    }
    get pw () : string {
        return this.msgObj.pw;
    }

    /**undefined */
    set numbers (param : NUMBER_ARRAYS) {
        this.msgObj.numbers = param;
    }
    get numbers () : NUMBER_ARRAYS {
        return this.msgObj.numbers;
    }

    /**undefined */
    set data (param : Map<string,NUMBER_ARRAYS>) {
        this.msgObj.data = param;
    }
    get data () : Map<string,NUMBER_ARRAYS> {
        return this.msgObj.data;
    }
}
MessageRegister.registerClass(10000, Login);

