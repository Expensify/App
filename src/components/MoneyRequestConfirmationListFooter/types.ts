import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type {AmountDisplay, CompactControls, DistanceData, ErrorState, ReceiptOptions, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';

type MoneyRequestConfirmationListFooterProps = {
    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** Whether the compact scan layout is active */
    isCompactMode: boolean;

    /** Active policy read by sections. It may differ from the context `policyID` in track-expense flows where the user moves the expense to a different workspace. */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription inside `ConfirmationFieldList`) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField + InvoiceSender presentation) */
    selectedParticipants: Participant[];

    /** Distance-rate metadata */
    distanceData: DistanceData;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags */
    requiredFlags: RequiredFlags;

    /** Caller-supplied visibility decisions */
    visibilityFlags: VisibilityFlags;

    /** Error state */
    errorState: ErrorState;

    /** Toggle handlers */
    toggleHandlers?: ToggleHandlers;

    /** Receipt-related options */
    receiptOptions: ReceiptOptions;

    /** Show-more state for the compact layout */
    compactControls: CompactControls;
};

type TimeFooterProps = Omit<MoneyRequestConfirmationListFooterProps, 'receiptStitchError' | 'isCompactMode' | 'compactControls' | 'distanceData'>;

type PerDiemFooterProps = Omit<MoneyRequestConfirmationListFooterProps, 'receiptStitchError' | 'receiptOptions' | 'isCompactMode' | 'compactControls' | 'distanceData'>;

export type {MoneyRequestConfirmationListFooterProps, TimeFooterProps, PerDiemFooterProps};
