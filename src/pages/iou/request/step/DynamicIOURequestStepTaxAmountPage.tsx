import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';

import {setMoneyRequestCurrency, setMoneyRequestTaxAmount} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTaxAmount} from '@libs/actions/IOU/UpdateMoneyRequest';
import {convertToBackendAmount, getCurrencyDecimals} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails} from '@libs/ReportUtils';
import {calculateTaxAmount, getAmount, getDefaultTaxCode, getTaxValue, getTaxAmount as getTransactionTaxAmount} from '@libs/TransactionUtils';

import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {Policy, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback, useRef} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepTaxAmountPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TAX_AMOUNT> & {
    transaction: OnyxEntry<Transaction>;
};

function getTaxAmount(transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>, currency: string | undefined, decimals: number, isEditing: boolean): number | undefined {
    if (!transaction?.amount && !transaction?.modifiedAmount) {
        return;
    }
    const transactionTaxAmount = getAmount(transaction);
    const transactionTaxCode = transaction?.taxCode ?? '';
    const defaultTaxCode = getDefaultTaxCode(policy, transaction, currency) ?? '';
    const getTaxValueByTaxCode = (taxCode: string) => getTaxValue(policy, transaction, taxCode);
    const defaultTaxValue = getTaxValueByTaxCode(defaultTaxCode);
    const moneyRequestTaxPercentage = (transactionTaxCode ? getTaxValueByTaxCode(transactionTaxCode) : defaultTaxValue) ?? '';
    const editingTaxPercentage = (transactionTaxCode ? getTaxValueByTaxCode(transactionTaxCode) : moneyRequestTaxPercentage) ?? '';
    const taxPercentage = isEditing ? editingTaxPercentage : moneyRequestTaxPercentage;
    return convertToBackendAmount(calculateTaxAmount(taxPercentage, transactionTaxAmount, decimals));
}

function DynamicIOURequestStepTaxAmountPage({
    route: {
        params: {action, iouType, reportID, transactionID},
    },
    transaction,
    report,
}: DynamicIOURequestStepTaxAmountPageProps) {
    const {policy} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID, action, iouType});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.path);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const focusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionDetails = getTransactionDetails(currentTransaction);
    const currency = transactionDetails?.currency;
    const decimals = getCurrencyDecimals(currency);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const updateTaxAmount = (currentAmount: CurrentMoney) => {
        const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(currentAmount.amount));

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {taxAmount: taxAmountInSmallestCurrencyUnits});
            saveAndNavigateBack();
            return;
        }

        if (isEditing) {
            if (taxAmountInSmallestCurrencyUnits === getTransactionTaxAmount(currentTransaction, false)) {
                saveAndNavigateBack();
                return;
            }
            updateMoneyRequestTaxAmount({
                transactionID,
                transactionThreadReport: report,
                parentReport,
                iouReportOwnerLogin,
                taxAmount: taxAmountInSmallestCurrencyUnits,
                policy,
                policyTagList: policyTags,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                parentReportNextStep,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
            });
            saveAndNavigateBack();
            return;
        }

        setMoneyRequestTaxAmount(transactionID, taxAmountInSmallestCurrencyUnits);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        setMoneyRequestCurrency(transactionID, currency || CONST.CURRENCY.USD);

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxAmount')}
            onBackButtonPress={navigateBack}
            testID="DynamicIOURequestStepTaxAmountPage"
            shouldShowWrapper
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing
                currency={currency}
                amount={Math.abs(transactionDetails?.taxAmount ?? 0)}
                taxAmount={getTaxAmount(currentTransaction, policy, currency, decimals, true)}
                ref={(e) => {
                    textInput.current = e;
                }}
                // onCurrencyButtonPress is intentionally left empty as currency selection is not allowed on this page
                onCurrencyButtonPress={() => {}}
                onSubmitButtonPress={updateTaxAmount}
                isCurrencyPressable={false}
                chatReportID={reportID}
            />
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepTaxAmountPageWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepTaxAmountPage);

const DynamicIOURequestStepTaxAmountPageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepTaxAmountPageWithWritableReportOrNotFound);

export default DynamicIOURequestStepTaxAmountPageWithFullTransactionOrNotFound;
