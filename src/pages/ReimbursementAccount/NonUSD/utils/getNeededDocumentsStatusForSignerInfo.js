"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getNeededDocumentsStatusForSignerInfo(workspaceCurrency, accountCountry) {
    return {
        isProofOfDirectorsNeeded: accountCountry === CONST_1.default.COUNTRY.CA || accountCountry === CONST_1.default.COUNTRY.AU,
        isCopyOfIDNeeded: workspaceCurrency === CONST_1.default.CURRENCY.EUR || workspaceCurrency === CONST_1.default.CURRENCY.GBP || accountCountry === CONST_1.default.COUNTRY.AU,
        isAddressProofNeeded: workspaceCurrency === CONST_1.default.CURRENCY.EUR || accountCountry === CONST_1.default.COUNTRY.GB || accountCountry === CONST_1.default.COUNTRY.AU,
        isCodiceFiscaleNeeded: accountCountry === CONST_1.default.COUNTRY.IT,
        isPRDAndFSGNeeded: accountCountry === CONST_1.default.COUNTRY.AU,
    };
}
exports.default = getNeededDocumentsStatusForSignerInfo;
