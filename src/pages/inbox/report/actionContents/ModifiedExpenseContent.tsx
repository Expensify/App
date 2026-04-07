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
import type * as OnyxTypes from '@src/types/onyx';

type ModifiedExpenseContentProps = {
    action: OnyxTypes.ReportAction;
    policy: OnyxEntry<OnyxTypes.Policy>;
    childReport: OnyxEntry<OnyxTypes.Report>;
    originalReport: OnyxEntry<OnyxTypes.Report>;
};

function ModifiedExpenseContent({action, policy, childReport, originalReport}: ModifiedExpenseContentProps) {
    const {translate} = useLocalize();
    const {email: currentUserEmail} = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();

    // When an expense is moved from a self-DM to a workspace, the report's policyID is temporarily
    // set to a fake placeholder (CONST.POLICY.OWNER_EMAIL_FAKE). Looking up POLICY_TAGS with that
    // fake ID would return nothing, so we fall back to policyForMovingExpensesID (the actual
    // destination workspace) to fetch the correct tag list for display.
    const policyIDForTags = policy?.id === CONST.POLICY.OWNER_EMAIL_FAKE && policyForMovingExpensesID ? policyForMovingExpensesID : policy?.id;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyIDForTags}`);
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.TO)}`);

    const message = getForReportAction({
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
            message={message}
            action={action}
            childReport={childReport}
            originalReport={originalReport}
        />
    );
}

export default ModifiedExpenseContent;
