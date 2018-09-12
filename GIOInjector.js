var fs = require('fs');
var common = require('./GIOCommon')


/* 
 * filePath: ReactNative的文件夹地址
 */
function injectReactNative(dirPath, reset=false){
	if(!dirPath.endsWith('/')){
		dirPath += '/';
	}
	var touchableJsFilePath = `${dirPath}Libraries/Components/Touchable/Touchable.js`
	if(reset){
		common.resetFile(touchableJsFilePath);
	}else{
		console.log(`found and modify Touchable.js: ${touchableJsFilePath}`);
		injectOnPressScript(touchableJsFilePath);
	}
	var createViewJsFiles = ['Libraries/Renderer/src/renderers/native/ReactNativeFiber.js',
							 'Libraries/Renderer/src/renderers/native/ReactNativeFiber-dev.js',
							 'Libraries/Renderer/src/renderers/native/ReactNativeFiber-prod.js',
							 'Libraries/Renderer/src/renderers/native/ReactNativeFiber-profiling.js',
							 'Libraries/Renderer/ReactNativeFiber-dev.js',
							 'Libraries/Renderer/ReactNativeFiber-prod.js',
							 'Libraries/Renderer/oss/ReactNativeRenderer-dev.js',
							 'Libraries/Renderer/oss/ReactNativeRenderer-prod.js',
							 'Libraries/Renderer/ReactNativeStack-dev.js',
							 'Libraries/Renderer/ReactNativeStack-prod.js',
							 'Libraries/Renderer/oss/ReactNativeRenderer-profiling.js',
							 'Libraries/Renderer/ReactNativeRenderer-dev.js',
							 'Libraries/Renderer/ReactNativeRenderer-prod.js'];
	createViewJsFiles.forEach(function(createViewFilePath){
		var jsFile = `${dirPath}${createViewFilePath}`;
		if(fs.existsSync(jsFile)){
			if(reset){
				common.resetFile(jsFile);
			}else{
			    console.log(`found and modify render.js: ${jsFile}`);
				injectCreateViewScript(jsFile);
			}
		}
	});
}

function injectReactNavigation(dirPath, reset=false){
	if(!dirPath.endsWith('/')){
		dirPath += '/';
	}
	var createNavigationContainerJsFilePath = `${dirPath}src/createNavigationContainer.js`
	var getChildEventSubscriberJsFilePath = `${dirPath}src/getChildEventSubscriber.js`;
	if(!fs.existsSync(createNavigationContainerJsFilePath)){
		return
	}
	if(!fs.existsSync(getChildEventSubscriberJsFilePath)){
		return;
	}
	console.log(`found and modify createNavigationContainer.js: ${createNavigationContainerJsFilePath}`);
	console.log(`found and modify createNavigationContainer.js: ${getChildEventSubscriberJsFilePath}`);
	if(reset){
		common.resetFile(createNavigationContainerJsFilePath);
		common.resetFile(getChildEventSubscriberJsFilePath);
	}else{
		injectNavigationScript(createNavigationContainerJsFilePath, getChildEventSubscriberJsFilePath);
		
	}
}

function injectNavigationScript(createNavigationContainerJsFilePath, getChildEventSubscriberJsFilePath){
	common.modifyFile(createNavigationContainerJsFilePath, onNavigationStateChangeTransformer);
	common.modifyFile(getChildEventSubscriberJsFilePath, onEventSubscriberTransformer);
}

/**
 * filePath: 对应的JS文件地址
 */
function injectCreateViewScript(filePath){
	common.modifyFile(filePath, createViewTransformer);
}

function injectOnPressScript(filePath){
	common.modifyFile(filePath, onPressTransformer);
}

function onNavigationStateChangeTransformer(content){
	var index = content.indexOf("if (typeof this.props.onNavigationStateChange === 'function') {");
	if(index == -1)
		throw "index is -1";
	content = content.substring(0, index) + common.anonymousJsFunctionCall(navigationString('nav', 'action'))  + '\n' + content.substring(index)
	var didMountIndex = content.indexOf('componentDidMount() {');
	if(didMountIndex == -1)
		throw "didMountIndex is -1";
	var forEachIndex = content.indexOf('this._actionEventSubscribers.forEach(subscriber =>', didMountIndex);
	var clojureEnd = content.indexOf(';', forEachIndex);
	content = content.substring(0, forEachIndex) + '{' +
		common.anonymousJsFunctionCall(navigationString('this.state.nav', null)) + '\n' + 
		content.substring(forEachIndex, clojureEnd + 1) +
		'}' + content.substring(clojureEnd + 1);
	return content;
}

