'use strict';

const Fs = require('fire-fs');
const Path = require('fire-path');
const Async = require('async');
const Del = require('del');
const util = require('util');

const dontSelectCorrectAssetMsg = {
	type: 'warning',
	buttons: ['OK'],
	title: '泰拳警告',
	message: 'Please select a UI prefab!',
	defaultId: 0,
	noLink: true
};

// 根据自身需求修改这两个路径
var PARENT_PATH = 'assets/script/data/autoui';
var UI_FOLDER = Path.join(Editor.Project.path, PARENT_PATH);

var SCRIPT_PATH = 'assets/script/logic/ui';
var SCRIPT_FOLDER = Path.join(Editor.Project.path, SCRIPT_PATH);

var codeNodeInit = '%s: %s;';
var codeAssign = 'this.%s = this.%s.getChildByName("%s");';
var codeAssign2 = 'this.%s = %s.getChildByName("%s");';
var codeBody =
	`/** This is an automatically generated class by Auto-UI. Please do not modify it. **/
const {
	ccclass,
	property
} = cc._decorator;

@ccclass
export default class %s extends cc.Component {
%s
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
%s
	}
    start() {}

    // update (dt) {}
}

`;

var adb = Editor.assetdb;

var refreshFunc = function (params) {
	adb.refresh(`db://${PARENT_PATH}`, function (err, results) {
		// assets that imported during init
		results.forEach(function (result) {
			if (result.command === 'delete') {
				// result.uuid
				// result.url
				// result.path
				// result.type
			} else if (result.command === 'change' || result.command === 'create') {
				// result.uuid
				// result.parentUuid
				// result.url
				// result.path
				// result.type
			} else if (result.command === 'uuid-change') {
				// result.oldUuid
				// result.uuid
				// result.parentUuid
				// result.url
				// result.path
				// result.type
			}
		});
	});
}

var getWarnMsg = function (warnStr) {
	return {
		type: 'warning',
		buttons: ['OK'],
		titile: '泰拳警告',
		message: warnStr,
		defaultId: 0,
		noLink: true
	};
}

var folderFunc = function (assetInfo) {
	let url = assetInfo.url;
	Fs.mkdirsSync(UI_FOLDER);
	let moduleName = Path.basenameNoExt(url);

	let moduleFolder = Path.join(UI_FOLDER, moduleName);
	Fs.mkdirsSync(moduleFolder);

	Editor.log('folderFunc : ' + url);
	Editor.assetdb.queryAssets(url + '/**\/*', ['scene', 'prefab'],
		function (err, results) {
			results.forEach(function (r) {
				if (err) {
					Editor.log('ERROR:' + err);
					// 	continue;
				} else {
					Editor.log('url:' + r.url);
					prefabFunc(r);

				}
			});
		});
}

/**获取控件真正的名字：现在的控件名后缀有特定功能，去掉后缀才是控件真正名字 */
var getRealName = function (name) {
	let index = name.indexOf('__');
	if (index == -1) {
		return name;
	}
	name = name.substr(0, index);
	return name;
}

var getAutoUIName = function (url) {
	return 'auto_' + Path.basenameNoExt(url);
}

