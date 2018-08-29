var injector = require('../GIOInjector')

function test_injector_create_view(){
	var script = `        );
        var updatePayload = diffProperties(
          null,
          emptyObject$1,
          newProps,
          currentHostContext.validAttributes
        );
        UIManager.createView(
          oldProps,
          currentHostContext.uiViewClassName,
          rootContainerInstance,
          updatePayload
        );
        currentHostContext = new ReactNativeFiberHostComponent(
          oldProps,
          currentHostContext
        );
        instanceCache[oldProps] = workInProgress;
        instanceProps[oldProps] = newProps;`

	var result = injector.createViewTransformer(script);
	console.log(`result: ${result}`);
}

test_injector_create_view();
