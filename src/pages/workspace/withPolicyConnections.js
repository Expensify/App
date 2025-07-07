"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isBoolean_1 = require("lodash/isBoolean");
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var PolicyConnections_1 = require("@libs/actions/PolicyConnections");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var withPolicy_1 = require("./withPolicy");
/**
 * Higher-order component that fetches the connections data and populates
 * the corresponding field of the policy object if the field is empty. It then passes the policy object
 * to the wrapped component.
 *
 * Use this HOC when you need the policy object with its connections field populated.
 *
 * Only the active policy gets the complete policy data upon app start that includes the connections data.
 * For other policies, the connections data needs to be fetched when it's needed.
 */
function withPolicyConnections(WrappedComponent, shouldBlockView) {
    if (shouldBlockView === void 0) { shouldBlockView = true; }
    function WithPolicyConnections(props) {
        var _a, _b, _c;
        var isOffline = (0, useNetwork_1.default)().isOffline;
        var _d = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED).concat((_b = (_a = props.policy) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '-1')), hasConnectionsDataBeenFetched = _d[0], hasConnectionsDataBeenFetchedResult = _d[1];
        var isOnyxDataLoading = (0, isLoadingOnyxValue_1.default)(hasConnectionsDataBeenFetchedResult);
        var isConnectionDataFetchNeeded = !isOnyxDataLoading && !isOffline && !!props.policy && (!!props.policy.areConnectionsEnabled || !(0, EmptyObject_1.isEmptyObject)(props.policy.connections)) && !hasConnectionsDataBeenFetched;
        var _e = (0, react_1.useState)(false), isFetchingData = _e[0], setIsFetchingData = _e[1];
        var prevHasConnectionsDataBeenFetched = (0, usePrevious_1.default)(hasConnectionsDataBeenFetched);
        (0, react_1.useEffect)(function () {
            if (prevHasConnectionsDataBeenFetched !== undefined || !(0, isBoolean_1.default)(hasConnectionsDataBeenFetched)) {
                return;
            }
            setIsFetchingData(false);
        }, [hasConnectionsDataBeenFetched, prevHasConnectionsDataBeenFetched]);
        (0, react_1.useEffect)(function () {
            var _a;
            // When the accounting feature is not enabled, or if the connections data already exists,
            // there is no need to fetch the connections data.
            if (!isConnectionDataFetchNeeded || !((_a = props.policy) === null || _a === void 0 ? void 0 : _a.id)) {
                return;
            }
            setIsFetchingData(true);
            (0, PolicyConnections_1.openPolicyAccountingPage)(props.policy.id);
        }, [(_c = props.policy) === null || _c === void 0 ? void 0 : _c.id, isConnectionDataFetchNeeded]);
        if ((isConnectionDataFetchNeeded || isFetchingData || isOnyxDataLoading) && shouldBlockView) {
            return <FullscreenLoadingIndicator_1.default />;
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} isConnectionDataFetchNeeded={isConnectionDataFetchNeeded}/>);
    }
    return (0, withPolicy_1.default)(WithPolicyConnections);
}
exports.default = withPolicyConnections;
