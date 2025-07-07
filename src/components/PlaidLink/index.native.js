"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_plaid_link_sdk_1 = require("react-native-plaid-link-sdk");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
function PlaidLink(_a) {
    var token = _a.token, _b = _a.onSuccess, onSuccess = _b === void 0 ? function () { } : _b, _c = _a.onExit, onExit = _c === void 0 ? function () { } : _c, onEvent = _a.onEvent;
    (0, react_native_plaid_link_sdk_1.usePlaidEmitter)(function (event) {
        Log_1.default.info('[PlaidLink] Handled Plaid Event: ', false, __assign({}, event));
        onEvent(event.eventName, event.metadata);
    });
    (0, react_1.useEffect)(function () {
        onEvent(CONST_1.default.BANK_ACCOUNT.PLAID.EVENTS_NAME.OPEN);
        (0, react_native_plaid_link_sdk_1.openLink)({
            tokenConfig: {
                token: token,
                noLoadingState: false,
            },
            onSuccess: function (_a) {
                var publicToken = _a.publicToken, metadata = _a.metadata;
                onSuccess({ publicToken: publicToken, metadata: metadata });
            },
            onExit: function (_a) {
                var error = _a.error, metadata = _a.metadata;
                Log_1.default.info('[PlaidLink] Exit: ', false, { error: error, metadata: metadata });
                onExit();
            },
        });
        return function () {
            (0, react_native_plaid_link_sdk_1.dismissLink)();
        };
        // We generally do not need to include the token as a dependency here as it is only provided once via props and should not change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return null;
}
PlaidLink.displayName = 'PlaidLink';
exports.default = PlaidLink;
