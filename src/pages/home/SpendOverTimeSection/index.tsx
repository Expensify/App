import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {isPolicyEligibleForSpendOverTime} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import SpendOverTimeSectionContent from './SpendOverTimeSectionContent';

function SpendOverTimeSection() {
    const {login} = useCurrentUserPersonalDetails();
    const [isAnyPolicyEligibleForSpendOverTime] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => Object.values(policies ?? {}).some((policy) => !!policy && isPolicyEligibleForSpendOverTime(policy, login)),
    });

    // The widget is only shown for workspace admins/auditors/approvers.
    if (!isAnyPolicyEligibleForSpendOverTime) {
        return null;
    }

    return <SpendOverTimeSectionContent />;
}

export default SpendOverTimeSection;