var prefabFunc = function (assetInfo) {
	Fs.mkdirsSync(UI_FOLDER);

	let url = assetInfo.url;
	//获取文件夹名称
	let moduleName = Path.basenameNoExt(Path.dirname(url));
	Editor.log('prefabFunc moduleName:', moduleName);

	//创建对应父文件夹
	let moduleFolder = Path.join(UI_FOLDER, moduleName);
	Fs.mkdirsSync(moduleFolder);

	//生成对应的ts文件
	let uiName = getAutoUIName(url);
	let exportUIPath = `db://${PARENT_PATH}/${moduleName}/${uiName}.ts`;

	let nameList = {};
	let sameNameList = [];

	let declareStr = '';
	let nodeInitStr = '';
	let assignStr = '';

	let json = Fs.readJsonSync(assetInfo.path);



	let baseNode = json[0];
	let rootNode = json[1];
	let rootType = rootNode['__type__'];
	let rootName = rootNode['_name'];

	let isScene = baseNode['__type__'] == 'cc.SceneAsset';
	if (isScene) {
		let children = rootNode['_children'];
		if (!children || children.length == 0) {
			Editor.Dialog.messageBox(getWarnMsg('这是一个空的场景'));
			return;
		}
		assignStr += `\t\tlet parent = this.node.getParent();\n`;

		// children.forEach(child => {
		// 	let childID = child['__id__'];
		// 	let nodeInfo = json[childID];
		// 	if (!nodeInfo) {
		// 		Editor.Dialog.messageBox(getWarnMsg('出错：这个节点信息不可能为空:' + childID));
		// 		return;
		// 	}
		// 	let name = nodeInfo['_name'];
		// 	let type = nodeInfo['__type__'];
		// 	nodeInitStr += '\t' + util.format(codeNodeInit, name, type) + '\n';
		// 	assignStr += `\t\tthis.${name} = parent.getChildByName('${name}');\n`;
		// });

	} else {
		nodeInitStr += '\t' + util.format(codeNodeInit, rootName, rootType) + '\n';
		assignStr += `\t\tthis.${rootName} = this.node\n`;
	}


	let outputFunc;
	outputFunc = function (root, nodeInfo, isScene) {
		var name = nodeInfo['_name'];
		let type = nodeInfo['__type__'];
		let parent = nodeInfo['_parent'];
		let parentId = parent ? parent['__id__'] : null;
		let parentName = 'node';
		let formatCodeAssign = codeAssign;
		if (parentId) {
			let parentInfo = root[parentId];
			parentName = parentInfo['_name'];
			if (isScene && parentName == undefined) {
				parentName = 'parent';
				formatCodeAssign = codeAssign2;
			}
		}
		// if (isScene && name == undefined) {
		// 	assignStr += `\t\tthis.${name} = parent.getChildByName('${name}');\n`;
		// } else
		if (name != rootName && name.indexOf(' ') == -1) {
			//同名控件检查
			if (nameList[name] == undefined) {
				nameList[name] = true;

				let realName = getRealName(name);
				let parentRealName = getRealName(parentName);
				nodeInitStr += '\t' + util.format(codeNodeInit, realName, type) + '\n';
				assignStr += '\t\t' + util.format(formatCodeAssign, realName, parentRealName, name) + '\n';
			} else {
				if (!sameNameList.hasOwnProperty(name)) {
					sameNameList.push(name);
				}
			}
		}

		let children = nodeInfo['_children'];
		if (!children || children == []) return;

		for (const childInfo in children) {
			if (children.hasOwnProperty(childInfo)) {
				const element = children[childInfo];
				let childID = element['__id__'];

				let childNode = root[childID];
				outputFunc(root, childNode, isScene);
			}
		}
	}

	outputFunc(json, rootNode, isScene);

	if (sameNameList.length > 0) {
		let warn = sameNameList.join('\n');
		Editor.log('warn ::' + warn);
		Editor.Dialog.messageBox(getWarnMsg(`输出中有控件命名重复: \n${warn}\n请修改`));
	}

	let urlStr = `\tpublic static URL:string = "${url}"\n`;

	declareStr = nodeInitStr + urlStr;
	let exportCode = util.format(codeBody, uiName, declareStr, assignStr);

	if (adb.exists(exportUIPath)) {
		adb.saveExists(exportUIPath, exportCode);
	} else {
		adb.create(exportUIPath, exportCode);
	}
}


var scriptCodeBody =
	`import %s from "../../../Data/AutoUI/%s/%s";
import UIBase from "../../../framework/ui/UIBase";
import UIHelp from "../../../framework/ui/UIHelp";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/%s/%s")
export default class %s extends UIBase {
	ui: %s = null;

	protected static prefabUrl = "%s";
	protected static className = "%s";

	onUILoad() {
		this.ui = this.node.addComponent(%s);
	}

	onShow() {

	}

	onHide() {

	}

	onStart() {

	}

	onClose() {
		UIHelp.CloseUI(%s);
	}
}`;

