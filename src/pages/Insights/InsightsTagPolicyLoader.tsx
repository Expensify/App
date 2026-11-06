/** Uses the existing tag read so lazy-loaded workspaces expose every configured level, not just tags on cached expenses. */
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';

import React from 'react';

type InsightsTagPolicyLoaderProps = {policyIDs: string[]};

function PolicyTagLoader({policyID}: {policyID: string}) {
    useLoadPolicyTags(policyID);
    return null;
}

function InsightsTagPolicyLoader({policyIDs}: InsightsTagPolicyLoaderProps) {
    return policyIDs.map((policyID) => (
        <PolicyTagLoader
            key={policyID}
            policyID={policyID}
        />
    ));
}

export default InsightsTagPolicyLoader;
