import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isGroupPolicy} from '@libs/PolicyUtils';
import {isPolicyEligibleForSpendOverTime} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import InsightsSectionContent from './InsightsSectionContent';

const hasGroupPolicySelector = (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isGroupPolicy(policy));

function InsightsSection() {
    const {login} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [hasGroupPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasGroupPolicySelector});
    const [isPolicyAdminAuditorOrApprover] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => Object.values(policies ?? {}).some((policy) => !!policy && isPolicyEligibleForSpendOverTime(policy, login)),
    });

    if (isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) ? !hasGroupPolicy : !isPolicyAdminAuditorOrApprover) {
        return null;
    }

    return <InsightsSectionContent />;
}

export default InsightsSection;
