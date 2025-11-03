import GenericBank from '@assets/images/bank-icons/generic-bank-account.svg';
import GenericBankCard from '@assets/images/cardicons/generic-bank-card.svg';
import type {BankIconParams} from '@components/Icon/BankIconsUtils';
import {getBankIconAsset, getBankNameKey} from '@components/Icon/BankIconsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BankIcon} from '@src/types/onyx/Bank';
import type IconAsset from '@src/types/utils/IconAsset';

/**
 * It's a wrapper type for a bank icon asset. Bank icons are imported using require(), on the web platform after importing in this way it's necessary to use the property "default"
 */
type BankIconAsset = {
    default: IconAsset;
};

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */
export default function getBankIcon({styles, bankName, isCard = false}: BankIconParams): BankIcon {
    const bankIcon: BankIcon = {
        icon: isCard ? GenericBankCard : GenericBank,
    };
    if (bankName) {
        const bankNameKey = getBankNameKey(bankName.toLowerCase());

        if (bankNameKey && bankNameKey in CONST.BANK_NAMES) {
            bankIcon.icon = (getBankIconAsset(bankNameKey, isCard) as BankIconAsset).default;
        }
    }

    // For default Credit Card icon the icon size should not be set.
    if (!isCard) {
        bankIcon.iconSize = variables.iconSizeExtraLarge;
        bankIcon.iconStyles = [styles.bankIconContainer];
    } else {
        bankIcon.iconHeight = variables.cardIconHeight;
        bankIcon.iconWidth = variables.cardIconWidth;
        bankIcon.iconStyles = [styles.cardIcon];
    }

    return bankIcon;
}
