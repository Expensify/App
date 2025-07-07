"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = withPolicyAndFullscreenLoading;
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var withPolicy_1 = require("./withPolicy");
function withPolicyAndFullscreenLoading(WrappedComponent) {
    function WithPolicyAndFullscreenLoading(_a, ref) {
        var _b = _a.policy, policy = _b === void 0 ? withPolicy_1.policyDefaultProps.policy : _b, _c = _a.policyDraft, policyDraft = _c === void 0 ? withPolicy_1.policyDefaultProps.policyDraft : _c, _d = _a.isLoadingPolicy, isLoadingPolicy = _d === void 0 ? withPolicy_1.policyDefaultProps.isLoadingPolicy : _d, rest = __rest(_a, ["policy", "policyDraft", "isLoadingPolicy"]);
        var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { initialValue: true })[0];
        var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
        if ((isLoadingPolicy || isLoadingReportData) && (0, isEmpty_1.default)(policy) && (0, isEmpty_1.default)(policyDraft)) {
            return <FullscreenLoadingIndicator_1.default />;
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest} isLoadingReportData={isLoadingReportData} personalDetails={personalDetails} policy={policy} policyDraft={policyDraft} ref={ref}/>);
    }
    WithPolicyAndFullscreenLoading.displayName = "WithPolicyAndFullscreenLoading";
    return (0, withPolicy_1.default)((0, react_1.forwardRef)(WithPolicyAndFullscreenLoading));
}
