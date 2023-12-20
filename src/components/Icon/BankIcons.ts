import {SvgProps} from 'react-native-svg';
import GenericBank from '@assets/images/bankicons/generic-bank-account.svg';
import GenericBankCard from '@assets/images/cardicons/generic-bank-card.svg';
import {type ThemeStyles} from '@styles/index';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {BankIcon, BankName, BankNameKey} from '@src/types/onyx/Bank';

type BankIconParams = {
    styles: ThemeStyles;
    bankName?: BankName;
    isCard?: boolean;
};

/**
 * Returns matching asset icon for bankName
 */

function getAssetIcon(bankNameKey: BankNameKey, isCard: boolean): React.FC<SvgProps> {
    const bankValue = CONST.BANK_NAMES[bankNameKey];

    // This maps bank names to their respective icon paths.
    // The purpose is to avoid importing these at the app startup stage.
    // Depending on whether 'isCard' is true, it selects either a card icon or a bank icon.
    const iconMappings = {
        [CONST.BANK_NAMES.EXPENSIFY]: isCard
            ? (require('@assets/images/cardicons/expensify-card-dark.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/expensify.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.AMERICAN_EXPRESS]: isCard
            ? (require('@assets/images/cardicons/american-express.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/american-express.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.BANK_OF_AMERICA]: isCard
            ? (require('@assets/images/cardicons/bank-of-america.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/bank-of-america.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.BB_T]: isCard
            ? (require('@assets/images/cardicons/bb-t.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/bb-t.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.CAPITAL_ONE]: isCard
            ? (require('@assets/images/cardicons/capital-one.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/capital-one.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.CHASE]: isCard
            ? (require('@assets/images/cardicons/chase.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/chase.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.CHARLES_SCHWAB]: isCard
            ? (require('@assets/images/cardicons/charles-schwab.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/charles-schwab.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.CITIBANK]: isCard
            ? (require('@assets/images/cardicons/citibank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/citibank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.CITIZENS_BANK]: isCard
            ? (require('@assets/images/cardicons/citizens.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/citizens-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.DISCOVER]: isCard
            ? (require('@assets/images/cardicons/discover.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/discover.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.FIDELITY]: isCard
            ? (require('@assets/images/cardicons/fidelity.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/fidelity.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.GENERIC_BANK]: isCard
            ? (require('@assets/images/cardicons/generic-bank-card.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/generic-bank-account.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.HUNTINGTON_BANK]: isCard
            ? (require('@assets/images/cardicons/huntington-bank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/huntington-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.HUNTINGTON_NATIONAL]: isCard
            ? (require('@assets/images/cardicons/huntington-bank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/huntington-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.NAVY_FEDERAL_CREDIT_UNION]: isCard
            ? (require('@assets/images/cardicons/navy-federal-credit-union.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/navy-federal-credit-union.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.PNC]: isCard
            ? (require('@assets/images/cardicons/pnc.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/pnc.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.REGIONS_BANK]: isCard
            ? (require('@assets/images/cardicons/regions-bank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/regions-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.SUNTRUST]: isCard
            ? (require('@assets/images/cardicons/suntrust.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/suntrust.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.TD_BANK]: isCard
            ? (require('@assets/images/cardicons/td-bank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/td-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.US_BANK]: isCard
            ? (require('@assets/images/cardicons/us-bank.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/us-bank.svg').default as React.FC<SvgProps>),
        [CONST.BANK_NAMES.USAA]: isCard
            ? (require('@assets/images/cardicons/usaa.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/usaa.svg').default as React.FC<SvgProps>),
    } as const;

    // Fallback to generic bank/card icon
    const iconModule =
        iconMappings[bankValue] ||
        (isCard
            ? (require('@assets/images/cardicons/generic-bank-card.svg').default as React.FC<SvgProps>)
            : (require('@assets/images/bankicons/generic-bank-account.svg').default as React.FC<SvgProps>));
    return iconModule;
}

function getBankNameKey(bankName: string): BankNameKey {
    const bank = Object.entries(CONST.BANK_NAMES).find(([, value]) => {
        const condensedValue = value.replace(/\s/g, '');
        return (
            bankName === value ||
            bankName.includes(value) ||
            bankName.startsWith(value) ||
            bankName === condensedValue ||
            bankName.includes(condensedValue) ||
            bankName.startsWith(condensedValue)
        );
    });
    return (bank?.[0] as BankNameKey) ?? '';
}

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */

export default function getBankIcon({styles, bankName, isCard = false}: BankIconParams): BankIcon {
    const bankIcon: BankIcon = {
        icon: isCard ? GenericBankCard : GenericBank,
    };
    if (bankName) {
        const bankNameKey = getBankNameKey(bankName.toLowerCase());

        if (bankNameKey && Object.keys(CONST.BANK_NAMES).includes(bankNameKey)) {
            bankIcon.icon = getAssetIcon(bankNameKey, isCard);
        }
    }

    // For default Credit Card icon the icon size should not be set.
    if (!isCard) {
        bankIcon.iconSize = variables.iconSizeExtraLarge;
        bankIcon.iconStyles = [styles.bankIconContainer];
    } else {
        bankIcon.iconHeight = variables.bankCardHeight;
        bankIcon.iconWidth = variables.bankCardWidth;
        bankIcon.iconStyles = [styles.assignedCardsIconContainer];
    }

    return bankIcon;
}

export type {BankName};
