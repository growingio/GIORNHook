#!/usr/bin/env node

var path = require("path");
var injector = require("./GIOInjector");

// version for hook.js
var HOOK_VERSION = "v0.9.0";

var OPT_RUN = 0;
var OPT_RUN_PATH = 0;
var OPT_DISCARD = 0;
var OPT_VERSION = 0;
var OPT_HELP = 0;

var OPT_UNKNOWN = 0;

// react-native path
var reactNativePath;
// react-navigation path
var reactNavigationPath;



switch(process.argv[2]) {
    case '-v':
    case '--version':
        OPT_VERSION = 1;
        break;
    case '-run':
        OPT_RUN = 1;
        if (process.argv.length != 3 && process.argv.length != 5) {
            OPT_UNKNOWN = 1;
        } else if (process.argv[3] && process.argv[4]) {
            OPT_RUN_PATH = 1;
        }
        break;
    case '-discard':
        OPT_DISCARD = 1;
        if (process.argv.length != 3 && process.argv.length != 5) {
            OPT_UNKNOWN = 1;
        } else if (process.argv[3] && process.argv[4]) {
            OPT_RUN_PATH = 1;
        }
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
   console.log('       hook.js  [[-run | -run react-nativePath react-navigationPath] hook react native js]');
   console.log('       hook.js  [[-discard | -discard react-nativePath react-navigationPath] discard hook]');
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

if (OPT_RUN_PATH) {
    // react-native path
    reactNativePath = process.argv[3];
    // react-navigation path
    reactNavigationPath = process.argv[4];
} else {
    // react-native path
    reactNativePath = dir + '/node_modules/react-native';
    // react-navigation path
    reactNavigationPath = dir + '/node_modules/react-navigation';
}

if (OPT_RUN == 1) {
    injector.injectReactNative(reactNativePath);
    injector.injectReactNavigation(reactNavigationPath);
    return;
}

if (OPT_DISCARD == 1) {
    injector.injectReactNative(reactNativePath, true);
    injector.injectReactNavigation(reactNavigationPath, true);
    return;
}