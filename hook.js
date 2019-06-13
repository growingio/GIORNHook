#!/usr/bin/env node

var path = require("path");
var injector = require("./GIOInjector");
var packageObj = require("./package.json");

var userPackageObj = require("../../package.json");

// version for hook.js
var HOOK_VERSION = packageObj["version"];

var OPT_RUN = 0;
var OPT_DISCARD = 0;
var OPT_VERSION = 0;
var OPT_HELP = 0;

var OPT_UNKNOWN = 0;

// react-native path
var reactNativePath;
// react-navigation path
var reactNavigationPath;
var reactNavigationPath3X;
// react-native-navigation path
var reactNativeNavigationPath;



switch(process.argv[2]) {
    case '-v':
    case '--version':
        OPT_VERSION = 1;
        break;
    case '-run':
        OPT_RUN = 1;
        break;
    case '-discard':
        OPT_DISCARD = 1;
        break;
    case '-h':
    case '--help':
        OPT_HELP = 1;
        break;
    default:
        OPT_UNKNOWN = 1;
}

if (OPT_UNKNOWN == 1) {
   console.log('');
   if (OPT_RUN == 1) {
       console.log('You need to see the details of the -run command');
   } else if (OPT_DISCARD == 1) {
       console.log('You need to see the details of the -discard command');
   } else {
       console.log('Unknown options: ' +  process.argv[2]);
   }
   console.log('');
   OPT_HELP = 1;
}

if (OPT_HELP == 1) {
   console.log('');
   console.log('usage: hook.js  [[-v | --version] hook.js version]');
   console.log('       hook.js  [[-run] hook react native js]');
   console.log('       hook.js  [[-discard] discard hook]');
   console.log('       hook.js  [-h, --help: this help]');
   return;
}

if (OPT_VERSION == 1) {
    console.log('');
    console.log('hook.js version ' + HOOK_VERSION);
    console.log('');
    return;
}

var dir = path.resolve(__dirname, '..');

/**
 * path config
 */
if (userPackageObj && userPackageObj["GrowingIO"] && userPackageObj["GrowingIO"]["path"]) {
    var pathObj = userPackageObj["GrowingIO"]["path"];
    // react-native path
    var rnativePath = pathObj["react-native"];
    if(rnativePath && rnativePath.length > 0){
        if(!rnativePath.endsWith('/')){
            rnativePath += '/';
        }
        reactNativePath = rnativePath;
    } else {
        reactNativePath = dir + '/react-native';
    }

    // react-navigation path
    var rnavigationPath = pathObj["react-navigation"];
    if(rnavigationPath && rnavigationPath.length > 0){
        if(!rnavigationPath.endsWith('/')){
            rnavigationPath += '/';
        }
        reactNavigationPath = rnavigationPath;
    } else {
        reactNavigationPath = dir + '/react-navigation';
    }

    // react-native-navigation path
    var rnnPath = pathObj["react-native-navigation"];
    if(rnnPath && rnnPath.length > 0){
        if(!rnnPath.endsWith('/')){
            rnnPath += '/';
        }
        reactNativeNavigationPath = rnnPath;
    } else {
        reactNativeNavigationPath = dir + '/react-native-navigation';
    }

} else {
    // react-native path
    reactNativePath = dir + '/react-native';
    // react-navigation path
    reactNavigationPath = dir + '/react-navigation';
    reactNavigationPath3X = dir + '/@react-navigation/native';
    // react-native-navigation path
    reactNativeNavigationPath = dir + '/react-native-navigation';
}

/**
 * hook config
 */
if (OPT_RUN == 1) {
    if (userPackageObj && userPackageObj["GrowingIO"] && userPackageObj["GrowingIO"]["hook"]) {
        var hookObj = userPackageObj["GrowingIO"]["hook"];
        var reactNavigationHook = hookObj["react-navigation"];
        if (reactNavigationHook && reactNavigationHook == "ignore") {
        } else {
            injector.injectReactNavigation(reactNavigationPath);
        }
        
        var reactNativeNavigationHook = hookObj["react-native-navigation"];
        if (reactNativeNavigationHook && reactNativeNavigationHook == "ignore") {
        } else {
            injector.injectReactNativeNavigation(reactNativeNavigationPath);
        }
    } else {
        injector.injectReactNavigation(reactNavigationPath);
        injector.injectReactNavigation3(reactNavigationPath3X)
        injector.injectReactNativeNavigation(reactNativeNavigationPath);
    }
    injector.injectReactNative(reactNativePath);
    
    return;
}

if (OPT_DISCARD == 1) {
    injector.injectReactNative(reactNativePath, true);
    injector.injectReactNavigation(reactNavigationPath, true);
    injector.injectReactNavigation3(reactNavigationPath3X, true);
    injector.injectReactNativeNavigation(reactNativeNavigationPath, true);
    return;
}