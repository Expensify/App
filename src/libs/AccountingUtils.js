"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionNameFromRouteParam = getConnectionNameFromRouteParam;
exports.getRouteParamForConnection = getRouteParamForConnection;
var CONST_1 = require("@src/CONST");
var ROUTE_NAME_MAPPING = (_a = {},
    _a[CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBO] = CONST_1.default.POLICY.CONNECTIONS.NAME.QBO,
    _a[CONST_1.default.POLICY.CONNECTIONS.ROUTE.XERO] = CONST_1.default.POLICY.CONNECTIONS.NAME.XERO,
    _a[CONST_1.default.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT] = CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
    _a[CONST_1.default.POLICY.CONNECTIONS.ROUTE.NETSUITE] = CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE,
    _a[CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBD] = CONST_1.default.POLICY.CONNECTIONS.NAME.QBD,
    _a);
var NAME_ROUTE_MAPPING = (_b = {},
    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBO,
    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.XERO] = CONST_1.default.POLICY.CONNECTIONS.ROUTE.XERO,
    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = CONST_1.default.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT,
    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = CONST_1.default.POLICY.CONNECTIONS.ROUTE.NETSUITE,
    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBD,
    _b);
function getConnectionNameFromRouteParam(routeParam) {
    return ROUTE_NAME_MAPPING[routeParam];
}
function getRouteParamForConnection(connectionName) {
    return NAME_ROUTE_MAPPING[connectionName];
}
