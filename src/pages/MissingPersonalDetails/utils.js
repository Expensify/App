"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubstepValues = getSubstepValues;
exports.getInitialSubstep = getInitialSubstep;
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
function getSubstepValues(privatePersonalDetails, personalDetailsDraft) {
    var _a;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    var address = PersonalDetailsUtils.getCurrentAddress(privatePersonalDetails);
    var street = (address !== null && address !== void 0 ? address : {}).street;
    var _x = street ? street.split('\n') : [undefined, undefined], street1 = _x[0], street2 = _x[1];
    return _a = {},
        _a[PersonalDetailsForm_1.default.LEGAL_FIRST_NAME] = (_c = (_b = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.LEGAL_FIRST_NAME]) !== null && _b !== void 0 ? _b : privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) !== null && _c !== void 0 ? _c : '',
        _a[PersonalDetailsForm_1.default.LEGAL_LAST_NAME] = (_e = (_d = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.LEGAL_LAST_NAME]) !== null && _d !== void 0 ? _d : privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) !== null && _e !== void 0 ? _e : '',
        _a[PersonalDetailsForm_1.default.DATE_OF_BIRTH] = (_g = (_f = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.DATE_OF_BIRTH]) !== null && _f !== void 0 ? _f : privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.dob) !== null && _g !== void 0 ? _g : '',
        _a[PersonalDetailsForm_1.default.PHONE_NUMBER] = (_j = (_h = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.PHONE_NUMBER]) !== null && _h !== void 0 ? _h : privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) !== null && _j !== void 0 ? _j : '',
        _a[PersonalDetailsForm_1.default.ADDRESS_LINE_1] = (_l = (_k = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.ADDRESS_LINE_1]) !== null && _k !== void 0 ? _k : street1) !== null && _l !== void 0 ? _l : '',
        _a[PersonalDetailsForm_1.default.ADDRESS_LINE_2] = (_o = (_m = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.ADDRESS_LINE_2]) !== null && _m !== void 0 ? _m : street2) !== null && _o !== void 0 ? _o : '',
        _a[PersonalDetailsForm_1.default.CITY] = (_q = (_p = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.CITY]) !== null && _p !== void 0 ? _p : address === null || address === void 0 ? void 0 : address.city) !== null && _q !== void 0 ? _q : '',
        _a[PersonalDetailsForm_1.default.STATE] = (_s = (_r = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.STATE]) !== null && _r !== void 0 ? _r : address === null || address === void 0 ? void 0 : address.state) !== null && _s !== void 0 ? _s : '',
        _a[PersonalDetailsForm_1.default.ZIP_POST_CODE] = (_u = (_t = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.ZIP_POST_CODE]) !== null && _t !== void 0 ? _t : address === null || address === void 0 ? void 0 : address.zip) !== null && _u !== void 0 ? _u : '',
        _a[PersonalDetailsForm_1.default.COUNTRY] = (_w = (_v = personalDetailsDraft === null || personalDetailsDraft === void 0 ? void 0 : personalDetailsDraft[PersonalDetailsForm_1.default.COUNTRY]) !== null && _v !== void 0 ? _v : address === null || address === void 0 ? void 0 : address.country) !== null && _w !== void 0 ? _w : '',
        _a;
}
function getInitialSubstep(values) {
    if (values[PersonalDetailsForm_1.default.LEGAL_FIRST_NAME] === '' || values[PersonalDetailsForm_1.default.LEGAL_LAST_NAME] === '') {
        return CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME;
    }
    if (values[PersonalDetailsForm_1.default.DATE_OF_BIRTH] === '') {
        return CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.DATE_OF_BIRTH;
    }
    if (values[PersonalDetailsForm_1.default.ADDRESS_LINE_1] === '' ||
        values[PersonalDetailsForm_1.default.CITY] === '' ||
        values[PersonalDetailsForm_1.default.STATE] === '' ||
        values[PersonalDetailsForm_1.default.ZIP_POST_CODE] === '' ||
        values[PersonalDetailsForm_1.default.COUNTRY] === '') {
        return CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.ADDRESS;
    }
    if (values[PersonalDetailsForm_1.default.PHONE_NUMBER] === '') {
        return CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.PHONE_NUMBER;
    }
    return CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.CONFIRM;
}
