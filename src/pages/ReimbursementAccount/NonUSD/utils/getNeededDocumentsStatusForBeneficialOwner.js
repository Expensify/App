"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getNeededDocumentsStatusForBeneficialOwner(workspaceCurrency, accountCountry, beneficialOwnerCountry) {
    var isCopyOfIDNeeded = workspaceCurrency === CONST_1.default.CURRENCY.GBP && beneficialOwnerCountry !== CONST_1.default.COUNTRY.GB;
    return {
        isProofOfOwnershipNeeded: workspaceCurrency === CONST_1.default.CURRENCY.EUR ||
            workspaceCurrency === CONST_1.default.CURRENCY.AUD ||
            workspaceCurrency === CONST_1.default.CURRENCY.CAD ||
            (workspaceCurrency === CONST_1.default.CURRENCY.GBP && beneficialOwnerCountry !== CONST_1.default.COUNTRY.GB),
        isCopyOfIDNeeded: isCopyOfIDNeeded,
        isProofOfAddressNeeded: workspaceCurrency === CONST_1.default.CURRENCY.EUR || isCopyOfIDNeeded,
        isCodiceFiscaleNeeded: accountCountry === CONST_1.default.COUNTRY.IT,
    };
}
exports.default = getNeededDocumentsStatusForBeneficialOwner;
