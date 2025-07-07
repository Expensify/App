"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRateValue = validateRateValue;
exports.getOptimisticRateName = getOptimisticRateName;
exports.validateTaxClaimableValue = validateTaxClaimableValue;
var CONST_1 = require("@src/CONST");
var getPermittedDecimalSeparator_1 = require("./getPermittedDecimalSeparator");
var Localize = require("./Localize");
var MoneyRequestUtils = require("./MoneyRequestUtils");
var NumberUtils = require("./NumberUtils");
function validateRateValue(values, customUnitRates, toLocaleDigit, currentRateValue) {
    var errors = {};
    var parsedRate = MoneyRequestUtils.replaceAllDigits(values.rate, toLocaleDigit);
    var decimalSeparator = toLocaleDigit('.');
    var ratesList = Object.values(customUnitRates)
        .filter(function (rate) { return currentRateValue !== rate.rate; })
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        .map(function (r) { return (__assign(__assign({}, r), { rate: parseFloat(Number(r.rate || 0).toFixed(10)) })); });
    // The following logic replicates the backend's handling of rates:
    // - Multiply the rate by 100 (CUSTOM_UNIT_RATE_BASE_OFFSET) to scale it, ensuring precision.
    // - This ensures rates are converted as follows:
    //   12       -> 1200
    //   12.1     -> 1210
    //   12.01    -> 1201
    //   12.001   -> 1200.1
    //   12.0001  -> 1200.01
    // - Using parseFloat and toFixed(10) retains the necessary precision.
    var convertedRate = parseFloat((Number(values.rate || 0) * CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(10));
    // Allow one more decimal place for accuracy
    var rateValueRegex = RegExp(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["^-?d{0,8}([", "]d{0,", "})?$"], ["^-?\\d{0,8}([", "]\\d{0,", "})?$"])), (0, getPermittedDecimalSeparator_1.default)(decimalSeparator), CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES), 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = Localize.translateLocal('common.error.invalidRateError');
    }
    else if (ratesList.some(function (r) { return r.rate === convertedRate; })) {
        errors.rate = Localize.translateLocal('workspace.perDiem.errors.existingRateError', { rate: Number(values.rate) });
    }
    else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = Localize.translateLocal('common.error.lowRateError');
    }
    return errors;
}
function validateTaxClaimableValue(values, rate) {
    var errors = {};
    if ((rate === null || rate === void 0 ? void 0 : rate.rate) && Number(values.taxClaimableValue) >= rate.rate / 100) {
        errors.taxClaimableValue = Localize.translateLocal('workspace.taxes.error.updateTaxClaimableFailureMessage');
    }
    return errors;
}
/**
 * Get the optimistic rate name in a way that matches BE logic
 * @param rates
 */
function getOptimisticRateName(rates) {
    var existingRatesWithSameName = Object.values(rates !== null && rates !== void 0 ? rates : {}).filter(function (rate) { var _a; return ((_a = rate.name) !== null && _a !== void 0 ? _a : '').startsWith(CONST_1.default.CUSTOM_UNITS.DEFAULT_RATE); });
    return existingRatesWithSameName.length ? "".concat(CONST_1.default.CUSTOM_UNITS.DEFAULT_RATE, " ").concat(existingRatesWithSameName.length) : CONST_1.default.CUSTOM_UNITS.DEFAULT_RATE;
}
var templateObject_1;
