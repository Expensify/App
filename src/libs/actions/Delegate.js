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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS_TO_PRESERVE_DELEGATE_ACCESS = void 0;
exports.connect = connect;
exports.disconnect = disconnect;
exports.clearDelegatorErrors = clearDelegatorErrors;
exports.addDelegate = addDelegate;
exports.requestValidationCode = requestValidationCode;
exports.clearDelegateErrorsByField = clearDelegateErrorsByField;
exports.restoreDelegateSession = restoreDelegateSession;
exports.isConnectedAsDelegate = isConnectedAsDelegate;
exports.updateDelegateRoleOptimistically = updateDelegateRoleOptimistically;
exports.clearDelegateRolePendingAction = clearDelegateRolePendingAction;
exports.updateDelegateRole = updateDelegateRole;
exports.removeDelegate = removeDelegate;
exports.openSecuritySettingsPage = openSecuritySettingsPage;
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var Log_1 = require("@libs/Log");
var NetworkStore = require("@libs/Network/NetworkStore");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var App_1 = require("./App");
var Report_1 = require("./Report");
var updateSessionAuthTokens_1 = require("./Session/updateSessionAuthTokens");
var updateSessionUser_1 = require("./Session/updateSessionUser");
var delegatedAccess;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (val) {
        var _a;
        delegatedAccess = (_a = val === null || val === void 0 ? void 0 : val.delegatedAccess) !== null && _a !== void 0 ? _a : {};
    },
});
var credentials = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CREDENTIALS,
    callback: function (value) { return (credentials = value !== null && value !== void 0 ? value : {}); },
});
var stashedCredentials = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.STASHED_CREDENTIALS,
    callback: function (value) { return (stashedCredentials = value !== null && value !== void 0 ? value : {}); },
});
var session = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) { return (session = value !== null && value !== void 0 ? value : {}); },
});
var stashedSession = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.STASHED_SESSION,
    callback: function (value) { return (stashedSession = value !== null && value !== void 0 ? value : {}); },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (newActivePolicyID) {
        activePolicyID = newActivePolicyID;
    },
});
var KEYS_TO_PRESERVE_DELEGATE_ACCESS = [
    ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE,
    ONYXKEYS_1.default.PREFERRED_THEME,
    ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
    ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
    ONYXKEYS_1.default.SESSION,
    ONYXKEYS_1.default.STASHED_SESSION,
    ONYXKEYS_1.default.IS_LOADING_APP,
    ONYXKEYS_1.default.HAS_LOADED_APP,
    ONYXKEYS_1.default.STASHED_CREDENTIALS,
    // We need to preserve the sidebar loaded state since we never unmount the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS_1.default.IS_SIDEBAR_LOADED,
    ONYXKEYS_1.default.NETWORK,
];
exports.KEYS_TO_PRESERVE_DELEGATE_ACCESS = KEYS_TO_PRESERVE_DELEGATE_ACCESS;
/**
 * Connects the user as a delegate to another account.
 * Returns a Promise that resolves to true on success, false on failure, or undefined if not applicable.
 */
