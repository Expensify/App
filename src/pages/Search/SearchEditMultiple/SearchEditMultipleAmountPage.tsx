import {useFocusEffect} from '@react-navigation/native';
import React, {useMemo, useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchStateContext} from '@components/Search/SearchContext';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isInvoiceReport, isIOUReport, shouldEnableNegative} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {withSnapshotReports, withSnapshotTransactions} from './SearchEditMultipleUtils';

type CurrentMoney = {amount: string; currency: string};

function SearchEditMultipleAmountPage() {
    const {translate} = useLocalize();
    const {currentSearchResults} = useSearchStateContext();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const snapshotData = currentSearchResults?.data;
    const mergedTransactions = withSnapshotTransactions(allTransactions, snapshotData);
    const mergedReports = withSnapshotReports(allReports, snapshotData);

    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const selectedTransactionIDs = useMemo(() => draftTransaction?.selectedTransactionIDs ?? [], [draftTransaction?.selectedTransactionIDs]);

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports);
    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const initialCurrency = draftTransaction?.currency ?? policyCurrency;
    const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    useFocusEffect(() => {
        if (isCurrencyPickerVisible) {
            return;
        }
        focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION + 100);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const amount = draftTransaction?.amount ?? 0;
    const allowNegative = useMemo(() => {
        if (!selectedTransactionIDs.length) {
            return false;
        }

        return selectedTransactionIDs.every((transactionID) => {
            const transaction = mergedTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                return false;
            }

            // Self-DM track expenses have no IOU report — they always support negative amounts
            if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                return true;
            }

            const transactionReport = mergedReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            const iouReport =
                transactionReport?.type === CONST.REPORT.TYPE.CHAT && transactionReport?.parentReportID
                    ? mergedReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionReport.parentReportID}`]
                    : transactionReport;
            if (!iouReport) {
                return false;
            }

            const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`];
            const iouType = isInvoiceReport(iouReport) ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT;
            return shouldEnableNegative(iouReport, transactionPolicy, iouType);
        });
    }, [selectedTransactionIDs, mergedTransactions, mergedReports, policies]);
    const isP2P = selectedTransactionIDs.some((transactionID) => {
        const transaction = mergedTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            return false;
        }
        const report = mergedReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        return isIOUReport(report);
    });

    const isAnyInvoice = selectedTransactionIDs.some((transactionID) => {
        const transaction = mergedTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            return false;
        }
        const transactionReport = mergedReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        const iouReport =
            transactionReport?.type === CONST.REPORT.TYPE.CHAT && transactionReport?.parentReportID
                ? mergedReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionReport.parentReportID}`]
                : transactionReport;
        return isInvoiceReport(iouReport);
    });

    const amountForForm = allowNegative ? amount : Math.abs(amount);

    const saveAmount = (currentMoney: CurrentMoney) => {
        const newAmount = convertToBackendAmount(Number.parseFloat(currentMoney.amount));
        // TODO: Currency update should be handled in a separate PR
        updateBulkEditDraftTransaction({
            amount: newAmount,
        });
        Navigation.goBack();
    };

    const showCurrencyPicker = () => {
        if (isTextInputFocused(textInput)) {
            textInput.current?.blur();
        }
        setIsCurrencyPickerVisible(true);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleAmountPage"
        >
            <HeaderWithBackButton
                title={translate('iou.amount')}
                onBackButtonPress={Navigation.goBack}
            />
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={() => setIsCurrencyPickerVisible(false)}
                headerText={translate('common.selectCurrency')}
                value={selectedCurrency}
                onInputChange={(value) => setSelectedCurrency(value)}
            />
            <MoneyRequestAmountForm
                amount={amountForForm}
                currency={selectedCurrency}
                isEditing
                isP2P={isP2P}
                iouType={isAnyInvoice ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT}
                // TODO: Enable currency picker in a separate PR
                isCurrencyPressable={false}
                // TODO: Enable currency symbol in a separate PR
                hideCurrencySymbol
                ref={(e: BaseTextInputRef | null) => {
                    textInput.current = e;
                }}
                onCurrencyButtonPress={showCurrencyPicker}
                onSubmitButtonPress={saveAmount}
                allowFlippingAmount={allowNegative}
            />
        </ScreenWrapper>
    );
}

export default SearchEditMultipleAmountPage;
