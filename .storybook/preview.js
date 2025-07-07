"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameters = exports.decorators = void 0;
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var SearchContext_1 = require("@components/Search/SearchContext");
var ComposeProviders_1 = require("@src/components/ComposeProviders");
var HTMLEngineProvider_1 = require("@src/components/HTMLEngineProvider");
var LocaleContextProvider_1 = require("@src/components/LocaleContextProvider");
var OnyxProvider_1 = require("@src/components/OnyxProvider");
var withEnvironment_1 = require("@src/components/withEnvironment");
var withKeyboardState_1 = require("@src/components/withKeyboardState");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
require("./fonts.css");
react_native_onyx_1.default.init({
    keys: ONYXKEYS_1.default,
    initialKeyStates: (_a = {},
        _a[ONYXKEYS_1.default.NETWORK] = { isOffline: false },
        _a),
});
var decorators = [
    function (Story) { return (<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, HTMLEngineProvider_1.default, react_native_safe_area_context_1.SafeAreaProvider, portal_1.PortalProvider, withEnvironment_1.EnvironmentProvider, withKeyboardState_1.KeyboardStateProvider, SearchContext_1.SearchContextProvider]}>
            <Story />
        </ComposeProviders_1.default>); },
];
exports.decorators = decorators;
var parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
        },
    },
};
exports.parameters = parameters;
