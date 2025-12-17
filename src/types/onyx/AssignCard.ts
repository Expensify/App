import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {CompanyCardFeed} from './CardFeeds';

/** Assign card flow steps */
type AssignCardStep = ValueOf<typeof CONST.COMPANY_CARD.STEP>;

/** Data required to be sent to issue a new card */
type AssignCardData = {
    /** The email address of the assignee */
    email: string;

    /** Encrypted number of the selected card */
    encryptedCardNumber: string;

    /** Number of the selected card */
    cardNumber: string;

    /** The name of the feed */
    bankName: CompanyCardFeed;

    /** The name of the card */
    cardName: string;

    /** The transaction start date of the card */
    startDate: string;

    /** An option based on which the transaction start date is chosen */
    dateOption: string;

    /** bank id for Plaid */
    institutionId?: string;

    /** access token for Plaid bank */
    plaidAccessToken?: string;

    /** Plaid feed name */
    plaidConnectedFeedName?: string;

    /** Plaid accounts */
    plaidAccounts?: LinkAccount[] | PlaidAccount[];

    /** The email address of the inviting member */
    invitingMemberEmail: string;

    /** The accountID of the inviting member */
    invitingMemberAccountID: number;
};

/** Model of assign card flow */
type AssignCard = {
    /** The current step of the flow */
    currentStep: AssignCardStep;

    /** Data required to be sent to assign a card */
    data: Partial<AssignCardData>;

    /** Whether the user is editing step */
    isEditing: boolean;

    /** Whether the card is successfully assigned */
    isAssigned?: boolean;

    /** Whether the card is assigning */
    isAssigning?: boolean;
};

export type {AssignCard, AssignCardStep, AssignCardData};
