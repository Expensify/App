"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankInfoStepValues = getBankInfoStepValues;
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
/** Some values are send under certain key and saved under different key by BE.
 * This is forced on BE side which is asking us to send it under certain keys but then saves it and returns under different keys.
 * This is why we need a separate util just for this step, so we can correctly gather default values for such cases */
function getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount) {
    return Object.entries(inputKeys).reduce(function (acc, _a) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
        var value = _a[1];
        switch (value) {
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ROUTING_CODE:
                acc[value] = ((_d = (_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _b !== void 0 ? _b : (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c[ReimbursementAccountForm_1.default.BANK_INFO_STEP.ROUTING_NUMBER]) !== null && _d !== void 0 ? _d : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE:
                acc[value] = ((_g = (_e = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _e !== void 0 ? _e : (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f[ReimbursementAccountForm_1.default.BANK_INFO_STEP.ROUTING_NUMBER]) !== null && _g !== void 0 ? _g : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME:
                acc[value] = ((_k = (_h = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _h !== void 0 ? _h : (_j = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _j === void 0 ? void 0 : _j[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ADDRESS_NAME]) !== null && _k !== void 0 ? _k : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ACCOUNT_HOLDER_ADDRESS_1:
                acc[value] = ((_o = (_l = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _l !== void 0 ? _l : (_m = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _m === void 0 ? void 0 : _m[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ADDRESS_STREET]) !== null && _o !== void 0 ? _o : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ACCOUNT_HOLDER_CITY:
                acc[value] = ((_r = (_p = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _p !== void 0 ? _p : (_q = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _q === void 0 ? void 0 : _q[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ADDRESS_CITY]) !== null && _r !== void 0 ? _r : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ACCOUNT_HOLDER_REGION:
                acc[value] = ((_u = (_s = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _s !== void 0 ? _s : (_t = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _t === void 0 ? void 0 : _t[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ADDRESS_STATE]) !== null && _u !== void 0 ? _u : '');
                break;
            case ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ACCOUNT_HOLDER_POSTAL:
                acc[value] = ((_x = (_v = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _v !== void 0 ? _v : (_w = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _w === void 0 ? void 0 : _w[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.ADDRESS_ZIP_CODE]) !== null && _x !== void 0 ? _x : '');
                break;
            default:
                acc[value] = ((_3 = (_0 = (_y = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _y !== void 0 ? _y : (_z = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _z === void 0 ? void 0 : _z[value]) !== null && _0 !== void 0 ? _0 : (_2 = (_1 = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _1 === void 0 ? void 0 : _1.corpay) === null || _2 === void 0 ? void 0 : _2[value]) !== null && _3 !== void 0 ? _3 : '');
                break;
        }
        return acc;
    }, {});
}
