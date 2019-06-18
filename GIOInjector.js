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

/**
 * hook react navigation
 */
function injectReactNavigation(dirPath, reset=false){
	if(!dirPath.endsWith('/')){
		dirPath += '/';
	}
	var createNavigationContainerJsFilePath = `${dirPath}src/createNavigationContainer.js`;
	var getChildEventSubscriberJsFilePath = `${dirPath}src/getChildEventSubscriber.js`;
	if(!fs.existsSync(createNavigationContainerJsFilePath)){
		return
	}
	if(!fs.existsSync(getChildEventSubscriberJsFilePath)){
		return;
	}
	console.log(`found and modify createNavigationContainer.js: ${createNavigationContainerJsFilePath}`);
	console.log(`found and modify getChildEventSubscriber.js: ${getChildEventSubscriberJsFilePath}`);
	if(reset){
		common.resetFile(createNavigationContainerJsFilePath);
		common.resetFile(getChildEventSubscriberJsFilePath);
	}else{
		injectNavigationScript(createNavigationContainerJsFilePath, getChildEventSubscriberJsFilePath);
		
	}
}

/**
 * hook react navigation 3.x
 * @param dirPath @react-navigation/native的地址
 */
function injectReactNavigation3(dirPath, reset=false) {
	if (!dirPath.endsWith('/')) {
		dirPath += '/';
	}
	const createAppContainerJsFilePath = `${dirPath}src/createAppContainer.js`;
	if (!fs.existsSync(createAppContainerJsFilePath)) {
		return;
	}
	console.log(`found and modify createAppContainer.js: ${createAppContainerJsFilePath}`);
	if (reset) {
		common.resetFile(createAppContainerJsFilePath);
	} else {
		common.modifyFile(createAppContainerJsFilePath, onNavigationStateChangeTransformer3);
	}
}

/**
 * hook react native navigation
 */
function injectReactNativeNavigation(dirPath, reset=false){
	if(!dirPath.endsWith('/')){
		dirPath += '/';
	}

	var screenJsFilePath = `${dirPath}src/Screen.js`;
	var androidPlatformSpecificJsFilePath = `${dirPath}src/platformSpecific.android.js`;
	var iOSPlatformSpecificJsFilePath = `${dirPath}src/deprecated/platformSpecificDeprecated.ios.js`;
	
	// only judge screenJsFilePath
	if(!fs.existsSync(screenJsFilePath)){
		console.log(`not fond NativeNavigation: ${screenJsFilePath} , and return`);
		return;
	}

	if(reset){
		common.resetFile(screenJsFilePath);
	}else{
        injectReactNativeNavigationScreenScript(screenJsFilePath);
	}

	var reactNativeNavigationPlatformJSFiles = [androidPlatformSpecificJsFilePath, iOSPlatformSpecificJsFilePath];
	reactNativeNavigationPlatformJSFiles.forEach(function(jsFilePath, index){
			if(fs.existsSync(jsFilePath)){
               if(reset){
                 common.resetFile(jsFilePath);
			   }else{
                 injectReactNativeNavigationPlatformScript(jsFilePath);
			   }
			}
	});
}

function injectReactNativeNavigationScreenScript(jsFilePath){
	console.log(`find and modify Screen.js: ${jsFilePath}`);
    common.modifyFile(jsFilePath, onReactNativeNavigationScreenTransformer);
}

