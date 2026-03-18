import React, {useCallback, useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import LoadingPage from '@pages/LoadingPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import PlaidConnectionStep from './addNew/PlaidConnectionStep';
import BankConnection from './BankConnection';

type BrokenCardFeedConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION> &
    WithPolicyAndFullscreenLoadingProps;

function BrokenCardFeedConnectionPage({route, policy}: BrokenCardFeedConnectionPageProps) {
    const feed = route.params?.feed;
    const policyID = policy?.id;

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;
    const {updateBrokenConnection} = useUpdateFeedBrokenConnection({policyID, feed});

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    const handleAssignSuccess = useCallback(() => {
        setAssignCardStepAndData({
            currentStep: assignCard?.cardToAssign?.dateOption ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.ASSIGNEE,
            isEditing: false,
        });
    }, [assignCard?.cardToAssign?.dateOption]);

    const handleAssignFailure = useCallback(() => {
        updateBrokenConnection();
        if (shouldUseNarrowLayout) {
            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            return;
        }
        Navigation.closeRHPFlow();
    }, [policyID, shouldUseNarrowLayout, updateBrokenConnection]);

    const handleBackButtonPress = useCallback(() => {
        if (shouldUseNarrowLayout) {
            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            return;
        }
        Navigation.closeRHPFlow();
    }, [policyID, shouldUseNarrowLayout]);

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                    onSuccess={handleAssignSuccess}
                    onFailure={handleAssignFailure}
                    onBackButtonPress={handleBackButtonPress}
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
            return <LoadingPage title={translate('workspace.companyCards.assignCard')} />;
    }
}

export default withPolicyAndFullscreenLoading(BrokenCardFeedConnectionPage);
