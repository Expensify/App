import {setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTaxRate} from '@libs/actions/IOU/UpdateMoneyRequest';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {calculateTaxAmount, getAmount, getCurrency, getTaxValue} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';

import useAllTransactionViolations from './useAllTransactionViolations';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';

type UseUpdateTransactionTaxRateParams = {
    /** ID of the expense being written to, and of the draft a not-yet-created expense lives in */
    transactionID: string;

    /** Transaction whose tax rate is being written */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the transaction lives on. Required to edit an existing expense's tax rate */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tax rates belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether an existing expense is being edited rather than a draft being filled in */
    isEditing: boolean;

    /** Whether the expense being edited is a split, which writes to the split draft instead */
    isEditingSplit: boolean;
};

type UseUpdateTransactionTaxRateResult = {
    /**
     * Writes the picked tax rate, and the tax amount it works out to on the expense's amount, to whichever of the three
     * stores backs the expense. `shouldClearTax` clears the tax instead, for a rate the workspace no longer has.
     */
    updateTaxRate: (taxes: TaxRatesOption, shouldClearTax?: boolean) => void;
};

/**
 * Writes a tax rate onto an expense, from wherever it is picked. Both the full-page selector and the anchored dropdown
 * save through here, so a pick in either lands in the same place with the same recalculated tax amount.
 */
function useUpdateTransactionTaxRate({transactionID, transaction, report, policy, isEditing, isEditingSplit}: UseUpdateTransactionTaxRateParams): UseUpdateTransactionTaxRateResult {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();

    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const allTransactionViolations = useAllTransactionViolations(transactionID);

    const currentTransaction = isEditingSplit && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const updateTaxRate = (taxes: TaxRatesOption, shouldClearTax?: boolean) => {
        const updateTaxRateParams = {
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID,
            transactionThreadReport: report,
            parentReport,
            iouReportOwnerLogin,
            taxCode: '',
            taxValue: '',
            taxAmount: 0,
            transaction: currentTransaction,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            violations: allTransactionViolations,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        };

        if (shouldClearTax && isEditingSplit) {
            if (currentTransaction) {
                setDraftSplitTransaction(transactionID, splitDraftTransaction, {taxAmount: 0, taxCode: '', taxValue: ''}, getCurrencyDecimals, getCurrencySymbol);
            }
            return;
        }
        if (shouldClearTax && isEditing) {
            updateMoneyRequestTaxRate(updateTaxRateParams);
            return;
        }
        if (!currentTransaction || !taxes.code || !policy?.taxRates) {
            return;
        }

        const decimals = getCurrencyDecimals(getCurrency(currentTransaction));
        const taxValue = getTaxValue(policy, currentTransaction, taxes.code) ?? '';
        const taxAmount = taxValue ? calculateTaxAmount(taxValue, getAmount(currentTransaction, false, true), decimals) : undefined;

        if (isEditingSplit) {
            setDraftSplitTransaction(
                transactionID,
                splitDraftTransaction,
                {taxAmount: convertToBackendAmount(taxAmount ?? 0), taxCode: taxes.code, taxValue},
                getCurrencyDecimals,
                getCurrencySymbol,
            );
            return;
        }

        if (isEditing) {
            updateMoneyRequestTaxRate({...updateTaxRateParams, taxCode: taxes.code, taxValue, taxAmount: convertToBackendAmount(taxAmount ?? 0)});
            return;
        }

        // A rate without a value has no amount to work out, and the full-page selector has always left the draft alone for it.
        if (taxAmount === undefined) {
            return;
        }

        setMoneyRequestTaxRateValues(transactionID, {taxCode: taxes.code, taxAmount: convertToBackendAmount(taxAmount), taxValue});
    };

    return {updateTaxRate};
}

export default useUpdateTransactionTaxRate;
