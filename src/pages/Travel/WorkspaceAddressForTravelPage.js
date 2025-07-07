"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AddressPage_1 = require("@pages/AddressPage");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceAddressForTravelPage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(activePolicyID);
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: true })[0];
    var updatePolicyAddress = function (values) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!policy) {
            return;
        }
        (0, Policy_1.updateAddress)(policy === null || policy === void 0 ? void 0 : policy.id, {
            addressStreet: "".concat((_b = (_a = values.addressLine1) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '', "\n").concat((_d = (_c = values.addressLine2) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : ''),
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: (_f = (_e = values === null || values === void 0 ? void 0 : values.zipPostCode) === null || _e === void 0 ? void 0 : _e.trim().toUpperCase()) !== null && _f !== void 0 ? _f : '',
            country: values.country,
        });
        if (!isUserValidated) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(ROUTES_1.default.TRAVEL_MY_TRIPS, (_g = ROUTES_1.default.TRAVEL_TCS.getRoute(route.params.domain)) !== null && _g !== void 0 ? _g : CONST_1.default.TRAVEL.DEFAULT_DOMAIN));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TCS.getRoute((_h = route.params.domain) !== null && _h !== void 0 ? _h : CONST_1.default.TRAVEL.DEFAULT_DOMAIN), { forceReplace: true });
    };
    return (<AddressPage_1.default isLoadingApp={false} updateAddress={updatePolicyAddress} title={translate('common.companyAddress')} backTo={route.params.backTo}/>);
}
WorkspaceAddressForTravelPage.displayName = 'WorkspaceAddressForTravelPage';
exports.default = WorkspaceAddressForTravelPage;
