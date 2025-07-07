"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyDefaultProps = void 0;
exports.default = default_1;
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var Policy_1 = require("@userActions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function getPolicyIDFromRoute(route) {
    var _a;
    return (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.policyID;
}
var policyDefaultProps = {
    policy: {},
    policyDraft: {},
    isLoadingPolicy: false,
};
exports.policyDefaultProps = policyDefaultProps;
/*
 * HOC for connecting a policy in Onyx corresponding to the policyID in route params
 */
function default_1(WrappedComponent) {
    function WithPolicy(props, ref) {
        var policyID = getPolicyIDFromRoute(props.route);
        var hasLoadedApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.HAS_LOADED_APP, { canBeMissing: true })[0];
        var _a = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true }), policy = _a[0], policyResults = _a[1];
        var _b = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(policyID), { canBeMissing: true }), policyDraft = _b[0], policyDraftResults = _b[1];
        /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
        var isLoadingPolicy = !hasLoadedApp || (0, isLoadingOnyxValue_1.default)(policyResults, policyDraftResults);
        if (policyID && policyID.length > 0) {
            (0, Policy_1.updateLastAccessedWorkspace)(policyID);
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} policy={policy} policyDraft={policyDraft} isLoadingPolicy={isLoadingPolicy} ref={ref}/>);
    }
    WithPolicy.displayName = "WithPolicy";
    return (0, react_1.forwardRef)(WithPolicy);
}
