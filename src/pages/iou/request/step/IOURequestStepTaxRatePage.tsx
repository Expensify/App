import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories, PolicyTagList, TaxRatesWithDefault, Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTaxRatePageOnyxProps = {
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;

    /** Collection of tag list on a policy */
    policyTags: OnyxEntry<PolicyTagList>;
};

type IOURequestStepTaxRatePageProps = IOURequestStepTaxRatePageOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_RATE> & {
        transaction: OnyxEntry<Transaction>;
    };

function getTaxAmount(taxRates: TaxRatesWithDefault, selectedTaxRate: string, amount: number): number | undefined {
    const percentage = Object.values(OptionsListUtils.transformedTaxRates(taxRates)).find((taxRate) => taxRate.modifiedName?.includes(selectedTaxRate))?.value;
    if (percentage) {
        return TransactionUtils.calculateTaxAmount(percentage, amount);
    }
}

function IOURequestStepTaxRatePage({
    route: {
        params: {action, backTo},
    },
    policy,
    transaction,
    report,
    policyCategories,
    policyTags,
}: IOURequestStepTaxRatePageProps) {
    const {translate} = useLocalize();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const taxRates = policy?.taxRates;
    const defaultExternalID = taxRates?.defaultExternalID;
    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const transactionTaxCode = transactionDetails?.taxCode;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const moneyRequestSelectedTaxRate = transaction?.taxRate?.keyForList || (taxRates && TransactionUtils.getDefaultTaxName(taxRates));
    const editingSelectedTaxRate =
        taxRates &&
        (transactionTaxCode === defaultExternalID
            ? transaction && TransactionUtils.getDefaultTaxName(taxRates, transaction)
            : transactionTaxCode && TransactionUtils.getTaxName(taxRates.taxes, transactionTaxCode));

    const updateTaxRates = (taxes: OptionsListUtils.TaxRatesOption) => {
        if (isEditing) {
            const newTaxCode = taxes.data.code;
            if (newTaxCode === undefined || newTaxCode === TransactionUtils.getTaxCode(transaction)) {
                navigateBack();
                return;
            }
            IOU.updateMoneyRequestTaxRate(transaction?.transactionID ?? '', report?.reportID ?? '', newTaxCode, policy, policyTags, policyCategories);
            navigateBack();
            return;
        }
        if (!transaction || !taxes.text || !taxRates) {
            Navigation.goBack(backTo);
            return;
        }
        const taxAmount = getTaxAmount(taxRates, taxes.text, transaction?.amount);
        if (taxAmount === undefined) {
            Navigation.goBack(backTo);
            return;
        }
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(taxAmount);
        IOU.setMoneyRequestTaxRate(transaction?.transactionID, taxes);
        IOU.setMoneyRequestTaxAmount(transaction.transactionID, amountInSmallestCurrencyUnits, true);

        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxRate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepTaxRatePage.displayName}
        >
            <TaxPicker
                selectedTaxRate={isEditing ? editingSelectedTaxRate ?? '' : moneyRequestSelectedTaxRate}
                policyID={report?.policyID}
                onSubmit={updateTaxRates}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepTaxRatePage.displayName = 'IOURequestStepTaxRatePage';

const IOURequestStepTaxRatePageWithOnyx = withOnyx<IOURequestStepTaxRatePageProps, IOURequestStepTaxRatePageOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepTaxRatePage);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxRatePageWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxRatePageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxRatePageWithWritableReportOrNotFound);

export default IOURequestStepTaxRatePageWithFullTransactionOrNotFound;
