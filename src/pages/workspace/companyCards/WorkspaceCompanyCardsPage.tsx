import React, {useCallback, useEffect, useState} from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import DecisionModal from '@components/DecisionModal';
import useAssignCard from '@hooks/useAssignCard';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID, getSelectedFeed} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedPendingPage from './WorkspaceCompanyCardsFeedPendingPage';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';

type WorkspaceCompanyCardsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardsPage({route}: WorkspaceCompanyCardsPageProps) {
    const policyID = route.params.policyID;

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CompanyCard'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [cardFeeds, , defaultFeed] = useCardFeeds(policyID);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const feed = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const [cardsList, cardsListMetadata] = useCardsList(selectedFeed);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const hasNoAssignedCard = Object.keys(cardsList ?? {}).length === 0;

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const isNoFeed = !selectedFeedData;
    const isPending = !!selectedFeedData?.pending;
    const isFeedAdded = !isPending && !isNoFeed;
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);
    const fetchCompanyCards = useCallback(() => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    }, [policyID, domainOrWorkspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});
    const isLoading = !isOffline && !cardFeeds;
    const isGB = countryByIp === CONST.COUNTRY.GB;
    const shouldShowGBDisclaimer = isGB && isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && (isNoFeed || hasNoAssignedCard);

    useEffect(() => {
        fetchCompanyCards();
    }, [fetchCompanyCards]);

    useEffect(() => {
        if (isLoading || !feed || isPending) {
            return;
        }

        openPolicyCompanyCardsFeed(domainOrWorkspaceAccountID, policyID, feed);
    }, [feed, isLoading, policyID, isPending, domainOrWorkspaceAccountID]);

    const {assignCard, isAssigningCardDisabled} = useAssignCard({selectedFeed, policyID, setShouldShowOfflineModal});

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            {isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                />
            )}
            {!isLoading && (
                <WorkspacePageWithSections
                    shouldUseScrollView={isNoFeed}
                    icon={illustrations.CompanyCard}
                    headerText={translate('workspace.common.companyCards')}
                    route={route}
                    shouldShowOfflineIndicatorInWideScreen
                    showLoadingAsFirstRender={false}
                    addBottomSafeAreaPadding
                >
                    {(isFeedAdded || isPending) && !!selectedFeed && (
                        <WorkspaceCompanyCardsListHeaderButtons
                            policyID={policyID}
                            selectedFeed={selectedFeed}
                        />
                    )}
                    {isNoFeed && (
                        <WorkspaceCompanyCardPageEmptyState
                            route={route}
                            shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                        />
                    )}
                    {isPending && <WorkspaceCompanyCardsFeedPendingPage />}
                    {isFeedAdded && !isPending && (
                        <WorkspaceCompanyCardsList
                            selectedFeed={selectedFeed}
                            cardsList={cardsList}
                            shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                            policyID={policyID}
                            onAssignCard={assignCard}
                            isAssigningCardDisabled={isAssigningCardDisabled}
                        />
                    )}
                </WorkspacePageWithSections>
            )}

            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setShouldShowOfflineModal(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={shouldShowOfflineModal}
                onClose={() => setShouldShowOfflineModal(false)}
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardsPage.displayName = 'WorkspaceCompanyCardsPage';

export default WorkspaceCompanyCardsPage;
