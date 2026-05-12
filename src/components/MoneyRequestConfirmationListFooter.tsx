import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {isScanRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
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

const noopSetShowMoreFields = () => {};

type MoneyRequestConfirmationListFooterProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Active transaction (read by hooks + section gates) */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Active policy (read by sections + provides policyID for the Provider) */
    policy: OnyxEntry<OnyxTypes.Policy>;

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

    /** Triggers submit from inline inputs */
    onSubmitForm?: () => void;
};

function MoneyRequestConfirmationListFooter({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    transaction,
    policy,
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
    onSubmitForm,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const showMoreFields = compactControls?.showMoreFields ?? false;
    const setShowMoreFields = compactControls?.setShowMoreFields ?? noopSetShowMoreFields;
    const isCompactMode = !showMoreFields && isScanRequest(transaction) && !isInLandscapeMode;

    return (
        <ConfirmationFieldsProvider
            transactionID={transactionID}
            reportID={reportID}
            reportActionID={reportActionID}
            action={action}
            iouType={iouType}
            policyID={policy?.id}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            isEditingSplitBill={isEditingSplitBill}
            isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
            isPolicyExpenseChat={isPolicyExpenseChat}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <View>
                    <InvoiceSenderSection
                        iouType={iouType}
                        reportID={reportID}
                        selectedParticipants={selectedParticipants}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        transaction={transaction}
                    />
                    <DistanceMapSection
                        transaction={transaction}
                        isDistanceRequest={expenseMode.isDistance}
                        isManualDistanceRequest={distanceFlags.isManualDistanceRequest}
                        isOdometerDistanceRequest={distanceFlags.isOdometerDistanceRequest}
                        iouType={iouType}
                        isReadOnly={isReadOnly}
                    />
                    <PerDiemSection
                        action={action}
                        iouType={iouType}
                        isPerDiemRequest={expenseMode.isPerDiem}
                        transaction={transaction}
                        reportID={reportID}
                        transactionID={transactionID}
                        policy={policy}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                        formError={errorState.formError}
                    />
                </View>

                <ReceiptSection
                    transaction={transaction}
                    transactionID={transactionID}
                    reportID={reportID}
                    action={action}
                    iouType={iouType}
                    policy={policy}
                    isPerDiemRequest={expenseMode.isPerDiem}
                    isDistanceRequest={expenseMode.isDistance}
                    isManualDistanceRequest={distanceFlags.isManualDistanceRequest}
                    isOdometerDistanceRequest={distanceFlags.isOdometerDistanceRequest}
                    isReadOnly={isReadOnly}
                    isReceiptEditable={receiptOptions.isReceiptEditable ?? false}
                    shouldDisplayReceipt={receiptOptions.shouldDisplayReceipt}
                    isLoadingReceipt={receiptOptions.isLoadingReceipt ?? false}
                    receiptPath={receiptOptions.receiptPath}
                    receiptFilename={receiptOptions.receiptFilename}
                    showMoreFields={showMoreFields}
                    onPDFLoadError={receiptOptions.onPDFLoadError}
                    onPDFPassword={receiptOptions.onPDFPassword}
                />

                <ConfirmationFieldList
                    selectedParticipants={selectedParticipants}
                    expenseMode={expenseMode}
                    distanceFlags={distanceFlags}
                    distanceData={distanceData}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={toggleHandlers ?? {}}
                    compactState={{isCompactMode, setShowMoreFields}}
                    onSubmitForm={onSubmitForm}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default MoneyRequestConfirmationListFooter;
