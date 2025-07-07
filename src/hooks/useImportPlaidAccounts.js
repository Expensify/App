"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useImportPlaidAccounts;
var react_1 = require("react");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Plaid_1 = require("@userActions/Plaid");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useImportPlaidAccounts(policyID) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: true })[0];
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var plaidToken = (_b = (_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.publicToken) !== null && _b !== void 0 ? _b : (_c = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _c === void 0 ? void 0 : _c.plaidAccessToken;
    var plaidFeed = (_e = (_d = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _d === void 0 ? void 0 : _d.plaidConnectedFeed) !== null && _e !== void 0 ? _e : (_f = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _f === void 0 ? void 0 : _f.institutionId;
    var plaidFeedName = (_h = (_g = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _g === void 0 ? void 0 : _g.plaidConnectedFeedName) !== null && _h !== void 0 ? _h : (_j = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _j === void 0 ? void 0 : _j.plaidConnectedFeedName;
    var plaidAccounts = (_l = (_k = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _k === void 0 ? void 0 : _k.plaidAccounts) !== null && _l !== void 0 ? _l : (_m = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _m === void 0 ? void 0 : _m.plaidAccounts;
    var country = (_o = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _o === void 0 ? void 0 : _o.selectedCountry;
    return (0, react_1.useCallback)(function () {
        if (!policyID || !plaidToken || !plaidFeed || !plaidFeedName || !country || !(plaidAccounts === null || plaidAccounts === void 0 ? void 0 : plaidAccounts.length)) {
            return;
        }
        (0, Plaid_1.importPlaidAccounts)(plaidToken, plaidFeed, plaidFeedName, country, (0, PolicyUtils_1.getDomainNameForPolicy)(policyID), JSON.stringify(plaidAccounts));
    }, [country, plaidAccounts, plaidFeed, plaidFeedName, plaidToken, policyID]);
}
