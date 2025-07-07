"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var implementation_1 = require("./implementation");
function BaseTextInputE2E(props, ref) {
    (0, react_1.useEffect)(function () {
        var testId = props.testID;
        if (!testId) {
            return;
        }
        console.debug("[E2E] BaseTextInput: text-input with testID: ".concat(testId, " changed text to ").concat(props.value));
        react_native_1.DeviceEventEmitter.emit('onChangeText', { testID: testId, value: props.value });
    }, [props.value, props.testID]);
    return (<implementation_1.default ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
exports.default = (0, react_1.forwardRef)(BaseTextInputE2E);
