import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {filterInactiveCardsForWorkspace, getCardSettings} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useEffect} from 'react';

import WorkspaceExpensifyCardListPage from './WorkspaceExpensifyCardListPage';
import WorkspaceExpensifyCardPageEmptyState from './WorkspaceExpensifyCardPageEmptyState';

type WorkspaceExpensifyCardPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.expensifyCard');
    const defaultFundID = useDefaultFundID(policyID);

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const settings = getCardSettings(cardSettings);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCardsForWorkspace});
    const [cardsPageLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_EXPENSIFY_CARD_LOADING_STATE}${policyID}`);

    const fetchExpensifyCards = useCallback(() => {
        updateSelectedExpensifyCardFeed(defaultFundID, policyID);
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [policyID, defaultFundID]);

    const {isOffline} = useNetwork({onReconnect: fetchExpensifyCards});

    useEffect(() => {
        fetchExpensifyCards();
    }, [fetchExpensifyCards]);

    const paymentBankAccountID = settings?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    // Persisted settings can render immediately while the RAM-only page state is rebuilt after a reload.
    const hasOnceLoadedPage = cardsPageLoadingState?.hasOnceLoadedPage ?? cardSettings?.hasOnceLoaded;
    const isLoading = !isOffline && !hasOnceLoadedPage;

    const renderContent = () => {
        if (!isOffline && cardsPageLoadingState?.hasLoadingError && !hasOnceLoadedPage) {
            return (
                <FullPageErrorView
                    shouldShow
                    title={translate('errorPage.title', {isBreakLine: false})}
                    subtitle={translate('errorPage.subtitle')}
                    buttonTranslationKey="common.tryAgain"
                    onButtonPress={fetchExpensifyCards}
                />
            );
        }
        if (isLoading) {
            return <FullScreenLoadingIndicator shouldUseGoBackButton />;
        }
        if (paymentBankAccountID) {
            return (
                <WorkspaceExpensifyCardListPage
                    cardsList={cardsList}
                    fundID={defaultFundID}
                    route={route}
                />
            );
        }
        if (!paymentBankAccountID) {
            return <WorkspaceExpensifyCardPageEmptyState route={route} />;
        }
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
        >
            {renderContent()}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardPage;
