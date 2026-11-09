/** Keep counter copy subscriptions separate from the report-actions list's rendering work. */
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldShowMarkAsDone} from '@libs/ReportUtils';

import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import type {FloatingMessageCounterProps} from '@pages/inbox/report/FloatingMessageCounter';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

type ReportActionsListFloatingMessageCounterProps = Omit<FloatingMessageCounterProps, 'shouldShowMarkAsDoneCopy'> & {
    report: Report;
};

function ReportActionsListFloatingMessageCounter({report, ...counterProps}: ReportActionsListFloatingMessageCounterProps) {
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({policy, report, isTrackIntentUser, rules});

    return (
        <FloatingMessageCounter
            {...counterProps}
            shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
        />
    );
}

export default ReportActionsListFloatingMessageCounter;
