/**
 * Builds the callback that persists a report field value.
 *
 * Both the report field editor page and the inline report field inputs in the report view save through this, so the
 * violation, beta and recently-used handling only has to exist in one place.
 */

import {useSession} from '@components/OnyxListItemProvider';

import {updateReportField, updateReportName} from '@libs/actions/Report';
import {getReportFieldKey, hasViolations as hasViolationsReportUtils, isReportFieldDisabled, isReportFieldOfTypeTitle} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useReportTransactions from './useReportTransactions';
import useReportTransactionViolations from './useReportTransactionViolations';

function useSaveReportField(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    const session = useSession();
    const {isBetaEnabled} = usePermissions();
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS);
    // Both of these are scoped to this report so a transaction or violation change in an unrelated report does not re-render every consumer.
    const reportTransactions = useReportTransactions(report?.reportID);
    const [transactionViolations] = useReportTransactionViolations(reportTransactions);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    return (reportField: PolicyReportField, value: string) => {
        if (!report) {
            return;
        }

        if (isReportFieldOfTypeTitle(reportField)) {
            // A report always has a name, so clearing the title is discarded rather than saved.
            if (value === '') {
                return;
            }
            updateReportName(report.reportID, value, report.reportName ?? '');
            return;
        }

        const fieldKey = getReportFieldKey(reportField.fieldID);
        const hasViolations = hasViolationsReportUtils(
            report.reportID,
            transactionViolations,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            session?.email ?? '',
            undefined,
            reportTransactions,
        );
        const isFieldDisabled = isReportFieldDisabled(report, reportField, policy, rules);
        const hasOtherViolations = Object.entries(report.fieldList ?? {}).some(([key, field]) => key !== fieldKey && field.value === '' && !isFieldDisabled);

        updateReportField({
            report: {...report, reportID: report.reportID},
            reportField: {...reportField, value},
            previousReportField: reportField,
            policy,
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            hasViolationsParam: hasViolations,
            recentlyUsedReportFields,
            shouldFixViolations: hasOtherViolations,
            isTrackIntentUser,
            rules,
        });
    };
}

export default useSaveReportField;
