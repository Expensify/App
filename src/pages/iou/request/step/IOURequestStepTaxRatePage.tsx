import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TaxRatesOption} from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {getCurrency} from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories, PolicyTagLists, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type IOURequestStepTaxRatePageOnyxProps = {
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;

    /** Collection of tag list on a policy */
    policyTags: OnyxEntry<PolicyTagLists>;

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<Transaction>;
};

type IOURequestStepTaxRatePageProps = IOURequestStepTaxRatePageOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_RATE> & {
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
    policy,
    transaction,
    report,
    policyCategories,
    policyTags,
    splitDraftTransaction,
}: IOURequestStepTaxRatePageProps) {
    const {translate} = useLocalize();

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
                transactionID: currentTransaction?.transactionID,
                optimisticReportActionID: report?.reportID,
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

const IOURequestStepTaxRatePageWithOnyx = withOnyx<IOURequestStepTaxRatePageProps, IOURequestStepTaxRatePageOnyxProps>({
    splitDraftTransaction: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '-1'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '-1'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '-1'}`,
    },
})(IOURequestStepTaxRatePage);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxRatePageWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxRatePageWithWritableReportOrNotFound);

export default IOURequestStepTaxRatePageWithFullTransactionOrNotFound;
