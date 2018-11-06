# GIORNHOOK

[![Version npm](https://img.shields.io/npm/v/react-native-autotrack-growingio.svg?colorB=blue)](https://www.npmjs.com/package/react-native-autotrack-growingio)

将修改ReactNative的部分源码， 用于实现GrowingIO的无埋点采集。 具体更改原理， 请参见代码部分


### 集成
添加依赖: 
	
	# 通过npmjs
	npm install --save react-native-autotrack-growingio
	
	# 直接使用git
	npm install --save https://github.com/growingio/GIORNHook.git#0.0.4
	
	
	

调用方式(手动调用): 
	
	cd node_modules/react-native-autotrack-growingio/
	
	# 显示帮助
	node hook.js -h
	
	# 进行更改
	node hook.js -run
	
	# 撤销更改
	node hook.js -discard
	


考虑到了hook.js每次npm install之后都需要执行， 建议直接配在项目的package.json中, 如下: 
	
	"scripts": {
		  "postinstall": "node node_modules/react-native-autotrack-growingio/hook.js -run"
	}
	

### 注意事项
为了稳定性， 以及后续版本间的兼容性问题， 建议升级react-native-autotrack-growingio前， 删除node_modules. 
