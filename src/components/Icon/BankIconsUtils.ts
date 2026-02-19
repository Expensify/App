import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import type {BankName, BankNameKey} from '@src/types/onyx/Bank';
import type IconAsset from '@src/types/utils/IconAsset';

type BankIconParams = {
    styles: ThemeStyles;
    bankName?: BankName;
    isCard?: boolean;
};

/**
 * Returns matching asset icon for bankName
 */
function getBankIconAsset(bankNameKey: BankNameKey, isCard: boolean): IconAsset {
    const bankValue = CONST.BANK_NAMES[bankNameKey];

    // This maps bank names to their respective icon paths.
    // The purpose is to avoid importing these at the app startup stage.
    // Depending on whether 'isCard' is true, it selects either a card icon or a bank icon.
    const iconMappings = {
        [CONST.BANK_NAMES.EXPENSIFY]: isCard ? (require('@assets/images/cardicons/expensify-card-dark.svg') as IconAsset) : (require('@assets/images/bank-icons/expensify.svg') as IconAsset),
        [CONST.BANK_NAMES.AMERICAN_EXPRESS]: isCard
            ? (require('@assets/images/cardicons/american-express.svg') as IconAsset)
            : (require('@assets/images/bank-icons/american-express.svg') as IconAsset),
        [CONST.BANK_NAMES.BANK_OF_AMERICA]: isCard
            ? (require('@assets/images/cardicons/bank-of-america.svg') as IconAsset)
            : (require('@assets/images/bank-icons/bank-of-america.svg') as IconAsset),
        [CONST.BANK_NAMES.BB_T]: isCard ? (require('@assets/images/cardicons/bb-t.svg') as IconAsset) : (require('@assets/images/bank-icons/bb-t.svg') as IconAsset),
        [CONST.BANK_NAMES.CAPITAL_ONE]: isCard ? (require('@assets/images/cardicons/capital-one.svg') as IconAsset) : (require('@assets/images/bank-icons/capital-one.svg') as IconAsset),
        [CONST.BANK_NAMES.CHASE]: isCard ? (require('@assets/images/cardicons/chase.svg') as IconAsset) : (require('@assets/images/bank-icons/chase.svg') as IconAsset),
        [CONST.BANK_NAMES.CHARLES_SCHWAB]: isCard
            ? (require('@assets/images/cardicons/charles-schwab.svg') as IconAsset)
            : (require('@assets/images/bank-icons/charles-schwab.svg') as IconAsset),
        [CONST.BANK_NAMES.CITIBANK]: isCard ? (require('@assets/images/cardicons/citibank.svg') as IconAsset) : (require('@assets/images/bank-icons/citibank.svg') as IconAsset),
        [CONST.BANK_NAMES.CITIZENS_BANK]: isCard ? (require('@assets/images/cardicons/citizens.svg') as IconAsset) : (require('@assets/images/bank-icons/citizens-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.DISCOVER]: isCard ? (require('@assets/images/cardicons/discover.svg') as IconAsset) : (require('@assets/images/bank-icons/discover.svg') as IconAsset),
        [CONST.BANK_NAMES.FIDELITY]: isCard ? (require('@assets/images/cardicons/fidelity.svg') as IconAsset) : (require('@assets/images/bank-icons/fidelity.svg') as IconAsset),
        [CONST.BANK_NAMES.GENERIC_BANK]: isCard
            ? (require('@assets/images/cardicons/generic-bank-card.svg') as IconAsset)
            : (require('@assets/images/bank-icons/generic-bank-account.svg') as IconAsset),
        [CONST.BANK_NAMES.HUNTINGTON_BANK]: isCard
            ? (require('@assets/images/cardicons/huntington-bank.svg') as IconAsset)
            : (require('@assets/images/bank-icons/huntington-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.HUNTINGTON_NATIONAL]: isCard
            ? (require('@assets/images/cardicons/huntington-bank.svg') as IconAsset)
            : (require('@assets/images/bank-icons/huntington-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.NAVY_FEDERAL_CREDIT_UNION]: isCard
            ? (require('@assets/images/cardicons/navy-federal-credit-union.svg') as IconAsset)
            : (require('@assets/images/bank-icons/navy-federal-credit-union.svg') as IconAsset),
        [CONST.BANK_NAMES.PNC]: isCard ? (require('@assets/images/cardicons/pnc.svg') as IconAsset) : (require('@assets/images/bank-icons/pnc.svg') as IconAsset),
        [CONST.BANK_NAMES.REGIONS_BANK]: isCard ? (require('@assets/images/cardicons/regions-bank.svg') as IconAsset) : (require('@assets/images/bank-icons/regions-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.SUNTRUST]: isCard ? (require('@assets/images/cardicons/suntrust.svg') as IconAsset) : (require('@assets/images/bank-icons/suntrust.svg') as IconAsset),
        [CONST.BANK_NAMES.TD_BANK]: isCard ? (require('@assets/images/cardicons/td-bank.svg') as IconAsset) : (require('@assets/images/bank-icons/td-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.US_BANK]: isCard ? (require('@assets/images/cardicons/us-bank.svg') as IconAsset) : (require('@assets/images/bank-icons/us-bank.svg') as IconAsset),
        [CONST.BANK_NAMES.USAA]: isCard ? (require('@assets/images/cardicons/usaa.svg') as IconAsset) : (require('@assets/images/bank-icons/usaa.svg') as IconAsset),
    } as const;

    // Fallback to generic bank/card icon
    const iconModule =
        iconMappings[bankValue] ||
        (isCard ? (require('@assets/images/cardicons/generic-bank-card.svg') as IconAsset) : (require('@assets/images/bank-icons/generic-bank-account.svg') as IconAsset));
    return iconModule;
}

function getBankNameKey(bankName: string): BankNameKey {
    const bank = Object.entries(CONST.BANK_NAMES).find(([, value]) => {
        const condensedValue = value.replaceAll(/\s/g, '');
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

export {getBankIconAsset, getBankNameKey};
export type {BankName, BankIconParams};
