"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function mapCurrencyToCountry(currency) {
    switch (currency) {
        case CONST_1.default.CURRENCY.USD:
            return CONST_1.default.COUNTRY.US;
        case CONST_1.default.CURRENCY.AUD:
            return CONST_1.default.COUNTRY.AU;
        case CONST_1.default.CURRENCY.CAD:
            return CONST_1.default.COUNTRY.CA;
        case CONST_1.default.CURRENCY.GBP:
            return CONST_1.default.COUNTRY.GB;
        default:
            return '';
    }
}
exports.default = mapCurrencyToCountry;
