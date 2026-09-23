import useCardFeeds from '@hooks/useCardFeeds';
import useOnyx from '@hooks/useOnyx';

import {isDirectFeed} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import {clearAssignCardStepAndData} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

import PlaidConnectionStep from './addNew/PlaidConnectionStep';
import BankConnection from './BankConnection';

type BrokenCardFeedConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION> &
    WithPolicyAndFullscreenLoadingProps;

function BrokenCardFeedConnectionPage({route, policy}: BrokenCardFeedConnectionPageProps) {
    const feed = route.params?.feed;
    const policyID = policy?.id;

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;

    const [cardFeeds] = useCardFeeds(policyID);

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    if (!isDirectFeed(feed) || !cardFeeds?.[feed] || !currentStep) {
        return <NotFoundPage />;
    }

    let content: React.ReactNode;
    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            content = (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                />
            );
            break;
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            content = (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
            break;
        default:
            content = <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            {content}
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(BrokenCardFeedConnectionPage);
