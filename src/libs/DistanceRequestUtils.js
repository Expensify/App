
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const EmptyObject_1 = require('@src/types/utils/EmptyObject');
const CurrencyUtils_1 = require('./CurrencyUtils');
const PolicyUtils_1 = require('./PolicyUtils');
const ReportUtils_1 = require('./ReportUtils');
const TransactionUtils_1 = require('./TransactionUtils');

let lastSelectedDistanceRates = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_LAST_SELECTED_DISTANCE_RATES,
    callback (value) {
        lastSelectedDistanceRates = value;
    },
});
let allReports;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback (value) {
        allReports = value;
    },
});
const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter
function getMileageRates(policy, includeDisabledRates, selectedRateID) {
    if (includeDisabledRates === void 0) {
        includeDisabledRates = false;
    }
    const mileageRates = {};
    if (!(policy === null || policy === void 0 ? void 0 : policy.customUnits)) {
        return mileageRates;
    }
    const distanceUnit = PolicyUtils_1.getDistanceRateCustomUnit(policy);
    if (!(distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.rates)) {
        return mileageRates;
    }
    Object.entries(distanceUnit.rates).forEach(function (_a) {
        const rateID = _a[0];
            const rate = _a[1];
        if (!includeDisabledRates && rate.enabled === false && (!selectedRateID || rateID !== selectedRateID)) {
            return;
        }
        if (!distanceUnit.attributes) {
            return;
        }
        mileageRates[rateID] = {
            rate: rate.rate,
            currency: rate.currency,
            unit: distanceUnit.attributes.unit,
            name: rate.name,
            customUnitRateID: rate.customUnitRateID,
            enabled: rate.enabled,
        };
    });
    return mileageRates;
}
/**
 * Retrieves the default mileage rate based on a given policy.
 *
 * @param policy - The policy from which to extract the default mileage rate.
 *
 * @returns An object containing the rate and unit for the default mileage or null if not found.
 * @returns [rate] - The default rate for the mileage.
 * @returns [currency] - The currency associated with the rate.
 * @returns [unit] - The unit of measurement for the distance.
 */
function getDefaultMileageRate(policy) {
    let _a; let _b;
    if (EmptyObject_1.isEmptyObject(policy) || !(policy === null || policy === void 0 ? void 0 : policy.customUnits)) {
        return undefined;
    }
    const distanceUnit = PolicyUtils_1.getDistanceRateCustomUnit(policy);
    if (!(distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.rates) || !distanceUnit.attributes) {
        return;
    }
    const mileageRates = Object.values(getMileageRates(policy));
    const distanceRate =
        (_b =
            (_a = mileageRates.find(function (rate) {
                return rate.name === CONST_1['default'].CUSTOM_UNITS.DEFAULT_RATE;
            })) !== null && _a !== void 0
                ? _a
                : mileageRates.at(0)) !== null && _b !== void 0
            ? _b
            : {};
    return {
        customUnitRateID: distanceRate.customUnitRateID,
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
        name: distanceRate.name,
    };
}
/**
 * Converts a given distance in meters to the specified unit (kilometers or miles).
 *
 * @param distanceInMeters - The distance in meters to be converted.
 * @param unit - The desired unit of conversion, either 'km' for kilometers or 'mi' for miles.
 *
 * @returns The converted distance in the specified unit.
 */
function convertDistanceUnit(distanceInMeters, unit) {
    switch (unit) {
        case CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS:
            return distanceInMeters * METERS_TO_KM;
        case CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES:
            return distanceInMeters * METERS_TO_MILES;
        default:
            throw new Error('Unsupported unit. Supported units are "mi" or "km".');
    }
}
/**
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @returns The distance in requested units, rounded to 2 decimals
 */
function getRoundedDistanceInUnits(distanceInMeters, unit) {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);
    return convertedDistance.toFixed(2);
}
/**
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @returns A string that displays the rate used for expense calculation
 */
function getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline, useShortFormUnit) {
    if (isOffline && !rate) {
        return translate('iou.defaultRate');
    }
    if (!rate || !currency || !unit) {
        return translate('iou.fieldPending');
    }
    const singularDistanceUnit = unit === CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const formattedRate = PolicyUtils_1.getUnitRateValue(toLocaleDigit, {rate}, useShortFormUnit);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = CurrencyUtils_1.getCurrencySymbol(currency) || `${currency  } `;
    return `${  currencySymbol  }${formattedRate  } / ${  useShortFormUnit ? unit : singularDistanceUnit}`;
}
/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param translate Translate function
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @returns A string that describes the distance traveled
 */
function getDistanceForDisplay(hasRoute, distanceInMeters, unit, rate, translate, useShortFormUnit) {
    if (!hasRoute || !rate || !unit || !distanceInMeters) {
        return translate('iou.fieldPending');
    }
    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    if (useShortFormUnit) {
        return `${distanceInUnits  } ${  unit}`;
    }
    const distanceUnit = unit === CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const unitString = distanceInUnits === '1' ? singularDistanceUnit : distanceUnit;
    return `${distanceInUnits  } ${  unitString}`;
}
function getDistanceForDisplayLabel(distanceInMeters, unit) {
    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    return `${distanceInUnits  } ${  unit}`;
}
/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @returns A string that describes the distance traveled and the rate used for expense calculation
 */
