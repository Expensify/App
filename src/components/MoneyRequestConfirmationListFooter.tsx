import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import FormHelpMessage from './FormHelpMessage';
import ConfirmationFieldsProvider from './MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldList from './MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import type {
    AmountDisplay,
    CompactControls,
    DistanceData,
    DistanceFlags,
    ErrorState,
    ExpenseMode,
    ReceiptOptions,
    RequiredFlags,
    ToggleHandlers,
    VisibilityFlags,
} from './MoneyRequestConfirmationListFooter/fieldGroupTypes';
import DistanceMapSection from './MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import InvoiceSenderSection from './MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import PerDiemSection from './MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import ReceiptSection from './MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {MeasurableInput} from './SelectionList/SelectionListWithSections/types';

const noopSetShowMoreFields = () => {};

type MoneyRequestConfirmationListFooterProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Whether the active transaction is a scan request (drives compact mode) */
    isScanRequest: boolean;

    /** Input policy ID (passed to the Provider so leaf fields read tags/categories from the same policy the parent's validation uses) */
    policyID: string | undefined;

    /** Active policy (read by sections — may differ from `policyID` in track-expense flows where the user moves the expense to a different workspace) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription inside `ConfirmationFieldList`) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField + InvoiceSender presentation) */
    selectedParticipants: Participant[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether we're editing an existing split expense */
    isEditingSplitBill?: boolean;

    /** Whether the surface is in a policy-expense chat */
    isPolicyExpenseChat: boolean;

    /** What kind of expense the surface is confirming */
    expenseMode: ExpenseMode;

    /** Distance-mode discriminators (only meaningful when expenseMode.isDistance) */
    distanceFlags: DistanceFlags;

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

    /** Compact-mode controls (the footer derives `isCompactMode` itself) */
    compactControls?: CompactControls;

    /** Scrolls the surface so an inline field's input is not hidden behind the keyboard when focused (new manual expense flow) */
    scrollFocusedInputIntoView?: (input: MeasurableInput) => void;

    /** Submits the whole expense (used by inline inputs to keep Enter-to-confirm on hardware-keyboard setups) */
    onSubmitForm?: () => void;
};

function MoneyRequestConfirmationListFooter({
    action,
    iouType,
    transactionID,
    reportID,
    receiptStitchError,
    reportActionID,
    isScanRequest,
    policyID,
    policy,
    policyTags,
    selectedParticipants,
    isReadOnly,
    didConfirm,
    isEditingSplitBill = false,
    isPolicyExpenseChat,
    expenseMode,
    distanceFlags,
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers,
    receiptOptions,
    compactControls,
    scrollFocusedInputIntoView,
    onSubmitForm,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const showMoreFields = compactControls?.showMoreFields ?? false;
    const setShowMoreFields = compactControls?.setShowMoreFields ?? noopSetShowMoreFields;
    const isCompactMode = !showMoreFields && isScanRequest && !isInLandscapeMode;

    return (
        <ConfirmationFieldsProvider
            transactionID={transactionID}
            reportID={reportID}
            reportActionID={reportActionID}
            action={action}
            iouType={iouType}
            policyID={policyID}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            isEditingSplitBill={isEditingSplitBill}
            isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
            isPolicyExpenseChat={isPolicyExpenseChat}
            isDistanceRequest={expenseMode.isDistance}
            isPerDiemRequest={expenseMode.isPerDiem}
            isTimeRequest={expenseMode.isTime}
            isTypeInvoice={expenseMode.isInvoice}
            isManualDistanceRequest={distanceFlags.isManualDistanceRequest}
            isOdometerDistanceRequest={distanceFlags.isOdometerDistanceRequest}
            isGPSDistanceRequest={distanceFlags.isGPSDistanceRequest}
            scrollFocusedInputIntoView={scrollFocusedInputIntoView}
            onSubmitForm={onSubmitForm}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <View>
                    <InvoiceSenderSection selectedParticipants={selectedParticipants} />
                    <DistanceMapSection />
                    <PerDiemSection
                        policy={policy}
                        shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                        formError={errorState.formError}
                    />
                </View>

                <ReceiptSection
                    policy={policy}
                    isReceiptEditable={receiptOptions.isReceiptEditable ?? false}
                    shouldDisplayReceipt={receiptOptions.shouldDisplayReceipt}
                    isLoadingReceipt={receiptOptions.isLoadingReceipt ?? false}
                    receiptPath={receiptOptions.receiptPath}
                    receiptFilename={receiptOptions.receiptFilename}
                    showMoreFields={showMoreFields}
                    onPDFLoadError={receiptOptions.onPDFLoadError}
                    onPDFPassword={receiptOptions.onPDFPassword}
                />

                {!!receiptStitchError && (
                    <View style={styles.mh5}>
                        <FormHelpMessage message={receiptStitchError} />
                    </View>
                )}

                <ConfirmationFieldList
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipants}
                    distanceData={distanceData}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={toggleHandlers ?? {}}
                    compactState={{isCompactMode, setShowMoreFields}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default MoneyRequestConfirmationListFooter;
