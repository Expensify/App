"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSafeAreaInsets = exports.useSafeAreaFrame = exports.SafeAreaView = exports.SafeAreaInsetsContext = exports.SafeAreaConsumer = exports.SafeAreaProvider = void 0;
exports.withSafeAreaInsets = withSafeAreaInsets;
var react_1 = require("react");
var react_native_1 = require("react-native");
var insets = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};
function withSafeAreaInsets(WrappedComponent) {
    function WithSafeAreaInsets(props) {
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} 
        // eslint-disable-next-line react/prop-types
        ref={props.forwardedRef} insets={insets}/>);
    }
    var WithSafeAreaInsetsWithRef = (0, react_1.forwardRef)(function (props, ref) { return (<WithSafeAreaInsets 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} forwardedRef={ref}/>); });
    return WithSafeAreaInsetsWithRef;
}
var SafeAreaView = react_native_1.View;
exports.SafeAreaView = SafeAreaView;
var SafeAreaProvider = function (props) { return props.children; };
exports.SafeAreaProvider = SafeAreaProvider;
var SafeAreaConsumer = function (props) { var _a; return (_a = props.children) === null || _a === void 0 ? void 0 : _a.call(props, insets); };
exports.SafeAreaConsumer = SafeAreaConsumer;
var SafeAreaInsetsContext = {
    Consumer: SafeAreaConsumer,
};
exports.SafeAreaInsetsContext = SafeAreaInsetsContext;
var useSafeAreaFrame = jest.fn(function () { return ({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
}); });
exports.useSafeAreaFrame = useSafeAreaFrame;
var useSafeAreaInsets = jest.fn(function () { return insets; });
exports.useSafeAreaInsets = useSafeAreaInsets;
