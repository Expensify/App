"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_freeze_1 = require("react-freeze");
var getIsScreenBlurred_1 = require("./getIsScreenBlurred");
function FreezeWrapper(_a) {
    var children = _a.children;
    var navigation = (0, native_1.useNavigation)();
    var currentRoute = (0, native_1.useRoute)();
    var _b = (0, react_1.useState)(false), isScreenBlurred = _b[0], setIsScreenBlurred = _b[1];
    var _c = (0, react_1.useState)(false), freezed = _c[0], setFreezed = _c[1];
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('state', function (e) { return setIsScreenBlurred((0, getIsScreenBlurred_1.default)(e.data.state, currentRoute.key)); });
        return function () { return unsubscribe(); };
    }, [currentRoute.key, navigation]);
    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    (0, react_1.useLayoutEffect)(function () {
        setFreezed(isScreenBlurred);
    }, [isScreenBlurred]);
    return <react_freeze_1.Freeze freeze={freezed}>{children}</react_freeze_1.Freeze>;
}
FreezeWrapper.displayName = 'FreezeWrapper';
exports.default = FreezeWrapper;
