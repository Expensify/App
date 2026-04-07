import React, {useEffect} from 'react';
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
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
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

    // Plaid feeds: isRefreshing is cleared by importPlaidAccounts successData
    useEffect(() => {
        if (prevIsRefreshing !== true || isRefreshing) {
            return;
        }
        Navigation.closeRHPFlow();
    }, [prevIsRefreshing, isRefreshing]);

    // OAuth feeds: expiration updates after bank re-authentication completes
    useEffect(() => {
        if (prevFeedExpiration === undefined || prevFeedExpiration === feedExpiration || !isRefreshing) {
            return;
        }
        Navigation.closeRHPFlow();
    }, [prevFeedExpiration, feedExpiration, isRefreshing]);

    if (!isDirectFeed(feed) || !cardFeeds?.[feed] || !currentStep) {
        return <NotFoundPage />;
    }

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                    title={title}
                />
            );
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                    title={title}
                />
            );
        default:
            return <LoadingPage title={title} />;
    }
}

export default withPolicyAndFullscreenLoading(RefreshCardFeedConnectionPage);