function onEventSubscriberTransformer(content){
	var script = "const emit = (type, payload) => {";
	var index = content.indexOf(script);
	if(index == -1)
		throw "index is -1";
	content = content.substring(0, index + script.length) + common.anonymousJsFunctionCall(navigationEventString())  + '\n' + content.substring(index + script.length);
    return content;
}

function navigationString(currentStateVarName, actionName){
	var script = `function $$$getActivePageName$$$(navigationState){
	if(!navigationState)
		return null;
	const route = navigationState.routes[navigationState.index];
	if(route.routes){
		return $$$getActivePageName$$$(route);
	}else{
		if(route.params && route.params["growingPagePath"]) {
			return route.params["growingPagePath"] 
		} else {
			return route.routeName;
		}
	}
}
`;
    
	if(actionName){
		script = `${script}
		          var type = ${actionName}.type;
                  if(type == 'Navigation/SET_PARAMS' || type == 'Navigation/COMPLETE_TRANSITION') {
		                return;
                  }
                  `
	}

	script = `${script} var pageName = $$$getActivePageName$$$(${currentStateVarName});
	if (require('react-native').Platform.OS === 'android') {
	require('react-native').NativeModules.GrowingIOModule.onPageShow(pageName);}`;
	return script;
}

function navigationEventString(){
	var script = `if(require('react-native').Platform.OS !== 'ios') {
                    return;
	              }
	              if(payload && payload.state && payload.state.key && payload.state.routeName && payload.state.key != payload.state.routeName) {
					var growingPageName = payload.state.routeName;
					if(payload.state.params && payload.state.params.growingPagePath) {
						growingPageName = payload.state.params.growingPagePath;
					}
					if(type == 'willFocus') {
						require('react-native').NativeModules.GrowingIOModule.onPagePrepare(growingPageName);
					} else if(type == 'didFocus') {
						require('react-native').NativeModules.GrowingIOModule.onPageShow(growingPageName);
					}
				  }
				  
				  `;
	return script;

}

function onPressTransformer(content){
	var index = content.indexOf('this.touchableHandlePress(');
	if(index == -1)
		throw "Can't not hook onPress function";
	var injectScript = "var ReactNative = require('react-native');\n" +
		"this.props.onPress&&ReactNative.NativeModules.GrowingIOModule.onClick(ReactNative.findNodeHandle(this));"
	injectScript = common.anonymousJsFunctionCall(injectScript);
	var result = `${content.substring(0, index)}\n${injectScript}\n${content.substring(index)}`
	return result;
}

function createViewTransformer(content){
	var objRe = /UIManager\.createView\([\s\S]{1,60}\.uiViewClassName,[\s\S]*?\)[,;]/
	var match = objRe.exec(content);
	if(!match)
		throw "can't inject createView, please connect with GrowingIO";
	var lastParentheses = content.lastIndexOf(')', match.index);
	var lastCommaIndex = content.lastIndexOf(',', lastParentheses);
	if(lastCommaIndex == -1)
		throw "can't inject createView,and lastCommaIndex is -1";
	var nextCommaIndex = content.indexOf(',', match.index);
	if(nextCommaIndex == -1)
		throw "can't inject createView, and nextCommaIndex is -1";
	var propsName = lastArgumentName(content, lastCommaIndex).trim();
	var tagName = lastArgumentName(content, nextCommaIndex).trim();
	//console.log(`propsName: ${propsName}, and tagName: ${tagName}`);
	var functionBody =
		`var clickable = false;
         var growingParams = ${propsName}.growingParams;
         if(${propsName}.onStartShouldSetResponder){
             clickable = true;
         }
         require('react-native').NativeModules.GrowingIOModule.prepareView(${tagName}, clickable, growingParams);
        `;
	var call = common.anonymousJsFunctionCall(functionBody);
	var lastReturn = content.lastIndexOf('return', match.index);
	var splitIndex = match.index;
	if(lastReturn > lastParentheses){
		splitIndex = lastReturn;
	}
	var result = `${content.substring(0, splitIndex)}\n${call}\n${content.substring(splitIndex)}`
	return result;
}

function lastArgumentName(content, index){
	--index;
	var lastComma = content.lastIndexOf(',', index);
	var lastParentheses = content.lastIndexOf('(', index);
	var start = Math.max(lastComma, lastParentheses);
	return content.substring(start + 1, index + 1);
}

module.exports = {
	injectCreateViewScript: injectCreateViewScript,
	createViewTransformer: createViewTransformer,
	injectOnPressScript: injectOnPressScript,
	injectNavigationScript: injectNavigationScript,
	injectReactNative: injectReactNative,
	injectReactNavigation: injectReactNavigation
}
