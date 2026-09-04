import useChangeTransactionsReportReports from '@hooks/useChangeTransactionsReportReports';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsByID from '@hooks/useTransactionsByID';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isIOUReport} from '@libs/ReportUtils';

import Navigation from '@navigation/Navigation';

import {convertBulkTrackedExpensesToIOU} from '@userActions/IOU/TrackExpense';
import {changeTransactionsReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

import Button from './ButtonComposed';
import FormHelpMessage from './FormHelpMessage';
import {usePersonalDetails, useSession} from './OnyxListItemProvider';

type AddExistingExpenseFooterProps = {
    /** Selected transaction IDs */
    selectedIds: Set<string>;
    /** The report to add expenses to */
    report: OnyxEntry<Report>;
    /** The report to confirm */
    reportToConfirm: OnyxEntry<Report>;
    /** The policy */
    policy: OnyxEntry<Policy>;
    /** The policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;
    /** Error message displayed in this component */
    errorMessage: string;
    /** Function for setting new error message */
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

function AddExistingExpenseFooter({selectedIds, report, reportToConfirm, policy, policyCategories, errorMessage, setErrorMessage}: AddExistingExpenseFooterProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalPolicy = usePersonalPolicy();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [chatReportPolicyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${chatReport?.policyID}`);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReportID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const [transactions] = useTransactionsByID([...selectedIds]);
    const reports = useChangeTransactionsReportReports(transactions, reportToConfirm?.reportID);

    const handleConfirm = () => {
        if (selectedIds.size === 0) {
            setErrorMessage(translate('iou.selectExistingExpense'));
            return;
        }

        Navigation.dismissToSuperWideRHP({
            afterTransition: () => {
                if (report && isIOUReport(report)) {
                    convertBulkTrackedExpensesToIOU({
                        getCurrencyDecimals,
                        transactions,
                        iouReport: report,
                        chatReport,
                        isASAPSubmitBetaEnabled,
                        currentUserAccountIDParam: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        currentUserEmailParam: session?.email ?? '',
                        transactionViolations,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        quickAction,
                        personalDetails,
                        betas,
                        policyTagList: report?.policyID ? policyTagList : chatReportPolicyTagList,
                        selfDMReportActions,
                        delegateAccountID,
                        isTrackIntentUser,
                        formatPhoneNumber,
                    });
                } else {
                    changeTransactionsReport({
                        transactionIDs: [...selectedIds],
                        isASAPSubmitBetaEnabled,
                        accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        email: session?.email ?? '',
                        newReport: reportToConfirm,
                        policy,
                        policyCategories,
                        policyTagList,
                        transactions,
                        allTransactionViolation: transactionViolations,
                        reports,
                        isTrackIntentUser,
                        personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                        selfDMReportActions,
                        delegateAccountID,
                        getCurrencyDecimals,
                        getCurrencySymbol,
                    });
                }
            },
        });
        setErrorMessage('');
    };
    return (
        <>
            {!!errorMessage && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={errorMessage}
                />
            )}
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                style={[styles.w100, styles.justifyContentCenter]}
                onPress={handleConfirm}
            >
                <Button.KeyboardShortcut enterKeyEventListenerPriority={1} />
                <Button.Text>{translate('iou.addExistingExpenseConfirm')}</Button.Text>
            </Button>
        </>
    );
}

AddExistingExpenseFooter.displayName = 'AddExistingExpenseFooter';

export default AddExistingExpenseFooter;
