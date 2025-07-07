"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AddressPage_1 = require("@pages/AddressPage");
var Policy_1 = require("@userActions/Policy/Policy");
var withPolicy_1 = require("./withPolicy");
function WorkspaceOverviewAddressPage(_a) {
    var policy = _a.policy, route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var backTo = route.params.backTo;
    var address = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var tempAddress = policy === null || policy === void 0 ? void 0 : policy.address;
        var _l = ((_a = tempAddress === null || tempAddress === void 0 ? void 0 : tempAddress.addressStreet) !== null && _a !== void 0 ? _a : '').split('\n'), street1 = _l[0], street2 = _l[1];
        var result = {
            street: (_b = street1 === null || street1 === void 0 ? void 0 : street1.trim()) !== null && _b !== void 0 ? _b : '',
            street2: (_c = street2 === null || street2 === void 0 ? void 0 : street2.trim()) !== null && _c !== void 0 ? _c : '',
            city: (_e = (_d = tempAddress === null || tempAddress === void 0 ? void 0 : tempAddress.city) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : '',
            state: (_g = (_f = tempAddress === null || tempAddress === void 0 ? void 0 : tempAddress.state) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : '',
            zip: (_j = (_h = tempAddress === null || tempAddress === void 0 ? void 0 : tempAddress.zipCode) === null || _h === void 0 ? void 0 : _h.trim().toUpperCase()) !== null && _j !== void 0 ? _j : '',
            country: (_k = tempAddress === null || tempAddress === void 0 ? void 0 : tempAddress.country) !== null && _k !== void 0 ? _k : '',
        };
        return result;
    }, [policy]);
    var updatePolicyAddress = function (values) {
        var _a, _b, _c, _d, _e, _f;
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
        Navigation_1.default.goBack(backTo);
    };
    return (<AddressPage_1.default backTo={backTo} address={address} isLoadingApp={false} updateAddress={updatePolicyAddress} title={translate('common.companyAddress')}/>);
}
WorkspaceOverviewAddressPage.displayName = 'WorkspaceOverviewAddressPage';
exports.default = (0, withPolicy_1.default)(WorkspaceOverviewAddressPage);
