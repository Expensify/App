import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {getForReportAction, getMovedReportID} from '@libs/ModifiedExpenseMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ModifiedExpenseContentProps = {
    action: ReportAction;
    report: OnyxEntry<Report>;
    childReport: OnyxEntry<Report>;
    originalReport: OnyxEntry<Report>;
};

function ModifiedExpenseContent({action, report, childReport, originalReport}: ModifiedExpenseContentProps) {
    const {translate} = useLocalize();
    const {email: currentUserEmail} = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);

    // When expense is moved from self-DM to workspace, policyID is temporarily OWNER_EMAIL_FAKE.
    // Fall back to policyForMovingExpensesID (actual destination workspace) for correct tag list.
    const policyIDForTags = report?.policyID === CONST.POLICY.OWNER_EMAIL_FAKE && policyForMovingExpensesID ? policyForMovingExpensesID : report?.policyID;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyIDForTags}`);
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.TO)}`);

    const modifiedExpenseMessage = getForReportAction({
        translate,
        reportAction: action,
        policy,
        movedFromReport,
        movedToReport,
        policyTags: policyTags ?? CONST.POLICY.DEFAULT_TAG_LIST,
        currentUserLogin: currentUserEmail ?? '',
    });

    return (
        <ReportActionItemMessageWithExplain
            message={modifiedExpenseMessage}
            action={action}
            childReport={childReport}
            originalReport={originalReport}
        />
    );
}

ModifiedExpenseContent.displayName = 'ModifiedExpenseContent';

export default ModifiedExpenseContent;
