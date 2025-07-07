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
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('state', function (e) { return setIsScreenBlurred((0, getIsScreenBlurred_1.default)(e.data.state, currentRoute.key)); });
        return function () { return unsubscribe(); };
    }, [currentRoute.key, navigation]);
    return <react_freeze_1.Freeze freeze={isScreenBlurred}>{children}</react_freeze_1.Freeze>;
}
FreezeWrapper.displayName = 'FreezeWrapper';
exports.default = FreezeWrapper;
