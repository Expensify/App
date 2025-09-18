import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {calculateTaxAmount, getAmount, getCurrency, getTaxName, getTaxValue, isExpenseUnreported as isExpenseUnreportedTransactionUtils} from '@libs/TransactionUtils';
import {setDraftSplitTransaction, setMoneyRequestTaxAmount, setMoneyRequestTaxRate, updateMoneyRequestTaxRate} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type IOURequestStepTaxRatePageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_RATE> & {
    transaction: OnyxEntry<Transaction>;
};

function getTaxAmount(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, selectedTaxCode: string, amount: number): number | undefined {
    const taxPercentage = getTaxValue(policy, transaction, selectedTaxCode);
    if (taxPercentage) {
        return calculateTaxAmount(taxPercentage, amount, getCurrency(transaction));
    }
}

function IOURequestStepTaxRatePage({
    route: {
        params: {action, backTo, iouType, transactionID},
    },
    transaction,
    report,
}: IOURequestStepTaxRatePageProps) {
    const {translate} = useLocalize();

    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: (policy) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined),
    });
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(transaction);
    const policy = isExpenseUnreported ? activePolicy : reportPolicy;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const taxRates = policy?.taxRates;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const taxRateTitle = getTaxName(policy, currentTransaction);

    const updateTaxRates = (taxes: TaxRatesOption) => {
        if (!currentTransaction || !taxes.code || !taxRates) {
            Navigation.goBack();
            return;
        }

        const taxAmount = getTaxAmount(policy, currentTransaction, taxes.code, getAmount(currentTransaction, false, true));

        if (isEditingSplitBill) {
            setDraftSplitTransaction(currentTransaction.transactionID, {
                taxAmount: convertToBackendAmount(taxAmount ?? 0),
                taxCode: taxes.code,
            });
            navigateBack();
            return;
        }

        if (isEditing) {
            const newTaxCode = taxes.code;
            updateMoneyRequestTaxRate({
                transactionID: currentTransaction?.transactionID,
                optimisticReportActionID: report?.reportID,
                taxCode: newTaxCode,
                taxAmount: convertToBackendAmount(taxAmount ?? 0),
                policy,
                policyTagList: policyTags,
                policyCategories,
            });
            navigateBack();
            return;
        }

        if (taxAmount === undefined) {
            navigateBack();
            return;
        }
        const amountInSmallestCurrencyUnits = convertToBackendAmount(taxAmount);
        setMoneyRequestTaxRate(currentTransaction?.transactionID, taxes?.code ?? '');
        setMoneyRequestTaxAmount(currentTransaction.transactionID, amountInSmallestCurrencyUnits);

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxRate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepTaxRatePage.displayName}
        >
            <TaxPicker
                selectedTaxRate={taxRateTitle}
                policyID={policy?.id}
                transactionID={currentTransaction?.transactionID}
                onSubmit={updateTaxRates}
                action={action}
                iouType={iouType}
                onDismiss={navigateBack}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepTaxRatePage.displayName = 'IOURequestStepTaxRatePage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxRatePage);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxRatePageWithWritableReportOrNotFound);

export default IOURequestStepTaxRatePageWithFullTransactionOrNotFound;
