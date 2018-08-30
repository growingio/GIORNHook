'use strict';

var fs = require('fs');
if(!String.prototype.contains){
	String.prototype.contains = function(e){
		return this.indexOf(e) > -1;
	}
}

/**
 * 返回functionBody执行的函数
 */
module.exports.anonymousJsFunctionCall =  function(functionBody, theNameOfThis){
	if (!theNameOfThis){
		theNameOfThis = 'this';
	}
	
	functionBody = functionBody.replace(/this/g, '_$$$$this');
	return "(function(_$$this){\n" +
		"    try{\n        " + functionBody +
		"    \n    } catch (error) { throw new Error('GrowingIO RN SDK 代码调用异常: ' + error);}\n" + 
       	   "})(" + theNameOfThis + ");";
}

/**
 * 修正处理文件
 * transfomer: (originalStr) => newStr
 */
module.exports.modifyFile = function(filePath, transfomer){
	var content = fs.readFileSync(filePath, 'utf8');
	if(content.contains('/*GROWINGIO MODIFIED ')){
		console.log(`filePath: ${filePath} has modified`)
		return;
	}
	fs.renameSync(filePath, `${filePath}_gio_bak`);
	var modifiedContent = transfomer(content);
	modifiedContent = modifiedContent + '\n/*GROWINGIO MODIFIED ' + new Date() + ' */';
	fs.writeFileSync(filePath, modifiedContent, 'utf8');
}

/**
 * 将GrowingIO处理后的文件恢复
 */
module.exports.resetFile = function(filePath){
	var content = fs.readFileSync(filePath, "utf8");
	if(!content.contains('/*GROWINGIO MODIFIED ')){
		console.log(`filePath: ${filePath} does not modified by gio, and return`);
		return;
	}
	var backFilePath = `${filePath}_gio_bak`;
	if(!fs.existsSync(backFilePath)){
		throw `File: ${backFilePath} not found, some thing oop.\n Please rm -rf node_modules and npm install again`;
	}
	fs.renameSync(backFilePath, filePath);
}
