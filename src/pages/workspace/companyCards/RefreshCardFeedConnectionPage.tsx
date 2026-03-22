import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@libs/Navigation/Navigation';
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

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;
    const isRefreshing = assignCard?.isRefreshing;

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    useEffect(() => {
        if (isRefreshing) {
            return;
        }
        Navigation.closeRHPFlow();
    }, [isRefreshing]);

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                />
            );
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        default:
            return <LoadingPage title={translate('workspace.companyCards.assignNewCards.title')} />;
    }
}

export default withPolicyAndFullscreenLoading(RefreshCardFeedConnectionPage);
