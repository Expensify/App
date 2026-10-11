import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isGroupPolicy} from '@libs/PolicyUtils';
import {isPolicyEligibleForSpendOverTime} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import InsightsSectionContent from './InsightsSectionContent';

function InsightsSection() {
    const {login} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isInsightsPageEnabled = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const [shouldShowInsights] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => Object.values(policies ?? {}).some((policy) => !!policy && (isInsightsPageEnabled ? isGroupPolicy(policy) : isPolicyEligibleForSpendOverTime(policy, login))),
    });

    if (!shouldShowInsights) {
        return null;
    }

    return <InsightsSectionContent />;
}

export default InsightsSection;
