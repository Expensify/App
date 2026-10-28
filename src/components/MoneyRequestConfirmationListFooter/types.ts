import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type {AmountDisplay, CompactControls, DistanceData, ErrorState, ReceiptOptions, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';

/** The footer props every expense type takes. The hook builds these once; a variant's footer adds only its own extras. */
type SharedFooterProps = {
    /** Active policy read by sections. It may differ from the context `policyID` in track-expense flows where the user moves the expense to a different workspace. */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription inside `ConfirmationFieldList`) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField + InvoiceSender presentation) */
    selectedParticipants: Participant[];

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    requiredFlags: RequiredFlags;

    /** Caller-supplied visibility decisions */
    visibilityFlags: VisibilityFlags;

    errorState: ErrorState;
    toggleHandlers?: ToggleHandlers;
    receiptOptions: ReceiptOptions;
};

type ManualFooterProps = SharedFooterProps;

type TimeFooterProps = SharedFooterProps;

type InvoiceFooterProps = SharedFooterProps;

type PerDiemFooterProps = SharedFooterProps;

type DistanceFooterProps = SharedFooterProps & {
    /** Distance-rate metadata */
    distanceData: DistanceData;
};

type DistanceOdometerFooterProps = DistanceFooterProps & {
    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;
};

type ScanFooterProps = SharedFooterProps & {
    /** Whether the compact scan layout is active */
    isCompactMode: boolean;

    /** Show-more state for the compact layout */
    compactControls: CompactControls;
};

export type {SharedFooterProps, TimeFooterProps, PerDiemFooterProps, DistanceFooterProps, DistanceOdometerFooterProps, ScanFooterProps, ManualFooterProps, InvoiceFooterProps};
