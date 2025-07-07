"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
exports.default = (function (onyxKeyName) {
    var _a;
    var Context = (0, react_1.createContext)(null);
    function Provider(props) {
        return <Context.Provider value={props[onyxKeyName]}>{props.children}</Context.Provider>;
    }
    Provider.displayName = "".concat(expensify_common_1.Str.UCFirst(onyxKeyName), "Provider");
    // eslint-disable-next-line
    var ProviderWithOnyx = (0, react_native_onyx_1.withOnyx)((_a = {},
        _a[onyxKeyName] = {
            key: onyxKeyName,
        },
        _a))(Provider);
    var useOnyxContext = function () {
        var value = (0, react_1.useContext)(Context);
        if (value === null) {
            throw new Error("useOnyxContext must be used within a OnyxProvider [key: ".concat(onyxKeyName, "]"));
        }
        return value;
    };
    return [ProviderWithOnyx, Context, useOnyxContext];
});
