import TaxPicker from '@components/TaxPicker';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useSplitEffectivePolicy from '@hooks/useSplitEffectivePolicy';
import useUpdateTransactionTaxRate from '@hooks/useUpdateTransactionTaxRate';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSelectedWorkspacePolicyID, isMovingTransactionFromTrackExpense, pickReportForPolicy} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getTaxRateTitle} from '@libs/TransactionUtils';

import {getIOURequestPolicyID} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepTaxRatePageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TAX_RATE> & {
    transaction: OnyxEntry<Transaction>;
};

function DynamicIOURequestStepTaxRatePage({
    route: {
        params: {action, iouType, transactionID, reportID: reportIDFromRoute},
    },
    transaction,
    report,
}: DynamicIOURequestStepTaxRatePageProps) {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_RATE.path);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;

    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.participants?.at(0)?.reportID)}`);
    const reportPolicyID = getSelectedWorkspacePolicyID(transaction, action) ?? getIOURequestPolicyID(transaction, pickReportForPolicy(report, participantReport));
    const {policy: transactionPolicy} = usePolicyForTransaction({transaction, reportPolicyID, action, iouType});
    const splitEffectivePolicy = useSplitEffectivePolicy(report, splitDraftTransaction, transaction);
    const policy = isEditingSplitBill ? splitEffectivePolicy : transactionPolicy;

    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);

    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const taxRateTitle = getTaxRateTitle(policy, currentTransaction, isMovingTransactionFromTrackExpense(action), policyForMovingExpenses);

    const {updateTaxRate} = useUpdateTransactionTaxRate({transactionID, transaction, report, policy, isEditing, isEditingSplit: isEditingSplitBill});

    const updateTaxRates = (taxes: TaxRatesOption, shouldClearTax?: boolean) => {
        updateTaxRate(taxes, shouldClearTax);
        saveAndNavigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxRate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepTaxRatePage"
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

const DynamicIOURequestStepTaxRatePageWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepTaxRatePage);

const DynamicIOURequestStepTaxRatePageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepTaxRatePageWithWritableReportOrNotFound);

export default DynamicIOURequestStepTaxRatePageWithFullTransactionOrNotFound;
