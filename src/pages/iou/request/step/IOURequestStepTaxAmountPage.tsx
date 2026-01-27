import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import {setDraftSplitTransaction, setMoneyRequestCurrency, setMoneyRequestParticipantsFromReport, setMoneyRequestTaxAmount, updateMoneyRequestTaxAmount} from '@libs/actions/IOU';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails} from '@libs/ReportUtils';
import {calculateTaxAmount, getAmount, getDefaultTaxCode, getTaxValue, getTaxAmount as getTransactionTaxAmount} from '@libs/TransactionUtils';
import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTaxAmountPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT> & {
    transaction: OnyxEntry<Transaction>;
};

function getTaxAmount(transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>, currency: string | undefined, isEditing: boolean): number | undefined {
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
    return convertToBackendAmount(calculateTaxAmount(taxPercentage, transactionTaxAmount, currency ?? CONST.CURRENCY.USD));
}

function IOURequestStepTaxAmountPage({
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction,
    report,
}: IOURequestStepTaxAmountPageProps) {
    const {policy} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID ?? '', action, iouType});

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});

    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const focusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionDetails = getTransactionDetails(currentTransaction);
    const currency = transactionDetails?.currency;

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
        Navigation.goBack(backTo);
    };

    const updateTaxAmount = (currentAmount: CurrentMoney) => {
        const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(currentAmount.amount));

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {taxAmount: taxAmountInSmallestCurrencyUnits});
            navigateBack();
            return;
        }

        if (isEditing) {
            if (taxAmountInSmallestCurrencyUnits === getTransactionTaxAmount(currentTransaction, false)) {
                navigateBack();
                return;
            }
            updateMoneyRequestTaxAmount({
                transactionID,
                transactionThreadReport: report,
                parentReport,
                taxAmount: taxAmountInSmallestCurrencyUnits,
                policy,
                policyTagList: policyTags,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                parentReportNextStep,
            });
            navigateBack();
            return;
        }

        setMoneyRequestTaxAmount(transactionID, taxAmountInSmallestCurrencyUnits);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        setMoneyRequestCurrency(transactionID, currency || CONST.CURRENCY.USD);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report?.reportID) {
            // TODO: Is this really needed at all?
            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserPersonalDetails.accountID);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxAmount')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepTaxAmountPage"
            shouldShowWrapper={!!(backTo || isEditing)}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={!!(backTo || isEditing)}
                currency={currency}
                amount={Math.abs(transactionDetails?.taxAmount ?? 0)}
                taxAmount={getTaxAmount(currentTransaction, policy, currency, !!(backTo || isEditing))}
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

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxAmountPage);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxAmountPageWithWritableReportOrNotFound);

export default IOURequestStepTaxAmountPageWithFullTransactionOrNotFound;
