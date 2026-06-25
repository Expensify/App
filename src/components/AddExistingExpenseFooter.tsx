import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsByID from '@hooks/useTransactionsByID';
import {isIOUReport} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {convertBulkTrackedExpensesToIOU} from '@userActions/IOU/TrackExpense';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import {usePersonalDetails, useSession} from './OnyxListItemProvider';

type AddExistingExpenseFooterProps = {
    /** Selected transaction IDs */
    selectedIds: Set<string>;
    /** The report to add expenses to */
    report: OnyxEntry<Report>;
    /** The report to confirm */
    reportToConfirm: OnyxEntry<Report>;
    /** The report next step */
    reportNextStep: OnyxEntry<ReportNextStepDeprecated>;
    /** The policy */
    policy: OnyxEntry<Policy>;
    /** The policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;
    /** Error message displayed in this component */
    errorMessage: string;
    /** Function for setting new error message */
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

function AddExistingExpenseFooter({selectedIds, report, reportToConfirm, reportNextStep, policy, policyCategories, errorMessage, setErrorMessage}: AddExistingExpenseFooterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [chatReportPolicyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${chatReport?.policyID}`);

    const [transactions] = useTransactionsByID([...selectedIds]);

    const handleConfirm = () => {
        if (selectedIds.size === 0) {
            setErrorMessage(translate('iou.selectExistingExpense'));
            return;
        }

        Navigation.dismissToSuperWideRHP({
            afterTransition: () => {
                if (report && isIOUReport(report)) {
                    convertBulkTrackedExpensesToIOU({
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
                    });
                } else {
                    changeTransactionsReport({
                        transactionIDs: [...selectedIds],
                        isASAPSubmitBetaEnabled,
                        accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        email: session?.email ?? '',
                        newReport: reportToConfirm,
                        policy,
                        reportNextStep,
                        policyCategories,
                        policyTagList,
                        transactions,
                        allTransactionViolation: transactionViolations,
                        allReports,
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
                success
                large
                style={[styles.w100, styles.justifyContentCenter]}
                text={translate('iou.addExistingExpenseConfirm')}
                onPress={handleConfirm}
                pressOnEnter
                enterKeyEventListenerPriority={1}
            />
        </>
    );
}

AddExistingExpenseFooter.displayName = 'AddExistingExpenseFooter';

export default AddExistingExpenseFooter;
