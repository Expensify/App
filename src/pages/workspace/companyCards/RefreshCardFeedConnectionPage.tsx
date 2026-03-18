import React, {useCallback, useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import LoadingPage from '@pages/LoadingPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const {updateBrokenConnection} = useUpdateFeedBrokenConnection({policyID, feed});

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    const navigateToFeedSettings = useCallback(() => {
        Navigation.goBack(policyID ? ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID) : undefined);
    }, [policyID]);

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                    isRefreshConnectionFlow
                    onFailure={updateBrokenConnection}
                    onBackButtonPress={navigateToFeedSettings}
                />
            );
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                    isRefreshConnectionFlow
                />
            );
        default:
            return <LoadingPage title={translate('workspace.moreFeatures.companyCards.assignNewCards')} />;
    }
}

export default withPolicyAndFullscreenLoading(RefreshCardFeedConnectionPage);
