import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type useConfirmationPolicyData from './useConfirmationPolicyData';
import type useDistanceRequestState from './useDistanceRequestState';

/**
 * The slice of the distance state the shared data hook reads. Only `useDistanceConfirmationListData` passes it;
 * without it the distance branches of the amount, CTA and validation hooks are skipped.
 */
type ConfirmationDistanceState = Pick<
    ReturnType<typeof useDistanceRequestState>,
    'isDistanceRequestWithPendingRoute' | 'shouldCalculateDistanceAmount' | 'distanceRequestAmount' | 'currency'
>;

/** Everything the confirmation reads from the workspace */
type ConfirmationPolicyData = ReturnType<typeof useConfirmationPolicyData>;

type UseConfirmationListDataParams = MoneyRequestConfirmationListProps & {
    /** Resolved by the entry hook, so the distance one can build its distance state from the policy first */
    policyData: ConfirmationPolicyData;

    /** Not a page prop: the distance variant sets it for itself */
    isDistanceRequest?: boolean;

    /** Only a distance variant passes this */
    distanceState?: ConfirmationDistanceState;
};

type UseConfirmationPolicyDataParams = {
    /** Transaction whose workspace is resolved. An unreported one resolves through the self-DM path, not the report's. */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Usually the report's. Subscribes the workspace, its categories and tags, and its draft. */
    policyID?: string;

    /** With `iouType`, decides whether the self-DM policy wins over the report's: only while creating a track expense. */
    action: IOUAction;

    /** With `action`, see above. */
    iouType: IOUType;

    /** A per diem reads the policy owning its custom unit rather than the one for moved expenses. */
    isPerDiemRequest?: boolean;
};

type UseParticipantSectionParams = {
    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** The IOU flow. CREATE forces the "To:" section back on even when the caller asked for it hidden. */
    iouType: IOUType;

    /** Forces the top sections on even when the "To" section is hidden, because the amount shown is a scan's */
    isScanRequest: boolean;

    /** A split gets a "paid by" row plus the participant amount-entry section, instead of a single "To:" section. */
    isTypeSplit: boolean;

    /** Keeps the "To" header, so it pairs with the invoice "Send from" field. */
    isTypeInvoice: boolean;

    /** Per diem and time participant rows can never be edited. */
    isPerDiemRequest: boolean;

    /** Whether the expense is a time expense, whose participant row can never be edited. */
    isTimeRequest: boolean;

    /** Hide the "To:" section, for an expense added directly to the current report. */
    shouldHideToSection: boolean;

    /** Whether the split rows render without editable amount inputs */
    shouldShowReadOnlySplits: boolean;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipantsProp: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetailsProp?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Surfaced on the participant row when it is one of the participant-level errors */
    formError: TranslationPaths | '';

    /** Drops the participant-level errors once a recipient exists */
    clearFormErrors: (errors: string[]) => void;

    /** Total of the expense, split across the participants to fill each split row's amount */
    iouAmount: number;

    /** Currency the split amounts are formatted in */
    iouCurrencyCode: string;

    /** Opens the participant picker. Omitted by the variants whose participant row can never be edited. */
    onOpenParticipantPicker?: () => void;
};

export type {ConfirmationDistanceState, UseConfirmationListDataParams, UseConfirmationPolicyDataParams, UseParticipantSectionParams};