function injectReactNativeNavigationPlatformScript(jsFilePath){
	console.log(`find and modify PlatformScript.js: ${jsFilePath}`);
    common.modifyFile(jsFilePath, onReactNativeNavigationPlatformTransformer);
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

function onNavigationStateChangeTransformer3(content){
	var index = content.indexOf("if (typeof this.props.onNavigationStateChange === 'function') {");
	if(index == -1)
		throw "index is -1";
	content = content.substring(0, index) + common.anonymousJsFunctionCall(navigationString3('prevNav', 'nav', 'action'))  + '\n' + content.substring(index)
	var didMountIndex = content.indexOf('componentDidMount() {');
	if(didMountIndex == -1)
		throw "didMountIndex is -1";
	var forEachIndex = content.indexOf('this._actionEventSubscribers.forEach(subscriber =>', didMountIndex);
	var clojureEnd = content.indexOf(';', forEachIndex);
	content = content.substring(0, forEachIndex) + '{' +
		common.anonymousJsFunctionCall(navigationString3(null, 'this.state.nav', null)) + '\n' +
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

function onReactNativeNavigationScreenTransformer(content){
	var importScript = "const NavigationSpecific = {";
	var importScriptIndex = content.indexOf(importScript);
	if(importScriptIndex == -1)
		throw "cann't find NavigationSpecific, please check your react-native-navigation version, and resport to GrowingIO"
	var injectImportScript = "import anotherPlatformSpecific from './platformSpecific'\n";
	content = content.substring(0, importScriptIndex) + injectImportScript + content.substring(importScriptIndex);
	var script = "onNavigatorEvent(event) {";
	var index = content.indexOf(script);
	if(index == -1)
		throw "index is -1";
	content = content.substring(0, index + script.length) + common.anonymousJsFunctionCall(reactNativeNavigationScreenString()) + '\n' + content.substring(index + script.length);
	var constructorEndScript = "this.navigatorEventSubscription = null;";
	var constructorIndex = content.indexOf(constructorEndScript);
	if (constructorIndex == -1)
		throw "cann't find Screen.js's constructor, please check your react-native-navigation version, and report to GrowingIO";
	var injectEndScript = "\nthis._registerNavigatorEvent();"
	var injectPoint = constructorIndex + constructorEndScript.length;
	content = content.substring(0, injectPoint) + injectEndScript + content.substring(injectPoint);
	return content;
}

function onReactNativeNavigationPlatformTransformer(content){
	var saveScript = "function savePassProps(params) {";
	var index = content.indexOf(saveScript);
	if(index == -1)
		throw "index is -1";
	content = content.substring(0, index + saveScript.length) + common.anonymousJsFunctionCall(reactNativeNavigationPlatformString()) + '\n' + content.substring(index + saveScript.length);
	
	var propsScript = `const GrowingScreenProps = {};`;
	var getPageNameFuncScript = `function getGrowingPageName(screenInstanceID) {
		return GrowingScreenProps[screenInstanceID];
	}`;
	content = content.substring(0, index) + propsScript + '\n' + getPageNameFuncScript + `\n` + content.substring(index);

	var exportIOSScript = "export default {";
	var exportAndroidScript = "module.exports = {";
	index = content.indexOf(exportIOSScript);
	var exportScriptLength;
	if(index == -1){
		index = content.indexOf(exportAndroidScript);
		if(index == -1){
			throw "index is -1";
		}
		exportScriptLength = exportAndroidScript.length;
	} else {
		exportScriptLength = exportIOSScript.length;
	}
	content = content.substring(0, index + exportScriptLength) + `\n` + `getGrowingPageName,` + content.substring(index + exportScriptLength);
	return content;
}

function reactNativeNavigationScreenString(){
	var script = `var growingPageName = null;
    if(platformSpecific.getGrowingPageName){
        growingPageName = platformSpecific.getGrowingPageName(this.screenInstanceID);
    }else{
        growingPageName = anotherPlatformSpecific.getGrowingPageName(this.screenInstanceID);
    }
    if(growingPageName == null){
        return;
    }
    if (event.id == "willAppear") {
		require('react-native').NativeModules.GrowingIOModule.onPagePrepare(growingPageName);
    } else if (event.id == "didAppear") {
        require('react-native').NativeModules.GrowingIOModule.onPageShow(growingPageName);
    }`;
	return script;
}

function reactNativeNavigationPlatformString(){
	var script = `if (params.navigationParams) {
		var screenInstanceID = params.navigationParams.screenInstanceID;
		if (params.growingPagePath) {
		  GrowingScreenProps[screenInstanceID] = params.growingPagePath; 
		} else if (params.title) {
		  GrowingScreenProps[screenInstanceID] = params.title; 
		} else {
		  GrowingScreenProps[screenInstanceID] = params.screen;
		}
	  }`;
	return script;
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

function navigationString3(prevStateVarName, currentStateVarName, actionName){
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
								var iosOnPagePrepare = false;
								var iosOnPageShow = false;
	
								if (require('react-native').Platform.OS === 'android') {
									if(type == 'Navigation/SET_PARAMS' || type == 'Navigation/COMPLETE_TRANSITION') {
										return;
									}
								} else if (require('react-native').Platform.OS === 'ios') {
									if((type == 'Navigation/BACK' && (${currentStateVarName} && !${currentStateVarName}.isTransitioning)) || type == 'Navigation/COMPLETE_TRANSITION') {
										iosOnPageShow = true;
									} else if (type != 'Navigation/SET_PARAMS') {
										iosOnPagePrepare = true;
									}
									if (!iosOnPagePrepare && !iosOnPageShow) {
										return;
									}
								}
	
										
										`
		}
	
		script = `${script} var pageName = $$$getActivePageName$$$(${currentStateVarName});
		if (require('react-native').Platform.OS === 'android') {
		    if (${prevStateVarName}){
		        var prevPageName = $$$getActivePageName$$$(${prevStateVarName});
		        if (pageName == prevPageName){
  		            return;
		        }
     		}
		    require('react-native').NativeModules.GrowingIOModule.onPageShow(pageName);
		} else if (require('react-native').Platform.OS === 'ios') {
			if (!${actionName} || iosOnPageShow) {
				require('react-native').NativeModules.GrowingIOModule.onPageShow(pageName);
			} else if (iosOnPagePrepare) {
				require('react-native').NativeModules.GrowingIOModule.onPagePrepare(pageName);
			}
		}`;
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
	injectReactNavigation: injectReactNavigation,
	injectReactNavigation3,
	injectReactNativeNavigation: injectReactNativeNavigation
}
