import IDataModel from "../IDataModel";

export default class AccountModel extends IDataModel {
    player_id: number;
    user_name: string;

    constructor() {
        super('account');
    }

    getMessageListeners() {
        return {
        }
    }
}