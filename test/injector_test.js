var injector = require('../GIOInjector');

function test_injector_react_native(){
	injector.injectReactNative('./node_modules/react-native');
}

function test_injector_react_native_reset(){
	injector.injectReactNative('./node_modules/react-native/', true)
}

test_injector_react_native_reset();
test_injector_react_native();
