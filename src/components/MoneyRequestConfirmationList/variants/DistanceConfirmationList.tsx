import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {DistanceConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import DistanceManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceManualFooter';
import DistanceMapFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceMapFooter';
import DistanceOdometerFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceOdometerFooter';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {
    getCreated,
    getCurrency,
    hasValidModifiedAmount,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a distance expense, for all three of its shapes: a mapped route, a manually entered distance, and an
 * odometer reading.
 *
 * The three share one list because they mount exactly the same things — `DistanceRequestController` gates every
 * effect on `isDistanceRequest`, which is true for all of them, and the commuter-exclusion fields are written for
 * all three. What differs is only the footer: the mapped route shows a map, and the odometer flow is the one that
 * can surface a receipt stitch error.
 *
 * A distance expense is never a scan and never enters the compact layout.
 */
function DistanceConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    onOpenParticipantPicker,
    isParticipantPickerVisible = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    receiptStitchError,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    isReceiptEditable,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    policyID,
    reportID = '',
    receiptPath = '',
    receiptFilename = '',
    onToggleBillable,
    reportActionID,
    action = CONST.IOU.ACTION.CREATE,
    shouldDisplayReceipt = false,
    expensesNumber = 0,
    isConfirmed,
    isConfirming,
    onPDFLoadError,
    onPDFPassword,
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    shouldHideToSection = false,
}: DistanceConfirmationListProps) {
    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);

    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);

    // The distance state needs the policy before the shared data hook runs, so this surface resolves it itself.
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest: false,
    });

    const distanceState = useDistanceRequestState({
        transaction,
        policy,
        policyID,
        policyForMovingExpenses,
        isMovingTransactionFromTrackExpense,
        isDistanceRequest: true,
        iouAmount,
        iouCurrencyCode,
    });
    const {defaultRate, mileageRate, unit, rate, currency, distance, shouldCalculateDistanceAmount, hasRoute, isDistanceRequestWithPendingRoute, distanceRequestAmount} = distanceState;

    // A distance request can be blocked before submission by a missing home address, or by a policy that requires
    // a map or GPS, so the guard wraps this surface's own confirm callback.
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const {
        sections,
        listRef,
        footerContent,
        confirmationFieldsProviderProps,
        navigateToParticipantPage,
        dismissParticipantRowError,
        amountDisplay,
        requiredFlags,
        visibilityFlags,
        errorState,
        policyTags,
        policyTagLists,
        policyCategories,
        transactionID,
        iouCategory,
        customUnitRateID,
        previousTransactionCurrency,
        currentUserAccountID,
        isTypeSplit,
        isCategoryRequired,
        isFocused,
        shouldShowCategories,
        shouldShowTax,
        selectedParticipants,
        setFormError,
        clearFormErrors,
        setIsTaxAmountEmpty,
    } = useConfirmationListData({
        transaction,
        action,
        iouType,
        policyID,
        reportID,
        reportActionID,
        selectedParticipants: selectedParticipantsProp,
        payeePersonalDetails: payeePersonalDetailsProp,
        isReadOnly,
        isPolicyExpenseChat,
        isEditingSplitBill,
        expensesNumber,
        receiptPath,
        isConfirmed,
        isConfirming,
        shouldShowSmartScanFields,
        shouldHideToSection,
        isLoadingReceipt,
        onConfirm: () => {
            if (blockDistanceRequestIfNeeded()) {
                return;
            }
            onConfirm?.();
        },
        onSendMoney,
        onOpenParticipantPicker,
        showRemoveExpenseConfirmModal,
        isDistanceRequest: true,
        distanceState,
    });

    const {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits} = useTaxAmount({
        transaction,
        policy,
        policyForMovingExpenses,
        isDistanceRequest: true,
        isMovingTransactionFromTrackExpense,
        customUnitRateID,
        distance,
        distanceUnit: unit,
        previousTransactionCurrency,
    });

    const shouldShowRateAutoUpdatedTooltip =
        !!transaction?.comment?.customUnit?.rateAutoUpdated && !!transaction.created && DistanceRequestUtils.isRateEligibleForDate(mileageRate, transaction.created);

    const footerProps = {
        policy,
        policyTags,
        selectedParticipants: selectedParticipantsProp,
        distanceData: {
            distance,
            hasRoute,
            unit,
            distanceRateName: mileageRate.name,
            distanceRateCurrency: currency,
            mileageRate,
            expenseDate: getCreated(transaction),
            customUnitRateID,
            shouldShowRateAutoUpdatedTooltip,
            customUnit: transaction?.comment?.customUnit,
        },
        amountDisplay,
        requiredFlags,
        visibilityFlags: {...visibilityFlags, isParticipantPickerVisible},
        errorState,
        toggleHandlers: {onToggleReimbursable, onToggleBillable},
        receiptOptions: {
            receiptFilename,
            receiptPath,
            isLoadingReceipt,
            isReceiptEditable,
            shouldDisplayReceipt,
            onPDFLoadError,
            onPDFPassword,
        },
    };

    // Ordered as the footer dispatcher ordered them. A transaction carries a single request type, so at most one
    // of these matches.
    const renderFooter = () => {
        if (isManualDistanceRequest) {
            return <DistanceManualFooter {...footerProps} />;
        }
        if (isOdometerDistanceRequest) {
            return (
                <DistanceOdometerFooter
                    {...footerProps}
                    receiptStitchError={receiptStitchError}
                />
            );
        }
        // `DISTANCE`, `DISTANCE_MAP` and `DISTANCE_GPS` all confirm against the route map.
        return <DistanceMapFooter {...footerProps} />;
    };

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isDistanceRequest
            isManualDistanceRequest={isManualDistanceRequest}
            isOdometerDistanceRequest={isOdometerDistanceRequest}
            isGPSDistanceRequest={isGPSDistanceRequest}
            onTaxAmountEmptyChange={setIsTaxAmountEmpty}
        >
            <View>{renderFooter()}</View>
        </ConfirmationFieldsProvider>
    );

    return (
        <>
            <TaxController
                transactionID={transactionID}
                policyID={policyID}
                isReadOnly={isReadOnly}
                shouldShowTax={shouldShowTax}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                defaultTaxCode={defaultTaxCode}
                defaultTaxValue={defaultTaxValue}
                shouldKeepCurrentTaxSelection={shouldKeepCurrentTaxSelection}
                taxAmountInSmallestCurrencyUnits={taxAmountInSmallestCurrencyUnits}
                transactionTaxAmount={transaction?.taxAmount}
            />
            <DistanceRequestController
                transactionID={transactionID}
                transaction={transaction}
                isDistanceRequest
                isManualDistanceRequest={isManualDistanceRequest}
                isPolicyExpenseChat={isPolicyExpenseChat}
                customUnitRateID={customUnitRateID}
                mileageRate={mileageRate}
                distance={distance}
                unit={unit}
                rate={rate}
                currency={currency}
                policy={policy}
                isReadOnly={isReadOnly}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isTypeSplit={isTypeSplit}
                selectedParticipants={selectedParticipants}
                selectedParticipantsProp={selectedParticipantsProp}
                defaultMileageRateCustomUnitRateID={defaultRate}
                hasRoute={hasRoute}
                isDistanceRequestWithPendingRoute={isDistanceRequestWithPendingRoute}
                shouldCalculateDistanceAmount={shouldCalculateDistanceAmount}
                distanceRequestAmount={distanceRequestAmount}
                currentUserAccountID={currentUserAccountID}
                setFormError={setFormError}
                clearFormErrors={clearFormErrors}
            />
            <SplitBillController
                transaction={transaction}
                isTypeSplit={isTypeSplit}
                iouAmount={iouAmount}
                iouCurrencyCode={iouCurrencyCode}
                currentUserAccountID={currentUserAccountID}
                isFocused={isFocused}
                onFormError={setFormError}
            />
            <FieldAutoSelector
                transactionID={transactionID}
                transaction={transaction}
                policyCategories={policyCategories}
                policyTagLists={policyTagLists}
                policyTags={policyTags}
                policy={policy}
                shouldShowCategories={shouldShowCategories}
                isCategoryRequired={isCategoryRequired}
                iouCategory={iouCategory}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <ConfirmationListLayout
                transactionID={transactionID}
                sections={sections}
                listRef={listRef}
                footerContent={footerContent}
                listFooterContent={listFooterContent}
                onSelectRow={navigateToParticipantPage}
                onDismissError={dismissParticipantRowError}
            />
        </>
    );
}

export default DistanceConfirmationList;
