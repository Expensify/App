"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var AddressPage_1 = require("@pages/AddressPage");
var PersonalDetails_1 = require("@src/libs/actions/PersonalDetails");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values) {
    var _a, _b, _c, _d, _e, _f;
    (0, PersonalDetails_1.updateAddress)((_b = (_a = values.addressLine1) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '', (_d = (_c = values.addressLine2) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '', values.city.trim(), values.state.trim(), (_f = (_e = values === null || values === void 0 ? void 0 : values.zipPostCode) === null || _e === void 0 ? void 0 : _e.trim().toUpperCase()) !== null && _f !== void 0 ? _f : '', values.country);
}
function PersonalAddressPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS)[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP)[0];
    var address = (0, react_1.useMemo)(function () { return (0, PersonalDetailsUtils_1.getCurrentAddress)(privatePersonalDetails); }, [privatePersonalDetails]);
    var defaultCountry = (0, PersonalDetailsUtils_1.getDefaultCountry)();
    return (<AddressPage_1.default defaultCountry={defaultCountry} address={address} isLoadingApp={isLoadingApp} updateAddress={updateAddress} title={translate('privatePersonalDetails.address')}/>);
}
PersonalAddressPage.displayName = 'PersonalAddressPage';
exports.default = PersonalAddressPage;
