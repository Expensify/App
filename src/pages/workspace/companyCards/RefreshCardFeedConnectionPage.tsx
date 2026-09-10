import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';

import {isDirectFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import LoadingPage from '@pages/LoadingPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import {clearAssignCardStepAndData} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';

import PlaidConnectionStep from './addNew/PlaidConnectionStep';
import BankConnection from './BankConnection';

type RefreshCardFeedConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION> &
    WithPolicyAndFullscreenLoadingProps;

function RefreshCardFeedConnectionPage({route, policy}: RefreshCardFeedConnectionPageProps) {
    const feed = route.params?.feed;
    const policyID = policy?.id;

    const {translate} = useLocalize();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;
    const isRefreshing = assignCard?.isRefreshing;
    const prevIsRefreshing = usePrevious(isRefreshing);
    const title = translate('workspace.companyCards.assignNewCards.title');

    const [cardFeeds] = useCardFeeds(policyID);
    const feedExpiration = feed ? cardFeeds?.[feed]?.expiration : undefined;
    const prevFeedExpiration = usePrevious(feedExpiration);

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    // Plaid feeds: importPlaidAccounts clears isRefreshing on both success and failure. A failure also sets errors,
    // which BankConnection renders, so the panel has to stay open for them.
    useEffect(() => {
        if (prevIsRefreshing !== true || isRefreshing || !isEmptyObject(assignCard?.errors)) {
            return;
        }
        Navigation.closeRHPFlow();
    }, [prevIsRefreshing, isRefreshing, assignCard?.errors]);

    // OAuth feeds: expiration updates after bank re-authentication completes. A feed whose OAuth details were never
    // cached has no expiration yet, so the first populated value counts as completion too.
    useEffect(() => {
        if (prevFeedExpiration === feedExpiration || !isRefreshing) {
            return;
        }
        Navigation.closeRHPFlow();
    }, [prevFeedExpiration, feedExpiration, isRefreshing]);

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
                    title={title}
                />
            );
            break;
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            content = (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                    title={title}
                />
            );
            break;
        default:
            content = <LoadingPage title={title} />;
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

export default withPolicyAndFullscreenLoading(RefreshCardFeedConnectionPage);
