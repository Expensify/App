import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type useDistanceRequestState from './useDistanceRequestState';

/**
 * The parts of the distance state this hook reads. A distance variant computes the full state with
 * {@link useDistanceRequestState} and passes this slice down; every other variant passes nothing, and the
 * distance branches of the amount, CTA and validation hooks go inert.
 *
 * The five, in the words of the hook that produces them: whether the route or the commuter-exclusion preview is
 * still pending, whether the distance's calculated amount should overwrite the stored one, that calculated amount,
 * and the currency the rate is quoted in with its previous value.
 */
type ConfirmationDistanceState = Pick<
    ReturnType<typeof useDistanceRequestState>,
    'isDistanceRequestWithPendingRoute' | 'shouldCalculateDistanceAmount' | 'distanceRequestAmount' | 'currency' | 'prevCurrency'
>;

/**
 * What the shared data hook reads. Everything the page hands a list variant is in scope, so it takes the same props
 * the variant was handed; of those, `isParticipantPickerVisible`, the toggle handlers, `isOdometerDistanceRequest`
 * and `receiptStitchError` are read by the variant and passed straight to its footer rather than by this hook.
 */
type UseConfirmationListDataParams = MoneyRequestConfirmationListProps & {
    /** Set only by the distance variant, whose own props do not carry it */
    isDistanceRequest?: boolean;

    /** Only a distance variant passes this */
    distanceState?: ConfirmationDistanceState;
};

type UseConfirmationPolicyDataParams = {
    /** Transaction whose workspace is being resolved. An unreported one resolves through the self-DM path instead of the report's. */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Policy ID the confirmation was opened with, usually the report's. Subscribes the workspace, its categories and tags, and its draft. */
    policyID?: string;

    /** With `iouType`, decides whether the self-DM policy wins over the report's: only while creating a track expense. */
    action: IOUAction;

    /** With `action`, see above. */
    iouType: IOUType;

    /** A per diem reads the policy owning its custom unit rather than the one for moved expenses. */
    isPerDiemRequest: boolean;
};

type UseParticipantSectionParams = {
    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** IOU flow being confirmed. CREATE forces the "To:" section back on even when the caller asked for it hidden. */
    iouType: IOUType;

    /** Whether the amount shown is a scan's, which forces the top sections even when the "To" section is hidden */
    isScanRequest: boolean;

    /** Whether this is a split. A split gets a "paid by" row plus the participant amount-entry section instead of a single "To:" section. */
    isTypeSplit: boolean;

    /** Whether this is an invoice, which keeps the "To" header so it pairs with the invoice "Send from" field. */
    isTypeInvoice: boolean;

    /** Whether the expense is a per diem, whose participant row can never be edited. */
    isPerDiemRequest: boolean;

    /** Whether the expense is a time expense, whose participant row can never be edited. */
    isTimeRequest: boolean;

    /** Whether to hide the "To:" section, for an expense added directly to the current report. */
    shouldHideToSection: boolean;

    /** Whether the split rows render without editable amount inputs */
    shouldShowReadOnlySplits: boolean;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipantsProp: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetailsProp?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** The form error the participant row surfaces when it is one of the participant-level ones */
    formError: TranslationPaths | '';

    /** Drops the participant-level errors once a recipient exists */
    clearFormErrors: (errors: string[]) => void;

    /** Total of the expense, split across the participants to fill each split row's amount */
    iouAmount: number;

    /** Currency the split amounts are formatted in */
    iouCurrencyCode: string;

    /** Opens the participant picker; omitted by the variants whose participant row can never be edited */
    onOpenParticipantPicker?: () => void;
};

export type {ConfirmationDistanceState, UseConfirmationListDataParams, UseConfirmationPolicyDataParams, UseParticipantSectionParams};
