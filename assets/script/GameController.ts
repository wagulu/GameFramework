import { SingletonFactory } from "./utils/SingletonFactory";
import { Network } from "./network/Network";
import IDataModel from "./data/model/IDataModel";
import AccountModel from "./data/model/Account/AccountModel";
import SystemModel from "./data/model/System/SystemModel";

class GameController {
    private _tModel: Array<IDataModel> = [];

    network: Network = null;

    account: AccountModel = null;
    system: SystemModel = null;

    constructor() {

    }

    newModel<T extends IDataModel>(c: { new(): T }): T {
        let obj = SingletonFactory.getInstance(c);
        this._tModel.push(obj);
        return obj
    }

    clear() {
        this._tModel.forEach(m => {
            m.clear();
        });
    }

    initModule() {
        this.network = SingletonFactory.getInstance(Network);

        this.account = this.newModel(AccountModel);
        this.system = this.newModel(SystemModel);
    }
}

export default new GameController();