function connect(email, isFromOldDot) {
    var _a, _b, _c;
    if (isFromOldDot === void 0) { isFromOldDot = false; }
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegators) && !isFromOldDot) {
        return;
    }
    react_native_onyx_1.default.set(ONYXKEYS_1.default.STASHED_CREDENTIALS, credentials);
    react_native_onyx_1.default.set(ONYXKEYS_1.default.STASHED_SESSION, session);
    var previousAccountID = (0, Report_1.getCurrentUserAccountID)();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: (_a = {},
                            _a[email] = null,
                            _a),
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: (_b = {},
                            _b[email] = null,
                            _b),
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: (_c = {},
                            _c[email] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                            _c),
                    },
                },
            },
        },
    ];
    // We need to access the authToken directly from the response to update the session
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE, { to: email }, { optimisticData: optimisticData, successData: successData, failureData: failureData })
        .then(function (response) {
        if (!(response === null || response === void 0 ? void 0 : response.restrictedToken) || !(response === null || response === void 0 ? void 0 : response.encryptedAuthToken)) {
            Log_1.default.alert('[Delegate] No auth token returned while connecting as a delegate');
            react_native_onyx_1.default.update(failureData);
            return;
        }
        if (!activePolicyID && CONFIG_1.default.IS_HYBRID_APP) {
            Log_1.default.alert('[Delegate] Unable to access activePolicyID');
            react_native_onyx_1.default.update(failureData);
            return;
        }
        var restrictedToken = response.restrictedToken;
        var policyID = activePolicyID;
        return SequentialQueue.waitForIdle()
            .then(function () { return react_native_onyx_1.default.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS); })
            .then(function () {
            var _a;
            // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
            (0, updateSessionAuthTokens_1.default)(response === null || response === void 0 ? void 0 : response.restrictedToken, response === null || response === void 0 ? void 0 : response.encryptedAuthToken);
            NetworkStore.setAuthToken((_a = response === null || response === void 0 ? void 0 : response.restrictedToken) !== null && _a !== void 0 ? _a : null);
            (0, App_1.confirmReadyToOpenApp)();
            return (0, App_1.openApp)().then(function () {
                if (!CONFIG_1.default.IS_HYBRID_APP || !policyID) {
                    return true;
                }
                react_native_hybrid_app_1.default.switchAccount({
                    newDotCurrentAccountEmail: email,
                    authToken: restrictedToken,
                    policyID: policyID,
                    accountID: String(previousAccountID),
                });
                return true;
            });
        });
    })
        .catch(function (error) {
        Log_1.default.alert('[Delegate] Error connecting as delegate', { error: error });
        react_native_onyx_1.default.update(failureData);
        return false;
    });
}
function disconnect() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: { disconnect: null },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: undefined,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: { disconnect: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError') },
                },
            },
        },
    ];
    // We need to access the authToken directly from the response to update the session
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE, {}, { optimisticData: optimisticData, successData: successData, failureData: failureData })
        .then(function (response) {
        if (!(response === null || response === void 0 ? void 0 : response.authToken) || !(response === null || response === void 0 ? void 0 : response.encryptedAuthToken)) {
            Log_1.default.alert('[Delegate] No auth token returned while disconnecting as a delegate');
            restoreDelegateSession(stashedSession);
            return;
        }
        if (!(response === null || response === void 0 ? void 0 : response.requesterID) || !(response === null || response === void 0 ? void 0 : response.requesterEmail)) {
            Log_1.default.alert('[Delegate] No requester data returned while disconnecting as a delegate');
            restoreDelegateSession(stashedSession);
            return;
        }
        var requesterEmail = response.requesterEmail;
        var authToken = response.authToken;
        return SequentialQueue.waitForIdle()
            .then(function () { return react_native_onyx_1.default.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS); })
            .then(function () {
            var _a;
            react_native_onyx_1.default.set(ONYXKEYS_1.default.CREDENTIALS, __assign(__assign({}, stashedCredentials), { accountID: response.requesterID }));
            react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, __assign(__assign({}, stashedSession), { accountID: response.requesterID, email: requesterEmail, authToken: authToken, encryptedAuthToken: response.encryptedAuthToken }));
            react_native_onyx_1.default.set(ONYXKEYS_1.default.STASHED_CREDENTIALS, {});
            react_native_onyx_1.default.set(ONYXKEYS_1.default.STASHED_SESSION, {});
            NetworkStore.setAuthToken((_a = response === null || response === void 0 ? void 0 : response.authToken) !== null && _a !== void 0 ? _a : null);
            (0, App_1.confirmReadyToOpenApp)();
            (0, App_1.openApp)().then(function () {
                if (!CONFIG_1.default.IS_HYBRID_APP) {
                    return;
                }
                react_native_hybrid_app_1.default.switchAccount({
                    newDotCurrentAccountEmail: requesterEmail,
                    authToken: authToken,
                    policyID: '',
                    accountID: '',
                });
            });
        });
    })
        .catch(function (error) {
        Log_1.default.alert('[Delegate] Error disconnecting as a delegate', { error: error });
    });
}
function clearDelegatorErrors() {
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegators)) {
        return;
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { delegatedAccess: { delegators: delegatedAccess.delegators.map(function (delegator) { return (__assign(__assign({}, delegator), { errorFields: undefined })); }) } });
}
function requestValidationCode() {
    API.write(types_1.WRITE_COMMANDS.RESEND_VALIDATE_CODE, null);
}
function addDelegate(email, role, validateCode) {
    var _a, _b;
    var _c;
    var existingDelegate = (_c = delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegates) === null || _c === void 0 ? void 0 : _c.find(function (delegate) { return delegate.email === email; });
    var optimisticDelegateData = function () {
        var _a, _b, _c;
        if (existingDelegate) {
            return ((_b = (_a = delegatedAccess.delegates) === null || _a === void 0 ? void 0 : _a.map(function (delegate) {
                return delegate.email !== email
                    ? delegate
                    : __assign(__assign({}, delegate), { isLoading: true, pendingFields: { email: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
            })) !== null && _b !== void 0 ? _b : []);
        }
        return __spreadArray(__spreadArray([], ((_c = delegatedAccess.delegates) !== null && _c !== void 0 ? _c : []), true), [
            {
                email: email,
                role: role,
                isLoading: true,
                pendingFields: { email: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD },
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ], false);
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: optimisticDelegateData(),
                    errorFields: {
                        addDelegate: (_a = {},
                            _a[email] = null,
                            _a),
                    },
                },
                isLoading: true,
            },
        },
    ];
    var successDelegateData = function () {
        var _a, _b, _c;
        if (existingDelegate) {
            return ((_b = (_a = delegatedAccess.delegates) === null || _a === void 0 ? void 0 : _a.map(function (delegate) {
                return delegate.email !== email
                    ? delegate
                    : __assign(__assign({}, delegate), { isLoading: false, pendingAction: null, pendingFields: { email: null, role: null }, optimisticAccountID: undefined });
            })) !== null && _b !== void 0 ? _b : []);
        }
        return __spreadArray(__spreadArray([], ((_c = delegatedAccess.delegates) !== null && _c !== void 0 ? _c : []), true), [
            {
                email: email,
                role: role,
                isLoading: false,
                pendingAction: null,
                pendingFields: { email: null, role: null },
                optimisticAccountID: undefined,
            },
        ], false);
    };
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: successDelegateData(),
                    errorFields: {
                        addDelegate: (_b = {},
                            _b[email] = null,
                            _b),
                    },
                },
                isLoading: false,
            },
        },
    ];
    var failureDelegateData = function () {
        var _a, _b, _c;
        if (existingDelegate) {
            return ((_b = (_a = delegatedAccess.delegates) === null || _a === void 0 ? void 0 : _a.map(function (delegate) {
                return delegate.email !== email
                    ? delegate
                    : __assign(__assign({}, delegate), { isLoading: false });
            })) !== null && _b !== void 0 ? _b : []);
        }
        return __spreadArray(__spreadArray([], ((_c = delegatedAccess.delegates) !== null && _c !== void 0 ? _c : []), true), [
            {
                email: email,
                role: role,
                isLoading: false,
                pendingFields: { email: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD },
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ], false);
    };
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: failureDelegateData(),
                },
                isLoading: false,
            },
        },
    ];
    var optimisticResetActionCode = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
        value: {
            validateCodeSent: null,
        },
    };
    optimisticData.push(optimisticResetActionCode);
    var parameters = { delegateEmail: email, validateCode: validateCode, role: role };
    API.write(types_1.WRITE_COMMANDS.ADD_DELEGATE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function removeDelegate(email) {
    var _a, _b;
    var _c, _d, _e;
    if (!email) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegate: (_a = {},
                            _a[email] = null,
                            _a),
                    },
                    delegates: (_c = delegatedAccess.delegates) === null || _c === void 0 ? void 0 : _c.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, pendingFields: { email: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE } }) : delegate;
                    }),
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: (_d = delegatedAccess.delegates) === null || _d === void 0 ? void 0 : _d.filter(function (delegate) { return delegate.email !== email; }),
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegate: (_b = {},
                            _b[email] = null,
                            _b),
                    },
                    delegates: (_e = delegatedAccess.delegates) === null || _e === void 0 ? void 0 : _e.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { pendingAction: null, pendingFields: undefined }) : delegate;
                    }),
                },
            },
        },
    ];
    var parameters = { delegateEmail: email };
    API.write(types_1.WRITE_COMMANDS.REMOVE_DELEGATE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearDelegateErrorsByField(email, fieldName) {
    var _a, _b;
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegates)) {
        return;
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, {
        delegatedAccess: {
            errorFields: (_a = {},
                _a[fieldName] = (_b = {},
                    _b[email] = null,
                    _b),
                _a),
        },
    });
}
function isConnectedAsDelegate() {
    return !!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegate);
}
function updateDelegateRole(email, role, validateCode) {
    var _a, _b;
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegates)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        updateDelegateRole: (_a = {},
                            _a[email] = null,
                            _a),
                    },
                    delegates: delegatedAccess.delegates.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { isLoading: true, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: { role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }) : delegate;
                    }),
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        updateDelegateRole: (_b = {},
                            _b[email] = null,
                            _b),
                    },
                    delegates: delegatedAccess.delegates.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { role: role, isLoading: false, pendingAction: null, pendingFields: { role: null } }) : delegate;
                    }),
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { isLoading: false, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: { role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }) : delegate;
                    }),
                },
            },
        },
    ];
    var parameters = { delegateEmail: email, validateCode: validateCode, role: role };
    API.write(types_1.WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateDelegateRoleOptimistically(email, role) {
    var _a;
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegates)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        updateDelegateRole: (_a = {},
                            _a[email] = null,
                            _a),
                    },
                    delegates: delegatedAccess.delegates.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { role: role, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: { role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }) : delegate;
                    }),
                },
            },
        },
    ];
    react_native_onyx_1.default.update(optimisticData);
}
function clearDelegateRolePendingAction(email) {
    if (!(delegatedAccess === null || delegatedAccess === void 0 ? void 0 : delegatedAccess.delegates)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map(function (delegate) {
                        return delegate.email === email
                            ? __assign(__assign({}, delegate), { pendingAction: null, pendingFields: undefined }) : delegate;
                    }),
                },
            },
        },
    ];
    react_native_onyx_1.default.update(optimisticData);
}
function restoreDelegateSession(authenticateResponse) {
    react_native_onyx_1.default.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS).then(function () {
        var _a;
        (0, updateSessionAuthTokens_1.default)(authenticateResponse === null || authenticateResponse === void 0 ? void 0 : authenticateResponse.authToken, authenticateResponse === null || authenticateResponse === void 0 ? void 0 : authenticateResponse.encryptedAuthToken);
        (0, updateSessionUser_1.default)(authenticateResponse === null || authenticateResponse === void 0 ? void 0 : authenticateResponse.accountID, authenticateResponse === null || authenticateResponse === void 0 ? void 0 : authenticateResponse.email);
        NetworkStore.setAuthToken((_a = authenticateResponse.authToken) !== null && _a !== void 0 ? _a : null);
        NetworkStore.setIsAuthenticating(false);
        (0, App_1.confirmReadyToOpenApp)();
        (0, App_1.openApp)();
    });
}
function openSecuritySettingsPage() {
    API.read(types_1.READ_COMMANDS.OPEN_SECURITY_SETTINGS_PAGE, null);
}
