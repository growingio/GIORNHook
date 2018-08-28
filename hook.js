#!/usr/bin/env node

// version for hook.js
var HOOK_VERSION = "v0.9.0";

var OPT_RUN = 0;
var OPT_DISCARD = 0;
var OPT_VERSION = 0;
var OPT_HELP = 0;

var OPT_UNKNOWN = 0;

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
   console.log('Unknown options: ' +  process.argv[2]);
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

if (OPT_RUN == 1) {
    return;
}

if (OPT_DISCARD == 1) {
    return;
}