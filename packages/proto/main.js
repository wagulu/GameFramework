'use strict';

const child_process = require('child_process');
const Fs = require('fs');
const Path = require('fire-path');
const Async = require('async');
const util = require('util');

var SAVE_PATH = 'assets/script/ProtoMessage.ts';


// ----------------------------- SVN相关操作 -----------------------------
var PROTO_PATH = 'assets/resources/proto/';

var CMD_UPDATE = "update";
var CMD_COMMIT = "commit";

/**
 * 
 * @param command SVN命令 update commit
 * @param callback 执行完成回调
 * @param closeonend 是否自动关闭进度对话框 0否 1是
 */
var execSVN = function (command, callback, closeonend = 0) {
    let execCmd = `TortoiseProc.exe /command:${command} /path:${Editor.Project.path}/${PROTO_PATH} /closeonend:${closeonend}`;
    child_process.exec(execCmd, callback);
};
// -----------------------------------------------------------------------


/**去除前后空格 */
// String.prototype.trim = function () {
//     return this.replace(/(^\s*)|(\s*$)/g, "");
// }

/**去除所有空格 */
var trimAll = function (str) {
    return str.replace(/\s|\xA0/g, "");
}

var formatNum = function (str) {
    str = str.trim();
    return parseInt(str);
}

/**首字母大写 */
var firstCharUpper = function (str) {
    str = str.substring(0, 1).toUpperCase() + str.substring(1);
    return str;
}

// ------------------------------- 自动生成 -------------------------------
/**
 * 格式：
 * tOuput = {
 *  [fileName1] = {
 *      [messageName1] = {
 *          "comment" : "",
 *          "protocolType" : 0,
 *          "messageName" : "",
 *          "property" : [{
 *              "comment" : "",
 *              "type" : "",
 *              "name" : "",
 *          },{}]
 *      },
 *      [messageName2] = {
 *      },
 *      ...
 *  },
 *  [fileName2] = {
 *  },
 *  ...
 * }
 */
var tOutput = {}

// proto类型转换跟js类型的映射关系
const TYPE = {
    "int32": "number",
    "int64": "number",
    "string": "string",
    "bool": "boolean",
}

// proto关键字
const KEY_WORD = ['required', 'optional', 'repeated'];

