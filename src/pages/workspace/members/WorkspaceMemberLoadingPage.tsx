/** Holds a member route during invite reconciliation without bypassing live workspace access checks. */
import LoadingPage from '@pages/LoadingPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {AccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';

import React from 'react';

type WorkspaceMemberLoadingPageProps = {
    policyID: string;
    title: string;
    onBackButtonPress: () => void;
    accessVariants?: AccessVariant[];
    /** Additional page restrictions, such as Work arrangement's beta and workspace configuration, still apply while waiting. */
    shouldBeBlocked?: boolean;
};

function WorkspaceMemberLoadingPage({policyID, title, onBackButtonPress, accessVariants, shouldBeBlocked}: WorkspaceMemberLoadingPageProps) {
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            accessVariants={accessVariants}
            shouldBeBlocked={shouldBeBlocked}
        >
            <LoadingPage
                title={title}
                onBackButtonPress={onBackButtonPress}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceMemberLoadingPage;
