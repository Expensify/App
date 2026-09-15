import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type {AmountDisplay, CompactControls, DistanceData, ErrorState, ReceiptOptions, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';

/** What every footer variant renders from, whatever the expense type. */
type ConfirmationFooterBaseProps = {
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
};

/** Adds the receipt section. Per diem is the one type that shows no receipt on the confirmation page. */
type WithReceipt = {
    receiptOptions: ReceiptOptions;
};

/** Adds the distance-rate metadata the Distance and Rate fields read. */
type WithDistance = {
    distanceData: DistanceData;
};

type PerDiemFooterProps = ConfirmationFooterBaseProps;

type TimeFooterProps = ConfirmationFooterBaseProps & WithReceipt;

type ManualFooterProps = ConfirmationFooterBaseProps & WithReceipt;

type InvoiceFooterProps = ConfirmationFooterBaseProps & WithReceipt;

type DistanceFooterProps = ConfirmationFooterBaseProps & WithReceipt & WithDistance;

type DistanceOdometerFooterProps = DistanceFooterProps & {
    /** Error message from the odometer receipt stitcher, rendered below the receipt. The odometer flow is the only
     * one that builds a single receipt from two photos, so it is the only one that can fail this way. */
    receiptStitchError?: string | null;
};

type ScanFooterProps = ConfirmationFooterBaseProps &
    WithReceipt & {
        /** Whether the compact scan layout is active, with the optional fields collapsed behind "Show more" */
        isCompactMode: boolean;

        /** Show-more state for the compact layout */
        compactControls: CompactControls;
    };

export type {ConfirmationFooterBaseProps, TimeFooterProps, PerDiemFooterProps, DistanceFooterProps, DistanceOdometerFooterProps, ScanFooterProps, ManualFooterProps, InvoiceFooterProps};