// 处理comment注释获得注释、协议号、消息名
var dealComment = function (str) {
    str = trimAll(str);
    let pattern = /@comment\(\"(\S*)\",(\S*),\"(\S*)\"\)/;
    let values = str.match(pattern);

    let comment = values[1];
    let protocolType = formatNum(values[2]);
    let messageName = values[3];

    return [comment, protocolType, messageName];
}

// 处理property获得注释、消息名
var dealMsgType = function (str) {
    str = trimAll(str);
    let pattern = /@msgtype\(\"(\S*)\",\"(\S*)\"\)/;
    let values = str.match(pattern);

    let comment = values[1];
    let messageName = values[2];

    return [comment, messageName];
}

// 处理属性，格式：关键字(可选) 类型 名字 = 索引;
var getProperty = function (str) {
    let t = str.trim().split(/\s+/);
    // 第一个为关键字，忽略
    if (KEY_WORD.indexOf(t[0]) != -1) {
        t.splice(0, 1);
    }
    let type = t[0];
    if (TYPE[type]) {
        type = TYPE[type];
    }
    let name = t[1];

    // map类型解析
    if (type.indexOf('map<') != -1) {
        let startIdx = type.indexOf('<');
        let endIdx = type.indexOf('>');
        type = type.substring(startIdx + 1, endIdx);
        let arr = type.split(',');
        type = 'map<';
        for (let i = 0; i < arr.length; i++) {
            if (TYPE[arr[i]]) {
                type += TYPE[arr[i]];
            } else {
                type += arr[i];
            }
            if (i != arr.length - 1) {
                type += ',';
            }
        }
        type += '>';
        type = firstCharUpper(type);
    }

    // 如果是repeated则为数组类型
    if (str.indexOf("repeated") != -1) {
        type = util.format("Array<%s>", type);
    }

    return [type, name];
}

var dealProtoFile = function (fileName, str) {
    tOutput[fileName] = {};

    let messageName;
    let bDealProperty = false;
    let tProperty = {};

    // 每个message之间用'}'分割
    let tMsg = str.trim().split('}');

    tMsg.forEach(function (msg, mindex) {
        // 该段消息体如果没有 comment 或者 msgtype 标注，则不处理
        if (msg.indexOf('//@comment') == -1 && msg.indexOf('//@msgtype') == -1) {
            return;
        }
        msg.split('\n').forEach(function (v, index) {
            // 处理@comment
            if (v.indexOf('//@comment') != -1) {
                let tCommentRet = dealComment(v);
                let comment = tCommentRet[0];
                let protocolType = tCommentRet[1];
                messageName = tCommentRet[2];

                if (messageName && !tOutput[fileName].hasOwnProperty(messageName)) {
                    tOutput[fileName][messageName] = {}
                }
                tOutput[fileName][messageName] = {
                    "comment": comment,
                    "protocolType": protocolType,
                    "messageName": messageName,
                    "property": [],
                }
                return;
            }

            // 处理@msgtype
            if (v.indexOf('//@msgtype') != -1) {
                let tCommentRet = dealMsgType(v);
                let comment = tCommentRet[0];
                messageName = tCommentRet[1];

                if (messageName && !tOutput[fileName].hasOwnProperty(messageName)) {
                    tOutput[fileName][messageName] = {}
                }
                tOutput[fileName][messageName] = {
                    "comment": comment,
                    "protocolType": -1,
                    "messageName": messageName,
                    "property": [],
                }
                return;
            }

            // 只在message和}之间才能解析属性
            if (!bDealProperty && v.indexOf('message') != -1) {
                bDealProperty = true;
                tProperty = {};
                return;
            }
            if (bDealProperty && v.indexOf('}') != -1) {
                bDealProperty = false;
                return
            }
            if (!bDealProperty) {
                return;
            }

            // 处理属性注释
            if (v.indexOf("//") != -1) {
                let comment = v.trim().substring(2).trim();
                tProperty["comment"] = comment;
                return;
            }
            // 处理属性
            if (v.indexOf('=') != -1) {
                let info = getProperty(v);
                let type = info[0];
                let name = info[1];
                tProperty["type"] = type;
                tProperty["name"] = name;
                tOutput[fileName][messageName]["property"].push(tProperty);
                tProperty = {}
                return;
            }
        });
    });
}

var codeBodyFormat =
    `/**
 * 此文件为协议自动生成文件，不可手动编辑
 * 如协议有变动，只需执行【扩展/proto/create-message】即可
 * Clever
 */

// proto插件main.js 252行可以修改
import { CMessageBase, MessageRegister } from "./network/Message";

/**协议文件 */
export let ProtoFile = [
%s];

%s
`;

var fileListFormat =
    `   "%s",
`;

var classFormat =
    `   
/**%s */
export class %s extends CMessageBase {
    constructor (databuff = null) {
        super();
        this.protocolType = %d;
        this.messageName = '%s';
        this.initMsgObj(databuff);
    }%s
}
MessageRegister.registerClass(%d, %s);
`;

var accessFormat =
    `

    /**%s */
    set %s (param : %s) {
        this.msgObj.%s = param;
    }
    get %s () : %s {
        return this.msgObj.%s;
    }`;

var exportFileStr = "";
var exportClassStr = "";

var dealFileName = function (fileName) {
    exportFileStr += util.format(fileListFormat, fileName);
}

var createClassCode = function () {
    for (let fileName in tOutput) {
        let fileInfo = tOutput[fileName];
        for (let msgName in fileInfo) {
            let msgInfo = fileInfo[msgName];

            let accessStr = "";
            for (let idx in msgInfo.property) {
                let info = msgInfo.property[idx];
                accessStr += util.format(accessFormat, info.comment, info.name, info.type, info.name, info.name, info.type, info.name);
            }

            exportClassStr += util.format(classFormat, msgInfo.comment, msgInfo.messageName, msgInfo.protocolType, msgInfo.messageName, accessStr, msgInfo.protocolType, msgInfo.messageName);
        }
    }
}

var writeToFile = function () {
    createClassCode();
    let exportCode = util.format(codeBodyFormat, exportFileStr, exportClassStr);

    Fs.writeFileSync(Editor.Project.path + `/${SAVE_PATH}`, exportCode, {
        encoding: 'utf8',
        flag: 'w'
    });
    Editor.success('proto自动写入成功');
    exportFileStr = "";
    exportClassStr = "";
    Editor.assetdb.refresh(`db://${SAVE_PATH}`, () => { });
}
// -----------------------------------------------------------------------

var queryProtoFile = function (callback) {
    let fileList = [];
    Editor.assetdb.queryAssets(`db://${PROTO_PATH}*`, '', function (err, results) {
        if (err) {
            Editor.error('读取proto文件失败', err);
            return;
        }
        if (!results || results.length == 0) {
            Editor.error('读取proto文件失败,文件列表为空');
            return;
        }
        results.forEach(function (result) {
            fileList.push(result);
        });
        if (callback) {
            callback(fileList);
        }
    });
};


module.exports = {
    load() {
        // 当 package 被正确加载的时候执行
    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'update'() {
            execSVN(CMD_UPDATE, function (err, stdout, stderr) {
                err && Editor.error(err);
            });
        },
        'create-message'() {
            queryProtoFile(function (fileList) {
                for (let assetInfo of fileList) {
                    let fileName = Path.basenameNoExt(assetInfo.url);
                    dealFileName(fileName);

                    let fileInfo = Fs.readFileSync(assetInfo.path, 'utf8');
                    let infoStr = fileInfo.toString();
                    dealProtoFile(fileName, infoStr);
                }
                writeToFile();
                Editor.Dialog.messageBox({
                    type: 'info',
                    buttons: ['OK'],
                    title: 'proto',
                    message: 'proto自动写入成功',
                    defaultId: 0,
                    noLink: true
                });
            });
        },
    },
};