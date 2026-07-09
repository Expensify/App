import type {MileageRate} from '@libs/DistanceRequestUtils';

import type {TranslationPaths} from '@src/languages/types';
import type {Unit} from '@src/types/onyx/Policy';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';

/** Pre-formatted amount values displayed in Amount/Attendee fields */
type AmountDisplay = {
    amount: number;
    formattedAmount: string;
    formattedAmountPerAttendee: string;
};

/** Commuter exclusion breakdown data */
type CommuterExclusionData = {
    commuterExclusion: number;
    reimbursableDistance: number;
    distanceUnit: Unit;
} | null;

/** Distance-rate metadata threaded into Distance/Rate fields */
type DistanceData = {
    distance: number;
    hasRoute: boolean;
    unit: Unit | undefined;
    rate: number | undefined;
    distanceRateName: string | undefined;
    distanceRateCurrency: string;
    mileageRate: MileageRate;
    expenseDate: string | undefined;
    customUnitRateID: string | undefined;
    shouldShowRateAutoUpdatedTooltip?: boolean;
    customUnit?: TransactionCustomUnit;
};

/** Distance-mode discriminators (manual / odometer / GPS) */
type DistanceFlags = {
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isGPSDistanceRequest: boolean;
};

/** What kind of expense the surface is confirming. Drives field gating across groups. */
type ExpenseMode = {
    isDistance: boolean;
    isTime: boolean;
    isInvoice: boolean;
    isPerDiem: boolean;
};

/** Per-field "required" flags driven by policy/workflow */
type RequiredFlags = {
    isCategoryRequired: boolean;
    isMerchantRequired: boolean | undefined;
    isDescriptionRequired: boolean;
};

/** Caller-supplied visibility decisions before they are merged with derived flags */
type VisibilityFlags = {
    shouldShowSmartScanFields: boolean;
    shouldShowAmountField: boolean;
    shouldShowMerchant: boolean;
    shouldShowCategories: boolean;
    shouldShowTax: boolean;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow). Drives amount autofocus on picker close. */
    isParticipantPickerVisible: boolean;
};

/** Shared error state surfaced into multiple fields */
type ErrorState = {
    shouldDisplayFieldError: boolean;
    formError: string;
    clearFormErrors: (errors: string[]) => void;
    setFormError: (error: TranslationPaths | '') => void;
};

/** Shared toggle handlers + flags */
type ToggleHandlers = {
    onToggleReimbursable?: (isOn: boolean) => void;
    onToggleBillable?: (isOn: boolean) => void;
};

/** Compact-mode bookkeeping: render-time flag + lift-up handler */
type CompactState = {
    isCompactMode: boolean;
    setShowMoreFields: (showMoreFields: boolean) => void;
};

/** External-facing compact-mode controls (the footer derives `isCompactMode` itself) */
type CompactControls = {
    showMoreFields?: boolean;
    setShowMoreFields?: (showMoreFields: boolean) => void;
};

/** Receipt-related inputs threaded into the receipt section */
type ReceiptOptions = {
    receiptFilename: string;
    receiptPath: string | number;
    isLoadingReceipt?: boolean;
    isReceiptEditable?: boolean;
    shouldDisplayReceipt: boolean;
    onPDFLoadError?: () => void;
    onPDFPassword?: () => void;
};

export type {
    AmountDisplay,
    CompactControls,
    CompactState,
    CommuterExclusionData,
    DistanceData,
    DistanceFlags,
    ErrorState,
    ExpenseMode,
    ReceiptOptions,
    RequiredFlags,
    ToggleHandlers,
    VisibilityFlags,
};
