import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {getCurrency} from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
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
    const getTaxValue = (taxCode: string) => TransactionUtils.getTaxValue(policy, transaction, taxCode);
    const taxPercentage = getTaxValue(selectedTaxCode);
    if (taxPercentage) {
        return TransactionUtils.calculateTaxAmount(taxPercentage, amount, getCurrency(transaction));
    }
}

function IOURequestStepTaxRatePage({
    route: {
        params: {action, backTo, iouType},
    },
    transaction,
    report,
}: IOURequestStepTaxRatePageProps) {
    const {translate} = useLocalize();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '-1'}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID ?? '-1'}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID ?? '-1'}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction?.transactionID ?? '-1'}`);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const taxRates = policy?.taxRates;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const taxRateTitle = TransactionUtils.getTaxName(policy, currentTransaction);

    const updateTaxRates = (taxes: TaxRatesOption) => {
        if (!currentTransaction || !taxes.code || !taxRates) {
            Navigation.goBack();
            return;
        }

        const taxAmount = getTaxAmount(policy, currentTransaction, taxes.code, TransactionUtils.getAmount(currentTransaction, false, true));

        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(currentTransaction.transactionID, {
                taxAmount: CurrencyUtils.convertToBackendAmount(taxAmount ?? 0),
                taxCode: taxes.code,
            });
            navigateBack();
            return;
        }

        if (isEditing) {
            const newTaxCode = taxes.code;
            IOU.updateMoneyRequestTaxRate({
                transactionID: currentTransaction?.transactionID ?? '-1',
                optimisticReportActionID: report?.reportID ?? '-1',
                taxCode: newTaxCode,
                taxAmount: CurrencyUtils.convertToBackendAmount(taxAmount ?? 0),
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
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(taxAmount);
        IOU.setMoneyRequestTaxRate(currentTransaction?.transactionID, taxes?.code ?? '');
        IOU.setMoneyRequestTaxAmount(currentTransaction.transactionID, amountInSmallestCurrencyUnits);

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
                policyID={report?.policyID}
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
