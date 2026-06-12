import GenericBank from '@assets/images/bank-icons/generic-bank-account.svg';
import GenericBankCard from '@assets/images/cardicons/generic-bank-card.svg';
import type {BankIconParams} from '@components/Icon/BankIconsUtils';
import {getBankIconAsset, getBankNameKey} from '@components/Icon/BankIconsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BankIcon} from '@src/types/onyx/Bank';

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */
export default function getBankIcon({styles, bankName, isCard = false, maxIconSize}: BankIconParams): BankIcon {
    const bankIcon: BankIcon = {
        icon: isCard ? GenericBankCard : GenericBank,
    };
    if (bankName) {
        const bankNameKey = getBankNameKey(bankName.toLowerCase());

        if (bankNameKey && bankNameKey in CONST.BANK_NAMES) {
            bankIcon.icon = getBankIconAsset(bankNameKey, isCard);
        }
    }

    // For default Credit Card icon the icon size should not be set.
    if (!isCard) {
        const defaultSize = variables.iconSizeExtraLarge;
        bankIcon.iconSize = maxIconSize ? Math.min(defaultSize, maxIconSize) : defaultSize;
        bankIcon.iconStyles = maxIconSize && maxIconSize < defaultSize ? [{...styles.bankIconContainer, width: bankIcon.iconSize, height: bankIcon.iconSize}] : [styles.bankIconContainer];
    } else {
        const scale = maxIconSize ? Math.min(1, maxIconSize / variables.cardIconWidth) : 1;
        bankIcon.iconHeight = Math.round(variables.cardIconHeight * scale);
        bankIcon.iconWidth = Math.round(variables.cardIconWidth * scale);
        bankIcon.iconStyles = [styles.cardIcon];
    }

    return bankIcon;
}
