'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.setConnectionError =
    exports.hasSynchronizationErrorMessage =
    exports.isConnectionInProgress =
    exports.isConnectionUnverified =
    exports.copyExistingPolicyConnection =
    exports.syncConnection =
    exports.isAuthenticationError =
    exports.updateManyPolicyConnectionConfigs =
    exports.updatePolicyConnectionConfig =
    exports.removePolicyConnection =
        void 0;
var date_fns_1 = require('date-fns');
var isObject_1 = require('lodash/isObject');
var react_native_onyx_1 = require('react-native-onyx');
var API = require('@libs/API');
var types_1 = require('@libs/API/types');
var ErrorUtils = require('@libs/ErrorUtils');
var PolicyUtils = require('@libs/PolicyUtils');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var EmptyObject_1 = require('@src/types/utils/EmptyObject');
function removePolicyConnection(policyID, connectionName) {
    var _a;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections: ((_a = {}), (_a[connectionName] = null), _a),
            },
        },
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.SET,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS + policyID,
            value: null,
        },
    ];
    var successData = [];
    var failureData = [];
    var policy = PolicyUtils.getPolicy(policyID);
    var supportedConnections = [CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO, CONST_1['default'].POLICY.CONNECTIONS.NAME.XERO];
    if (PolicyUtils.isCollectPolicy(policy) && supportedConnections.includes(connectionName)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                areReportFieldsEnabled: false,
                pendingFields: {
                    areReportFieldsEnabled: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                pendingFields: {
                    areReportFieldsEnabled: null,
                },
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                areReportFieldsEnabled: policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled,
                pendingFields: {
                    areReportFieldsEnabled: null,
                },
            },
        });
    }
    var parameters = {
        policyID: policyID,
        connectionName: connectionName,
    };
    API.write(types_1.WRITE_COMMANDS.REMOVE_POLICY_CONNECTION, parameters, {optimisticData: optimisticData, successData: successData, failureData: failureData});
}
exports.removePolicyConnection = removePolicyConnection;
function createPendingFields(settingName, settingValue, pendingValue) {
    var _a;
    if (!isObject_1['default'](settingValue)) {
        return (_a = {}), (_a[settingName] = pendingValue), _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}
function createErrorFields(settingName, settingValue, errorValue) {
    var _a;
    if (!isObject_1['default'](settingValue)) {
        return (_a = {}), (_a[settingName] = errorValue), _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = errorValue;
        return acc;
    }, {});
}
function updatePolicyConnectionConfig(policyID, connectionName, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_a = {}),
                    (_a[connectionName] = {
                        config:
                            ((_b = {}),
                            (_b[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null),
                            (_b.pendingFields = createPendingFields(settingName, settingValue, CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE)),
                            (_b.errorFields = createErrorFields(settingName, settingValue, null)),
                            _b),
                    }),
                    _a),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_c = {}),
                    (_c[connectionName] = {
                        config:
                            ((_d = {}),
                            (_d[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null),
                            (_d.pendingFields = createPendingFields(settingName, settingValue, null)),
                            (_d.errorFields = createErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'))),
                            _d),
                    }),
                    _c),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_e = {}),
                    (_e[connectionName] = {
                        config: {
                            pendingFields: createPendingFields(settingName, settingValue, null),
                            errorFields: createErrorFields(settingName, settingValue, null),
                        },
                    }),
                    _e),
            },
        },
    ];
    var parameters = {
        policyID: policyID,
        connectionName: connectionName,
        settingName: String(settingName),
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(settingName),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData: optimisticData, failureData: failureData, successData: successData});
}
exports.updatePolicyConnectionConfig = updatePolicyConnectionConfig;
/**
 * This method returns read command and stage in progres for a given accounting integration.
 *
 * @param policyID - ID of the policy for which the sync is needed
 * @param connectionName - Name of the connection, QBO/Xero
 */
