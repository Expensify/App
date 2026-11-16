import useOnyx from '@hooks/useOnyx';

import {isGroupPolicy} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import InsightsSectionContent from './InsightsSectionContent';

function InsightsSection() {
    const [shouldShowInsights] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => Object.values(policies ?? {}).some((policy) => !!policy && isGroupPolicy(policy)),
    });

    if (!shouldShowInsights) {
        return null;
    }

    return <InsightsSectionContent />;
}

export default InsightsSection;
