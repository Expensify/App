import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {isPolicyEligibleForSpendOverTime} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import InsightsSectionContent from './InsightsSectionContent';

function InsightsSection() {
    const {login} = useCurrentUserPersonalDetails();
    const [isAnyPolicyEligibleForInsights] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => Object.values(policies ?? {}).some((policy) => !!policy && isPolicyEligibleForSpendOverTime(policy, login)),
    });

    // The widget is only shown for workspace admins/auditors/approvers.
    if (!isAnyPolicyEligibleForInsights) {
        return null;
    }

    return <InsightsSectionContent />;
}

export default InsightsSection;