// 首字母大写
var firstCharUpper = function (str) {
	str = str.substring(0, 1).toUpperCase() + str.substring(1);
	return str;
}

var createScriptFolder = function (assetInfo) {
	let url = assetInfo.url;
	Fs.mkdirsSync(SCRIPT_FOLDER);
	let moduleName = Path.basenameNoExt(url);
	// moduleName = firstCharUpper(moduleName);
	let moduleFolder = Path.join(SCRIPT_FOLDER, moduleName);
	Fs.mkdirsSync(moduleFolder);
}

/**
 * 输入：db://assets/resources/prefab/Fight/FightSetting.prefab
 * 输出：Fight/FightSetting
 */
var getPrefabPath = function (url) {
	let prefabStr = 'prefab/'
	let prefabSuffix = '.prefab';
	let start = url.indexOf(prefabStr) + prefabStr.length;
	let end = url.indexOf(prefabSuffix);
	return url.substring(start, end);
}

var createScriptFile = function (assetInfo) {
	Fs.mkdirsSync(SCRIPT_FOLDER);

	let url = assetInfo.url;
	//获取文件夹名称
	let moduleName = Path.basenameNoExt(Path.dirname(url));
	// moduleName = firstCharUpper(moduleName);
	Editor.log('createScriptFolder moduleName:', moduleName);

	//创建对应父文件夹
	let moduleFolder = Path.join(SCRIPT_FOLDER, moduleName);
	Fs.mkdirsSync(moduleFolder);

	//生成对应的ts文件
	let uiName = 'UI' + firstCharUpper(Path.basenameNoExt(url));
	let exportUIPath = `db://${SCRIPT_PATH}/${moduleName}/${uiName}.ts`;
	let prefabPath = getPrefabPath(url);

	let autoUIName = getAutoUIName(url);
	let exportCode = util.format(scriptCodeBody, autoUIName, moduleName, autoUIName, moduleName, uiName, uiName,
		autoUIName, prefabPath, uiName, autoUIName, uiName);

	if (adb.exists(exportUIPath)) {
		// adb.saveExists(exportUIPath, exportCode);
		Editor.warn(`文件${exportUIPath}已存在`);
	} else {
		adb.create(exportUIPath, exportCode);
	}
}


module.exports = {
	load() {
		// execute when package loaded
	},

	unload() {
		// execute when package unloaded
	},

	// register your ipc messages here
	messages: {
		'export'() {
			Editor.Metrics.trackEvent({
				category: 'Packages',
				label: 'auto-ui',
				action: 'Open By Menu'
			}, null);
			let self = this;

			let currentSelection = Editor.Selection.curSelection('asset');
			if (currentSelection.length <= 0) {
				Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
				return;
			}
			let selectionUUid = currentSelection[0];
			let assetInfo = adb.assetInfoByUuid(selectionUUid);

			Editor.log('export:::' + assetInfo.type);

			let assetType = assetInfo.type;
			if (assetType === 'folder') {
				folderFunc(assetInfo)
			} else if (assetType === 'prefab') {
				prefabFunc(assetInfo)
			} else if (assetType === 'scene') {
				prefabFunc(assetInfo)
			} else {
				Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
				return;
			}

			console.time('100-elements');
			// refreshFunc();
			console.timeEnd('100-elements');
		},

		'create-script'() {
			let currentSelection = Editor.Selection.curSelection('asset');
			if (currentSelection.length <= 0) {
				Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
				return;
			}
			let selectionUUid = currentSelection[0];
			let assetInfo = adb.assetInfoByUuid(selectionUUid);

			Editor.log('export:::' + assetInfo.type);

			let assetType = assetInfo.type;
			if (assetType === 'folder') {
				createScriptFolder(assetInfo);
			} else if (assetType === 'prefab') {
				prefabFunc(assetInfo);
				createScriptFile(assetInfo);
			} else if (assetType === 'scene') {
				prefabFunc(assetInfo);
				createScriptFile(assetInfo);
			} else {
				Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
				return;
			}
		}
	},
};