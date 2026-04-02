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
    const [hasTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => Object.keys(transactions ?? {}).length > 0,
    });

    // The widget is only shown for workspace admins/auditors/approvers.
    // If there are no transactions (e.g. a brand new account) we expect the Search results to be empty,
    // so we don't show the section to avoid briefly displaying a loading widget that disappears once the empty results load.
    if (!isAnyPolicyEligibleForSpendOverTime || !hasTransactions) {
        return null;
    }

    return <SpendOverTimeSectionContent />;
}

export default SpendOverTimeSection;
