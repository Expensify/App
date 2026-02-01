import React from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {isIOUReport} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {convertBulkTrackedExpensesToIOU} from '@userActions/IOU';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import {usePersonalDetails, useSession} from './OnyxListItemProvider';

type AddUnreportedExpenseFooterProps = {
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

function AddUnreportedExpenseFooter({selectedIds, report, reportToConfirm, reportNextStep, policy, policyCategories, errorMessage, setErrorMessage}: AddUnreportedExpenseFooterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    
    const handleConfirm = () => {
        if (selectedIds.size === 0) {
            setErrorMessage(translate('iou.selectUnreportedExpense'));
            return;
        }
        Navigation.dismissToSuperWideRHP();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (report && isIOUReport(report)) {
                convertBulkTrackedExpensesToIOU(
                    [...selectedIds],
                    report.reportID,
                    isASAPSubmitBetaEnabled,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    transactionViolations,
                    policyRecentlyUsedCurrencies ?? [],
                    quickAction,
                    personalDetails,
                    betas,
                );
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
                    allTransactions,
                });
            }
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
                text={translate('iou.addUnreportedExpenseConfirm')}
                onPress={handleConfirm}
                pressOnEnter
                enterKeyEventListenerPriority={1}
            />
        </>
    );
}

AddUnreportedExpenseFooter.displayName = 'AddUnreportedExpenseFooter';

export default AddUnreportedExpenseFooter;
