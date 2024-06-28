import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {BankName} from './Bank';
import type {BankAccountAdditionalData} from './BankAccount';
import type * as OnyxCommon from './OnyxCommon';

/** Model of debit card account data */
type AccountData = {
    /** Additional account data */
    additionalData?: BankAccountAdditionalData;

    /** Address name */
    addressName?: string;

    /** Address state */
    addressState?: string;

    /** Address street */
    addressStreet?: string;

    /** Address zip code */
    addressZip?: number;

    /** Debit card month */
    cardMonth?: number;

    /** The masked debit card number */
    cardNumber?: string;

    /** Debit card year */
    cardYear?: number;

    /** Debit card creation date */
    created?: string;

    /** Debit card currency */
    currency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

    /** Debit card ID number */
    fundID?: number;

    /** Debit card bank name */
    bank?: BankName;
};

/** Model of debit card fund */
type Fund = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** All data related to the debit card */
    accountData?: AccountData;

    /** Debit card type */
    accountType?: typeof CONST.PAYMENT_METHODS.DEBIT_CARD;

    /** Debit card description */
    description?: string;

    /** String like `fund-<fundID>` */
    key?: string;

    /** Alias for fundID */
    methodID?: number;

    /** Debit card title */
    title?: string;

    /** Is default debit card */
    isDefault?: boolean;

    /** Debit card related error messages */
    errors?: OnyxCommon.Errors;
}>;

/** Record of debit card funds, indexed by fundID */
type FundList = Record<string, Fund>;

export default Fund;
export type {AccountData, FundList};
