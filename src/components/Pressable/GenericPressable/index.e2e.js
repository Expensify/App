"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPressableProps = getPressableProps;
var react_1 = require("react");
var react_native_1 = require("react-native");
var implementation_1 = require("./implementation");
var pressableRegistry = new Map();
function getPressableProps(testId) {
    return pressableRegistry.get(testId);
}
function E2EGenericPressableWrapper(props, ref) {
    (0, react_1.useEffect)(function () {
        var testId = props.testID;
        if (!testId) {
            return;
        }
        console.debug("[E2E] E2EGenericPressableWrapper: Registering pressable with testID: ".concat(testId));
        pressableRegistry.set(testId, props);
        react_native_1.DeviceEventEmitter.emit('onBecameVisible', testId);
    }, [props]);
    return (<implementation_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref}/>);
}
E2EGenericPressableWrapper.displayName = 'E2EGenericPressableWrapper';
exports.default = (0, react_1.forwardRef)(E2EGenericPressableWrapper);
