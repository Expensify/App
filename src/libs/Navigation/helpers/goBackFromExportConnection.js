"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var replaceCompanyCardsRoute_1 = require("./replaceCompanyCardsRoute");
/**
 * If export company card value is changed to unsupported - we should redirect user directly to card details view
 * If not, just regular go back
 */
function goBackFromExportConnection(shouldGoBackToSpecificRoute, backTo) {
    var feature = CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.companyCards;
    if (!(shouldGoBackToSpecificRoute && (backTo === null || backTo === void 0 ? void 0 : backTo.includes(feature.alias)))) {
        return Navigation_1.default.goBack();
    }
    var companyCardDetailsPage = (0, replaceCompanyCardsRoute_1.default)(backTo);
    return Navigation_1.default.goBack(companyCardDetailsPage);
}
exports.default = goBackFromExportConnection;
