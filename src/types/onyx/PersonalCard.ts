import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Card feed */
type PersonalCardFeed = ValueOf<typeof CONST.PERSONAL_CARDS.BANK_NAME>;

/** Card feed provider */
type PersonalCardFeedProvider = typeof CONST.PERSONAL_CARDS.BANK_NAME.AMEX_DIRECT;

/** Data required to be sent to add a new card */
type AddNewPersonalCardFeedData = {
    /** Card feed provider */
    feedType: PersonalCardFeedProvider;

    /** Name of the card */
    cardTitle: string;

    /** Selected bank */
    selectedBank: ValueOf<typeof CONST.PERSONAL_CARDS.BANKS> | null;

    /** Name of the bank */
    bankName?: string;

    /** Selected country */
    selectedCountry?: string;

    /** Public token from Plaid connection */
    publicToken?: string;

    /** Feed from Plaid connection */
    plaidConnectedFeed?: string;

    /** Feed name from Plaid connection */
    plaidConnectedFeedName?: string;

    /** Plaid accounts */
    plaidAccounts?: LinkAccount[] | PlaidAccount[];
};

/** Issue new card flow steps */
type AddNewPersonalCardFeedStep = ValueOf<typeof CONST.PERSONAL_CARDS.STEP>;

/** Model of Issue new card flow */
type AddNewPersonalCard = {
    /** The current step of the flow */
    currentStep: AddNewPersonalCardFeedStep;

    /** Data required to be sent to issue a new card */
    data: AddNewPersonalCardFeedData;

    /** Whether the user is editing step */
    isEditing: boolean;

    /** Import/connection errors when the backend could not add a card (no CARD_LIST entry) */
    errors?: OnyxCommon.Errors;
};

export type {AddNewPersonalCard, AddNewPersonalCardFeedData, AddNewPersonalCardFeedStep, PersonalCardFeed};
