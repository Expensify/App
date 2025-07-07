"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AUTOSCROLL_TO_TOP_THRESHOLD = 128;
function BaseInvertedFlatListE2e(props, ref) {
    var _a;
    var shouldEnableAutoScrollToTopThreshold = props.shouldEnableAutoScrollToTopThreshold, rest = __rest(props, ["shouldEnableAutoScrollToTopThreshold"]);
    var handleViewableItemsChanged = (0, react_1.useMemo)(function () {
        return function (_a) {
            var viewableItems = _a.viewableItems;
            react_native_1.DeviceEventEmitter.emit('onViewableItemsChanged', viewableItems);
        };
    }, []);
    var maintainVisibleContentPosition = (0, react_1.useMemo)(function () {
        var _a;
        var config = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: ((_a = rest.data) === null || _a === void 0 ? void 0 : _a.length) ? Math.min(1, rest.data.length - 1) : 0,
        };
        if (shouldEnableAutoScrollToTopThreshold) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }
        return config;
    }, [shouldEnableAutoScrollToTopThreshold, (_a = rest.data) === null || _a === void 0 ? void 0 : _a.length]);
    return (<react_native_1.FlatList 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} ref={ref} maintainVisibleContentPosition={maintainVisibleContentPosition} inverted onViewableItemsChanged={handleViewableItemsChanged}/>);
}
BaseInvertedFlatListE2e.displayName = 'BaseInvertedFlatListE2e';
exports.default = (0, react_1.forwardRef)(BaseInvertedFlatListE2e);
