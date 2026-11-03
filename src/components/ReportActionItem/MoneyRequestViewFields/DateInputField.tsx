import DatePicker from '@components/DatePicker';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getFormattedCreated, isDistanceRequest} from '@libs/TransactionUtils';

import {updateMoneyRequestDate} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import {View} from 'react-native';

type DateInputFieldProps = {
    /** Expense whose date is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the expense is tracked rather than reported, which moves the date's policy to the workspace for moving expenses */
    isTrackExpense: boolean;

    /** Label above the date, which can carry extra detail such as the posted date */
    label: string;

    /** Violation message for the date */
    errorText?: string;
};

/**
 * The date of a saved expense, picked in place from the calendar. A pick is saved right away, through the same
 * action the date page uses. Clearing the date only empties the field until the next pick, since an expense always
 * needs a date.
 */
function DateInputField({transaction, transactionThreadReport, isTrackExpense, label, errorText = ''}: DateInputFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalPolicy = usePersonalPolicy();
    const policy = usePolicy(transactionThreadReport?.policyID);
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);
    const effectivePolicy = isTrackExpense ? policyForTrackExpense : policy;
    const customUnitRateID = isDistanceRequest(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !!customUnitRateID && !getDistanceRateCustomUnitRate(effectivePolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const currentCreated = getFormattedCreated(transaction);
    const [isCleared, setIsCleared] = useState(false);

    const saveDate = (newCreated: string) => {
        setIsCleared(!newCreated);
        // An expense always needs a date, so an emptied picker keeps the saved one
        if (!newCreated || newCreated === currentCreated || !transaction?.transactionID) {
            return;
        }

        updateMoneyRequestDate({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            transactions: duplicateTransactions,
            transactionViolations: duplicateTransactionViolations,
            value: newCreated,
            policy: effectivePolicy,
            policyForTrackExpense,
            policyTags,
            policyCategories,
            reportPolicyTags,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            isOffline,
            delegateAccountID,
            distanceOriginalPolicy,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    return (
        // `DatePicker` carries the 8px vertical margin every field row has, so this only adds the side margins
        <View style={styles.mh5}>
            <DatePicker
                inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                value={isCleared ? '' : currentCreated}
                label={label || translate('common.date')}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={saveDate}
                errorText={errorText}
                shouldDeferShowUntilPositioned
                iconContainerStyle={styles.moneyRequestFieldInputIcon}
                onPickerVisibilityChange={(isVisible) => {
                    // Closing the calendar without a pick brings back the saved date
                    if (isVisible || !isCleared) {
                        return;
                    }
                    setIsCleared(false);
                }}
            />
        </View>
    );
}

export default DateInputField;
