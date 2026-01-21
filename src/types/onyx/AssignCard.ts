import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {CompanyCardFeed} from './CardFeeds';
import type PersonalDetails from './PersonalDetails';

/** Assign card flow steps */
type AssignCardStep = ValueOf<typeof CONST.COMPANY_CARD.STEP>;

/**
 * Data required to assign a company card.
 *
 * Note on card identifiers:
 * - `cardName`: The masked card number displayed to users (e.g., "XXXX1234" or "VISA - 1234")
 * - `encryptedCardNumber`: The identifier sent to backend
 *   - For direct feeds (Plaid/OAuth): equals cardName
 *   - For commercial feeds (Visa/Mastercard/Amex): encrypted value from cardList
 */
type AssignCardData = {
    /** The cardholder personal details */
    cardholder?: PersonalDetails;

    /** The email address of the assignee */
    email: string;

    /**
     * The identifier sent to backend for card assignment.
     * For direct feeds: equals cardName
     * For commercial feeds: encrypted value from cardList
     */
    encryptedCardNumber: string;

    /** The name of the feed */
    bankName: CompanyCardFeed;

    /** The masked card number displayed to users (e.g., "XXXX1234" or "VISA - 1234"). This is the original card identifier and should not be edited. */
    cardName: string;

    /**
     * The custom card name that can be edited by the user.
     * Initially set to cardName, but can be changed in CardNameStep.
     * This value is sent to the backend as the card name when assigning.
     */
    customCardName: string;

    /** The transaction start date of the card */
    startDate: string;

    /** An option based on which the transaction start date is chosen */
    dateOption: string;

    /** Bank ID for Plaid */
    institutionId?: string;

    /** Access token for Plaid bank */
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
    cardToAssign: Partial<AssignCardData>;

    /** Whether the user is editing step */
    isEditing: boolean;

    /** Whether the assignment flow has finished */
    isAssignmentFinished?: boolean;

    /** Whether the card is assigning */
    isAssigning?: boolean;
};

export type {AssignCard, AssignCardStep, AssignCardData};