function getSyncConnectionParameters(connectionName) {
    switch (connectionName) {
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO: {
            return {readCommand: types_1.READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE, stageInProgress: CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_QBO};
        }
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.XERO: {
            return {readCommand: types_1.READ_COMMANDS.SYNC_POLICY_TO_XERO, stageInProgress: CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_XERO};
        }
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.NETSUITE: {
            return {readCommand: types_1.READ_COMMANDS.SYNC_POLICY_TO_NETSUITE, stageInProgress: CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION};
        }
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            return {
                readCommand: types_1.READ_COMMANDS.SYNC_POLICY_TO_SAGE_INTACCT,
                stageInProgress: CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.SAGE_INTACCT_SYNC_CHECK_CONNECTION,
            };
        }
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.QBD: {
            return {readCommand: types_1.READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_DESKTOP, stageInProgress: CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_QBD};
        }
        default:
            return undefined;
    }
}
/**
 * This method helps in syncing policy to the connected accounting integration.
 *
 * @param policy - Policy for which the sync is needed
 * @param connectionName - Name of the connection, QBO/Xero
 * @param forceDataRefresh - If true, it will trigger a full data refresh
 */
function syncConnection(policy, connectionName, forceDataRefresh) {
    if (forceDataRefresh === void 0) {
        forceDataRefresh = false;
    }
    if (!connectionName || !policy) {
        return;
    }
    var policyID = policy.id;
    var syncConnectionData = getSyncConnectionParameters(connectionName);
    if (!syncConnectionData) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS + policyID,
            value: {
                stageInProgress: syncConnectionData === null || syncConnectionData === void 0 ? void 0 : syncConnectionData.stageInProgress,
                connectionName: connectionName,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.SET,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS + policyID,
            value: null,
        },
    ];
    var parameters = {
        policyID: policyID,
        idempotencyKey: policyID,
    };
    if (connectionName === CONST_1['default'].POLICY.CONNECTIONS.NAME.QBD) {
        parameters.forceDataRefresh = forceDataRefresh;
    }
    API.read(syncConnectionData.readCommand, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
exports.syncConnection = syncConnection;
function updateManyPolicyConnectionConfigs(policyID, connectionName, configUpdate, configCurrentData) {
    var _a, _b, _c;
    if (!policyID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_a = {}),
                    (_a[connectionName] = {
                        config: __assign(__assign({}, configUpdate), {
                            pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                        }),
                    }),
                    _a),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_b = {}),
                    (_b[connectionName] = {
                        config: __assign(__assign({}, configCurrentData), {
                            pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')];
                                }),
                            ),
                        }),
                    }),
                    _b),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID,
            value: {
                connections:
                    ((_c = {}),
                    (_c[connectionName] = {
                        config: {
                            pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                        },
                    }),
                    _c),
            },
        },
    ];
    var parameters = {
        policyID: policyID,
        connectionName: connectionName,
        configUpdate: JSON.stringify(configUpdate),
        idempotencyKey: Object.keys(configUpdate).join(','),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS, parameters, {optimisticData: optimisticData, failureData: failureData, successData: successData});
}
exports.updateManyPolicyConnectionConfigs = updateManyPolicyConnectionConfigs;
function hasSynchronizationErrorMessage(policy, connectionName, isSyncInProgress) {
    var _a, _b, _c;
    var connection = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[connectionName];
    if (
        isSyncInProgress ||
        EmptyObject_1.isEmptyObject(connection === null || connection === void 0 ? void 0 : connection.lastSync) ||
        ((_b = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _b === void 0 ? void 0 : _b.isSuccessful) !== false ||
        !((_c = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _c === void 0 ? void 0 : _c.errorDate)
    ) {
        return false;
    }
    return true;
}
exports.hasSynchronizationErrorMessage = hasSynchronizationErrorMessage;
function isAuthenticationError(policy, connectionName) {
    var _a, _b;
    var connection = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[connectionName];
    return ((_b = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _b === void 0 ? void 0 : _b.isAuthenticationError) === true;
}
exports.isAuthenticationError = isAuthenticationError;
function isConnectionUnverified(policy, connectionName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // A verified connection is one that has been successfully synced at least once
    // We'll always err on the side of considering a connection as verified connected even if we can't find a lastSync property saying as such
    // i.e. this is a property that is explicitly set to false, not just missing
    if (connectionName === CONST_1['default'].POLICY.CONNECTIONS.NAME.NETSUITE) {
        return !((_c =
            (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[CONST_1['default'].POLICY.CONNECTIONS.NAME.NETSUITE]) ===
                null || _b === void 0
                ? void 0
                : _b.verified) !== null && _c !== void 0
            ? _c
            : true);
    }
    // If the connection has no lastSync property, we'll consider it unverified
    if (
        EmptyObject_1.isEmptyObject(
            (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d[connectionName]) === null || _e === void 0
                ? void 0
                : _e.lastSync,
        )
    ) {
        return true;
    }
    return !((_j =
        (_h =
            (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f[connectionName]) === null || _g === void 0
                ? void 0
                : _g.lastSync) === null || _h === void 0
            ? void 0
            : _h.isConnected) !== null && _j !== void 0
        ? _j
        : true);
}
exports.isConnectionUnverified = isConnectionUnverified;
function setConnectionError(policyID, connectionName, errorMessage) {
    var _a;
    react_native_onyx_1['default'].merge('' + ONYXKEYS_1['default'].COLLECTION.POLICY + policyID, {
        connections:
            ((_a = {}),
            (_a[connectionName] = {
                lastSync: {
                    isSuccessful: false,
                    isConnected: false,
                    errorDate: new Date().toISOString(),
                    errorMessage: errorMessage,
                },
            }),
            _a),
    });
}
exports.setConnectionError = setConnectionError;
function copyExistingPolicyConnection(connectedPolicyID, targetPolicyID, connectionName) {
    var stageInProgress;
    switch (connectionName) {
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.NETSUITE:
            stageInProgress = CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION;
            break;
        case CONST_1['default'].POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            stageInProgress = CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.SAGE_INTACCT_SYNC_CHECK_CONNECTION;
            break;
        default:
            stageInProgress = null;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: '' + ONYXKEYS_1['default'].COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS + targetPolicyID,
            value: {
                stageInProgress: stageInProgress,
                connectionName: connectionName,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    API.write(
        types_1.WRITE_COMMANDS.COPY_EXISTING_POLICY_CONNECTION,
        {
            policyID: connectedPolicyID,
            targetPolicyID: targetPolicyID,
            connectionName: connectionName,
        },
        {optimisticData: optimisticData},
    );
}
exports.copyExistingPolicyConnection = copyExistingPolicyConnection;
function isConnectionInProgress(connectionSyncProgress, policy) {
    var _a, _b, _c, _d;
    if (!policy || !connectionSyncProgress) {
        return false;
    }
    var qboConnection = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksOnline;
    var lastSyncProgressDate = date_fns_1.parseISO(
        (_b = connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.timestamp) !== null && _b !== void 0 ? _b : '',
    );
    return (
        (!!(connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.stageInProgress) &&
            (connectionSyncProgress.stageInProgress !== CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE ||
                !((_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c[connectionSyncProgress.connectionName])) &&
            date_fns_1.isValid(lastSyncProgressDate) &&
            date_fns_1.differenceInMinutes(new Date(), lastSyncProgressDate) < CONST_1['default'].POLICY.CONNECTIONS.SYNC_STAGE_TIMEOUT_MINUTES) ||
        (!!qboConnection &&
            !(qboConnection === null || qboConnection === void 0 ? void 0 : qboConnection.data) &&
            !!((_d = qboConnection === null || qboConnection === void 0 ? void 0 : qboConnection.config) === null || _d === void 0 ? void 0 : _d.credentials))
    );
}
exports.isConnectionInProgress = isConnectionInProgress;
