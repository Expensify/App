"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBankIcon;
var generic_bank_account_svg_1 = require("@assets/images/bank-icons/generic-bank-account.svg");
var generic_bank_card_svg_1 = require("@assets/images/cardicons/generic-bank-card.svg");
var BankIconsUtils_1 = require("@components/Icon/BankIconsUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */
function getBankIcon(_a) {
    var styles = _a.styles, bankName = _a.bankName, _b = _a.isCard, isCard = _b === void 0 ? false : _b;
    var bankIcon = {
        icon: isCard ? generic_bank_card_svg_1.default : generic_bank_account_svg_1.default,
    };
    if (bankName) {
        var bankNameKey = (0, BankIconsUtils_1.getBankNameKey)(bankName.toLowerCase());
        if (bankNameKey && Object.keys(CONST_1.default.BANK_NAMES).includes(bankNameKey)) {
            bankIcon.icon = (0, BankIconsUtils_1.getBankIconAsset)(bankNameKey, isCard).default;
        }
    }
    // For default Credit Card icon the icon size should not be set.
    if (!isCard) {
        bankIcon.iconSize = variables_1.default.iconSizeExtraLarge;
        bankIcon.iconStyles = [styles.bankIconContainer];
    }
    else {
        bankIcon.iconHeight = variables_1.default.cardIconHeight;
        bankIcon.iconWidth = variables_1.default.cardIconWidth;
        bankIcon.iconStyles = [styles.cardIcon];
    }
    return bankIcon;
}
