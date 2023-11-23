import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import GenericBank from '@assets/images/bankicons/generic-bank-account.svg';
import GenericBankCard from '@assets/images/cardicons/generic-bank-card.svg';
import styles from '@styles/styles';
import variables from '@styles/variables';

type BankIcon = {
    icon: React.FC<SvgProps>;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

const BANK_NAMES = {
    EXPENSIFY: 'expensify',
    AMERICAN_EXPRESS: 'americanexpress',
    BANK_OF_AMERICA: 'bank of america',
    BB_T: 'bbt',
    CAPITAL_ONE: 'capital one',
    CHASE: 'chase',
    CHARLES_SCHWAB: 'charles schwab',
    CITIBANK: 'citibank',
    CITIZENS_BANK: 'citizens bank',
    DISCOVER: 'discover',
    FIDELITY: 'fidelity',
    GENERIC_BANK: 'generic bank',
    HUNTINGTON_BANK: 'huntington bank',
    NAVY_FEDERAL_CREDIT_UNION: 'navy federal credit union',
    PNC: 'pnc',
    REGIONS_BANK: 'regions bank',
    SUNTRUST: 'suntrust',
    TD_BANK: 'td bank',
    US_BANK: 'us bank',
    USAA: 'usaa',
};

type BankNameAndEmptyString = keyof typeof BANK_NAMES | '';
type BankName = keyof typeof BANK_NAMES;

/**
 * Returns matching asset icon for bankName
 */

function getAssetIcon(bankName: BankNameAndEmptyString, isCard: boolean): React.FC<SvgProps> {
    // Mapping bank names to their respective icon paths
    const iconMappings = {
        [BANK_NAMES.EXPENSIFY]: isCard ? require('@assets/images/cardicons/expensify-card-dark.svg') : require('@assets/images/bankicons/expensify.svg'),
        [BANK_NAMES.AMERICAN_EXPRESS]: isCard ? require('@assets/images/cardicons/american-express.svg') : require('@assets/images/bankicons/american-express.svg'),
        [BANK_NAMES.BANK_OF_AMERICA]: isCard ? require('@assets/images/cardicons/bank-of-america.svg') : require('@assets/images/bankicons/bank-of-america.svg'),
        [BANK_NAMES.BB_T]: isCard ? require('@assets/images/cardicons/bb-t.svg') : require('@assets/images/bankicons/bb-t.svg'),
        [BANK_NAMES.CAPITAL_ONE]: isCard ? require('@assets/images/cardicons/capital-one.svg') : require('@assets/images/bankicons/capital-one.svg'),
        [BANK_NAMES.CHASE]: isCard ? require('@assets/images/cardicons/chase.svg') : require('@assets/images/bankicons/chase.svg'),
        [BANK_NAMES.CHARLES_SCHWAB]: isCard ? require('@assets/images/cardicons/charles-schwab.svg') : require('@assets/images/bankicons/charles-schwab.svg'),
        [BANK_NAMES.CITIBANK]: isCard ? require('@assets/images/cardicons/citibank.svg') : require('@assets/images/bankicons/citibank.svg'),
        [BANK_NAMES.CITIZENS_BANK]: isCard ? require('@assets/images/cardicons/citizens.svg') : require('@assets/images/bankicons/citizens-bank.svg'),
        [BANK_NAMES.DISCOVER]: isCard ? require('@assets/images/cardicons/discover.svg') : require('@assets/images/bankicons/discover.svg'),
        [BANK_NAMES.FIDELITY]: isCard ? require('@assets/images/cardicons/fidelity.svg') : require('@assets/images/bankicons/fidelity.svg'),
        [BANK_NAMES.GENERIC_BANK]: isCard ? require('@assets/images/cardicons/generic-bank-card.svg') : require('@assets/images/bankicons/generic-bank-account.svg'),
        [BANK_NAMES.HUNTINGTON_BANK]: isCard ? require('@assets/images/cardicons/huntington-bank.svg') : require('@assets/images/bankicons/huntington-bank.svg'),
        [BANK_NAMES.NAVY_FEDERAL_CREDIT_UNION]: isCard
            ? require('@assets/images/cardicons/navy-federal-credit-union.svg')
            : require('@assets/images/bankicons/navy-federal-credit-union.svg'),
        [BANK_NAMES.PNC]: isCard ? require('@assets/images/cardicons/pnc.svg') : require('@assets/images/bankicons/pnc.svg'),
        [BANK_NAMES.REGIONS_BANK]: isCard ? require('@assets/images/cardicons/regions-bank.svg') : require('@assets/images/bankicons/regions-bank.svg'),
        [BANK_NAMES.SUNTRUST]: isCard ? require('@assets/images/cardicons/suntrust.svg') : require('@assets/images/bankicons/suntrust.svg'),
        [BANK_NAMES.TD_BANK]: isCard ? require('@assets/images/cardicons/td-bank.svg') : require('@assets/images/bankicons/td-bank.svg'),
        [BANK_NAMES.US_BANK]: isCard ? require('@assets/images/cardicons/us-bank.svg') : require('@assets/images/bankicons/us-bank.svg'),
        [BANK_NAMES.USAA]: isCard ? require('@assets/images/cardicons/usaa.svg') : require('@assets/images/bankicons/usaa.svg'),
    };

    // Fallback to generic bank/card icon
    const iconModule = iconMappings[bankName] || (isCard ? '@assets/images/cardicons/generic-bank-card.svg' : '@assets/images/bankicons/generic-bank-account.svg');
    return iconModule as React.FC<SvgProps>;
}

function getBankNameKey(bankName: string): BankNameAndEmptyString | undefined {
    return Object.keys(BANK_NAMES).find((key) => BANK_NAMES[key as BankName].toLowerCase() === bankName) as BankNameAndEmptyString | undefined;
}

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */

export default function getBankIcon(bankName: BankNameAndEmptyString, isCard = false): BankIcon {
    const bankNameKey = getBankNameKey(bankName.toLowerCase());

    const bankIcon: BankIcon = {
        icon: isCard ? GenericBankCard : GenericBank,
    };

    if (bankNameKey && Object.keys(BANK_NAMES).includes(bankNameKey)) {
        bankIcon.icon = getAssetIcon(bankNameKey, isCard);
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
