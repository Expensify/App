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

function useSaveReportField(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    const session = useSession();
    const {isBetaEnabled} = usePermissions();
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    return (reportField: PolicyReportField, value: string) => {
        if (!report) {
            return;
        }

        if (isReportFieldOfTypeTitle(reportField)) {
            updateReportName(report.reportID, value, report.reportName ?? '');
            return;
        }

        // An empty value is not a valid report field value, so it is discarded rather than saved.
        if (value === '') {
            return;
        }

        const fieldKey = getReportFieldKey(reportField.fieldID);
        const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        const hasOtherViolations = Object.entries(report.fieldList ?? {}).some(
            ([key, field]) => key !== fieldKey && field.value === '' && !isReportFieldDisabled(report, reportField, policy),
        );

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
        });
    };
}

export default useSaveReportField;
