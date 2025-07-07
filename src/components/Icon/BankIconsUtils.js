"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankIconAsset = getBankIconAsset;
exports.getBankNameKey = getBankNameKey;
var CONST_1 = require("@src/CONST");
/**
 * Returns matching asset icon for bankName
 */
function getBankIconAsset(bankNameKey, isCard) {
    var _a;
    var bankValue = CONST_1.default.BANK_NAMES[bankNameKey];
    // This maps bank names to their respective icon paths.
    // The purpose is to avoid importing these at the app startup stage.
    // Depending on whether 'isCard' is true, it selects either a card icon or a bank icon.
    var iconMappings = (_a = {},
        _a[CONST_1.default.BANK_NAMES.EXPENSIFY] = isCard ? require('@assets/images/cardicons/expensify-card-dark.svg') : require('@assets/images/bank-icons/expensify.svg'),
        _a[CONST_1.default.BANK_NAMES.AMERICAN_EXPRESS] = isCard
            ? require('@assets/images/cardicons/american-express.svg')
            : require('@assets/images/bank-icons/american-express.svg'),
        _a[CONST_1.default.BANK_NAMES.BANK_OF_AMERICA] = isCard
            ? require('@assets/images/cardicons/bank-of-america.svg')
            : require('@assets/images/bank-icons/bank-of-america.svg'),
        _a[CONST_1.default.BANK_NAMES.BB_T] = isCard ? require('@assets/images/cardicons/bb-t.svg') : require('@assets/images/bank-icons/bb-t.svg'),
        _a[CONST_1.default.BANK_NAMES.CAPITAL_ONE] = isCard ? require('@assets/images/cardicons/capital-one.svg') : require('@assets/images/bank-icons/capital-one.svg'),
        _a[CONST_1.default.BANK_NAMES.CHASE] = isCard ? require('@assets/images/cardicons/chase.svg') : require('@assets/images/bank-icons/chase.svg'),
        _a[CONST_1.default.BANK_NAMES.CHARLES_SCHWAB] = isCard
            ? require('@assets/images/cardicons/charles-schwab.svg')
            : require('@assets/images/bank-icons/charles-schwab.svg'),
        _a[CONST_1.default.BANK_NAMES.CITIBANK] = isCard ? require('@assets/images/cardicons/citibank.svg') : require('@assets/images/bank-icons/citibank.svg'),
        _a[CONST_1.default.BANK_NAMES.CITIZENS_BANK] = isCard ? require('@assets/images/cardicons/citizens.svg') : require('@assets/images/bank-icons/citizens-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.DISCOVER] = isCard ? require('@assets/images/cardicons/discover.svg') : require('@assets/images/bank-icons/discover.svg'),
        _a[CONST_1.default.BANK_NAMES.FIDELITY] = isCard ? require('@assets/images/cardicons/fidelity.svg') : require('@assets/images/bank-icons/fidelity.svg'),
        _a[CONST_1.default.BANK_NAMES.GENERIC_BANK] = isCard
            ? require('@assets/images/cardicons/generic-bank-card.svg')
            : require('@assets/images/bank-icons/generic-bank-account.svg'),
        _a[CONST_1.default.BANK_NAMES.HUNTINGTON_BANK] = isCard
            ? require('@assets/images/cardicons/huntington-bank.svg')
            : require('@assets/images/bank-icons/huntington-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.HUNTINGTON_NATIONAL] = isCard
            ? require('@assets/images/cardicons/huntington-bank.svg')
            : require('@assets/images/bank-icons/huntington-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.NAVY_FEDERAL_CREDIT_UNION] = isCard
            ? require('@assets/images/cardicons/navy-federal-credit-union.svg')
            : require('@assets/images/bank-icons/navy-federal-credit-union.svg'),
        _a[CONST_1.default.BANK_NAMES.PNC] = isCard ? require('@assets/images/cardicons/pnc.svg') : require('@assets/images/bank-icons/pnc.svg'),
        _a[CONST_1.default.BANK_NAMES.REGIONS_BANK] = isCard ? require('@assets/images/cardicons/regions-bank.svg') : require('@assets/images/bank-icons/regions-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.SUNTRUST] = isCard ? require('@assets/images/cardicons/suntrust.svg') : require('@assets/images/bank-icons/suntrust.svg'),
        _a[CONST_1.default.BANK_NAMES.TD_BANK] = isCard ? require('@assets/images/cardicons/td-bank.svg') : require('@assets/images/bank-icons/td-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.US_BANK] = isCard ? require('@assets/images/cardicons/us-bank.svg') : require('@assets/images/bank-icons/us-bank.svg'),
        _a[CONST_1.default.BANK_NAMES.USAA] = isCard ? require('@assets/images/cardicons/usaa.svg') : require('@assets/images/bank-icons/usaa.svg'),
        _a);
    // Fallback to generic bank/card icon
    var iconModule = iconMappings[bankValue] ||
        (isCard ? require('@assets/images/cardicons/generic-bank-card.svg') : require('@assets/images/bank-icons/generic-bank-account.svg'));
    return iconModule;
}
function getBankNameKey(bankName) {
    var _a;
    var bank = Object.entries(CONST_1.default.BANK_NAMES).find(function (_a) {
        var value = _a[1];
        var condensedValue = value.replace(/\s/g, '');
        return (bankName === value ||
            bankName.includes(value) ||
            bankName.startsWith(value) ||
            bankName === condensedValue ||
            bankName.includes(condensedValue) ||
            bankName.startsWith(condensedValue));
    });
    return (_a = bank === null || bank === void 0 ? void 0 : bank[0]) !== null && _a !== void 0 ? _a : '';
}
