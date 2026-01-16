import React, {useEffect, useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import useAssignCard from '@hooks/useAssignCard';
import useCardsList from '@hooks/useCardsList';
import useCompanyCards from '@hooks/useCompanyCards';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {openWorkspaceMembersPage} from '@libs/actions/Policy/Member';
import {getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardsTable from './WorkspaceCompanyCardsTable';

type WorkspaceCompanyCardsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardsPage({route}: WorkspaceCompanyCardsPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const memoizedIllustrations = useMemoizedLazyIllustrations(['CompanyCard']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {
        allCardFeeds,
        feedName,
        selectedFeed,
        bankName,
        onyxMetadata: {allCardFeedsMetadata},
    } = useCompanyCards({policyID});
    const [, cardsListMetadata] = useCardsList(feedName);

    const isInitiallyLoadingFeeds = isLoadingOnyxValue(allCardFeedsMetadata);
    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isFeedAdded = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed;
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);
    const {isOffline} = useNetwork({
        onReconnect: () => openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID),
    });

    useEffect(() => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    }, [policyID, domainOrWorkspaceAccountID]);

    const isLoading = !isOffline && (!allCardFeeds || (isFeedAdded && isLoadingOnyxValue(cardsListMetadata)));
    useEffect(() => {
        if (isLoading || !bankName || isFeedPending) {
            return;
        }

        const clientMemberEmails = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList));
        openWorkspaceMembersPage(policyID, clientMemberEmails);
        openPolicyCompanyCardsFeed(domainOrWorkspaceAccountID, policyID, bankName);
    }, [bankName, isLoading, policyID, isFeedPending, domainOrWorkspaceAccountID, policy?.employeeList]);

    const {assignCard, isAssigningCardDisabled} = useAssignCard({feedName, policyID, setShouldShowOfflineModal});

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                icon={memoizedIllustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                shouldShowOfflineIndicatorInWideScreen
                showLoadingAsFirstRender={false}
                addBottomSafeAreaPadding
            >
                <WorkspaceCompanyCardsTable
                    policy={policy}
                    onAssignCard={assignCard}
                    isAssigningCardDisabled={isAssigningCardDisabled}
                />
            </WorkspacePageWithSections>

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

export default WorkspaceCompanyCardsPage;
