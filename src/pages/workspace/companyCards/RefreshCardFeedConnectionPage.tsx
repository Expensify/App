import React, {useCallback, useEffect, useState} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
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

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const currentStep = assignCard?.currentStep;
    const [isRefreshComplete, setIsRefreshComplete] = useState(false);

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    const handleRefreshComplete = useCallback(() => {
        setIsRefreshComplete(true);
    }, []);

    if (isRefreshComplete) {
        return (
            <ScreenWrapper testID="RefreshCardFeedConnectionSuccess">
                <HeaderWithBackButton
                    title={translate('workspace.moreFeatures.companyCards.assignNewCards')}
                    onBackButtonPress={() => Navigation.dismissModal()}
                />
                <ConfirmationPage
                    heading={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccess')}
                    description={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccessDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.dismissModal()}
                />
            </ScreenWrapper>
        );
    }

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                    isRefreshConnectionFlow
                    onRefreshComplete={handleRefreshComplete}
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