function getDistanceMerchant(hasRoute, distanceInMeters, unit, rate, currency, translate, toLocaleDigit) {
    if (!hasRoute || !rate) {
        return translate('iou.fieldPending');
    }
    const distanceInUnits = getDistanceForDisplay(hasRoute, distanceInMeters, unit, rate, translate, true);
    const ratePerUnit = getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, undefined, true);
    return `${distanceInUnits  } @ ${  ratePerUnit}`;
}
function ensureRateDefined(rate) {
    if (rate !== undefined) {
        return;
    }
    throw new Error('All default P2P rates should have a rate defined');
}
/**
 * Retrieves the rate and unit for a P2P distance expense for a given currency.
 *
 * @param currency
 * @returns The rate and unit in MileageRate object.
 */
function getRateForP2P(currency, transaction) {
    let _a; let _b; let _c;
    const currencyWithExistingRate = CONST_1['default'].CURRENCY_TO_DEFAULT_MILEAGE_RATE[currency] ? currency : CONST_1['default'].CURRENCY.USD;
    const mileageRate = CONST_1['default'].CURRENCY_TO_DEFAULT_MILEAGE_RATE[currencyWithExistingRate];
    ensureRateDefined(mileageRate.rate);
    // Ensure the rate is updated when the currency changes, otherwise use the stored rate
    const rate =
        TransactionUtils_1.getCurrency(transaction) === currency
            ? (_c =
                  (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0
                      ? void 0
                      : _b.defaultP2PRate) !== null && _c !== void 0
                ? _c
                : mileageRate.rate
            : mileageRate.rate;
    return {...mileageRate, currency: currencyWithExistingRate, rate};
}
/**
 * Calculates the expense amount based on distance, unit, and rate.
 *
 * @param distance - The distance traveled in meters
 * @param unit - The unit of measurement for the distance
 * @param rate - Rate used for calculating the expense amount
 * @returns The computed expense amount (rounded) in "cents".
 */
function getDistanceRequestAmount(distance, unit, rate) {
    const convertedDistance = convertDistanceUnit(distance, unit);
    const roundedDistance = parseFloat(convertedDistance.toFixed(2));
    return Math.round(roundedDistance * rate);
}
/**
 * Converts the distance from kilometers or miles to meters.
 *
 * @param distance - The distance to be converted.
 * @param unit - The unit of measurement for the distance.
 * @returns The distance in meters.
 */
function convertToDistanceInMeters(distance, unit) {
    if (unit === CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS) {
        return distance / METERS_TO_KM;
    }
    return distance / METERS_TO_MILES;
}
/**
 * Returns custom unit rate ID for the distance transaction
 */
function getCustomUnitRateID(reportID) {
    let _a; let _b;
    let customUnitRateID = CONST_1['default'].CUSTOM_UNITS.FAKE_P2P_ID;
    if (!reportID) {
        return customUnitRateID;
    }
    const report = allReports === null || allReports === void 0 ? void 0 : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${reportID}`];
    const parentReport =
        allReports === null || allReports === void 0
            ? void 0
            : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${report === null || report === void 0 ? void 0 : report.parentReportID}`];
    const policy = PolicyUtils_1.getPolicy(
        (_a = report === null || report === void 0 ? void 0 : report.policyID) !== null && _a !== void 0
            ? _a
            : parentReport === null || parentReport === void 0
            ? void 0
            : parentReport.policyID,
    );
    if (EmptyObject_1.isEmptyObject(policy)) {
        return customUnitRateID;
    }
    if (ReportUtils_1.isPolicyExpenseChat(report) || ReportUtils_1.isPolicyExpenseChat(parentReport)) {
        const distanceUnit = Object.values((_b = policy.customUnits) !== null && _b !== void 0 ? _b : {}).find(function (unit) {
            return unit.name === CONST_1['default'].CUSTOM_UNITS.NAME_DISTANCE;
        });
        const lastSelectedDistanceRateID = lastSelectedDistanceRates === null || lastSelectedDistanceRates === void 0 ? void 0 : lastSelectedDistanceRates[policy.id];
        const lastSelectedDistanceRate = lastSelectedDistanceRateID ? (distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.rates[lastSelectedDistanceRateID]) : undefined;
        if ((lastSelectedDistanceRate === null || lastSelectedDistanceRate === void 0 ? void 0 : lastSelectedDistanceRate.enabled) && lastSelectedDistanceRateID) {
            customUnitRateID = lastSelectedDistanceRateID;
        } else {
            const defaultMileageRate = getDefaultMileageRate(policy);
            if (!(defaultMileageRate === null || defaultMileageRate === void 0 ? void 0 : defaultMileageRate.customUnitRateID)) {
                return customUnitRateID;
            }
            customUnitRateID = defaultMileageRate.customUnitRateID;
        }
    }
    return customUnitRateID;
}
/**
 * Get taxable amount from a specific distance rate, taking into consideration the tax claimable amount configured for the distance rate
 */
function getTaxableAmount(policy, customUnitRateID, distance) {
    let _a; let _b; let _c; let _d; let _e;
    const distanceUnit = PolicyUtils_1.getDistanceRateCustomUnit(policy);
    const customUnitRate = PolicyUtils_1.getDistanceRateCustomUnitRate(policy, customUnitRateID);
    if (!(distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.customUnitID) || !customUnitRate) {
        return 0;
    }
    const unit =
        (_b = (_a = distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.attributes) === null || _a === void 0 ? void 0 : _a.unit) !== null && _b !== void 0
            ? _b
            : CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rate = (_c = customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.rate) !== null && _c !== void 0 ? _c : CONST_1['default'].DEFAULT_NUMBER_ID;
    const amount = getDistanceRequestAmount(distance, unit, rate);
    const taxClaimablePercentage =
        (_e = (_d = customUnitRate.attributes) === null || _d === void 0 ? void 0 : _d.taxClaimablePercentage) !== null && _e !== void 0 ? _e : CONST_1['default'].DEFAULT_NUMBER_ID;
    return amount * taxClaimablePercentage;
}
function getDistanceUnit(transaction, mileageRate) {
    let _a; let _b; let _c; let _d;
    return (_d =
        (_c =
            (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0
                ? void 0
                : _b.distanceUnit) !== null && _c !== void 0
            ? _c
            : mileageRate === null || mileageRate === void 0
            ? void 0
            : mileageRate.unit) !== null && _d !== void 0
        ? _d
        : CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES;
}
/**
 * Get the selected rate for a transaction, from the policy or P2P default rate.
 * Use the distanceUnit stored on the transaction by default to prevent policy changes modifying existing transactions. Otherwise, get the unit from the rate.
 */
function getRate(_a) {
    let _b; let _c; let _d; let _e; let _f; let _g; let _h; let _j;
    const transaction = _a.transaction;
        const policy = _a.policy;
        const policyDraft = _a.policyDraft;
        const _k = _a.useTransactionDistanceUnit;
        const useTransactionDistanceUnit = _k === void 0 ? true : _k;
    let mileageRates = getMileageRates(
        policy,
        true,
        (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0
            ? void 0
            : _c.customUnitRateID,
    );
    if (EmptyObject_1.isEmptyObject(mileageRates) && policyDraft) {
        mileageRates = getMileageRates(
            policyDraft,
            true,
            (_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) === null || _e === void 0
                ? void 0
                : _e.customUnitRateID,
        );
    }
    const policyCurrency =
        (_h =
            (_f = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _f !== void 0
                ? _f
                : (_g = PolicyUtils_1.getPersonalPolicy()) === null || _g === void 0
                ? void 0
                : _g.outputCurrency) !== null && _h !== void 0
            ? _h
            : CONST_1['default'].CURRENCY.USD;
    const defaultMileageRate = getDefaultMileageRate(policy);
    const customUnitRateID = TransactionUtils_1.getRateID(transaction);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const customMileageRate = (customUnitRateID && (mileageRates === null || mileageRates === void 0 ? void 0 : mileageRates[customUnitRateID])) || defaultMileageRate;
    const mileageRate = TransactionUtils_1.isCustomUnitRateIDForP2P(transaction) ? getRateForP2P(policyCurrency, transaction) : customMileageRate;
    const unit = getDistanceUnit(useTransactionDistanceUnit ? transaction : undefined, mileageRate);
    return {...mileageRate, unit,
        currency: (_j = mileageRate === null || mileageRate === void 0 ? void 0 : mileageRate.currency) !== null && _j !== void 0 ? _j : policyCurrency,};
}
/**
 * Get the updated distance unit from the selected rate instead of the distanceUnit stored on the transaction.
 * Useful for updating the transaction distance unit when the distance or rate changes.
 *
 * For example, if an expense is '10 mi @ $1.00 / mi' and the rate is updated to '$1.00 / km',
 * then the updated distance unit should be 'km' from the updated rate, not 'mi' from the currently stored transaction distance unit.
 */
function getUpdatedDistanceUnit(_a) {
    const transaction = _a.transaction;
        const policy = _a.policy;
        const policyDraft = _a.policyDraft;
    return getRate({transaction, policy, policyDraft, useTransactionDistanceUnit: false}).unit;
}
/**
 * Get the mileage rate by its ID in the form it's configured for the policy.
 * If not found, return undefined.
 */
function getRateByCustomUnitRateID(_a) {
    const customUnitRateID = _a.customUnitRateID;
        const policy = _a.policy;
    return getMileageRates(policy, true, customUnitRateID)[customUnitRateID];
}
exports['default'] = {
    getDefaultMileageRate,
    getDistanceMerchant,
    getDistanceRequestAmount,
    getRateForDisplay,
    getMileageRates,
    getDistanceForDisplay,
    getRateForP2P,
    getCustomUnitRateID,
    convertToDistanceInMeters,
    getTaxableAmount,
    getDistanceUnit,
    getUpdatedDistanceUnit,
    getRate,
    getRateByCustomUnitRateID,
    getDistanceForDisplayLabel,
    convertDistanceUnit,
};
