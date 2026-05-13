import React, {useCallback, useEffect, useRef, useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import useAssignCard from '@hooks/useAssignCard';
import useCompanyCards from '@hooks/useCompanyCards';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
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
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.companyCards');
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const companyCards = useCompanyCards({policyID});
    const {
        allCardFeeds,
        feedName,
        selectedFeed,
        bankName,
        isFeedPending,
        isFeedAdded,
        onyxMetadata: {cardListMetadata},
    } = companyCards;

    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

    // Use a ref so that changes to the employee list (e.g. after inviting a member) don't
    // recreate the callback and trigger an unnecessary re-fetch that flashes a skeleton loader.
    const employeeListRef = useRef(policy?.employeeList);
    useEffect(() => {
        employeeListRef.current = policy?.employeeList;
    }, [policy?.employeeList]);

    const loadPolicyCompanyCardsPage = useCallback(() => {
        const emailList = Object.keys(getMemberAccountIDsForWorkspace(employeeListRef.current));
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, emailList, translate);
    }, [domainOrWorkspaceAccountID, policyID, translate]);

    const {isOffline} = useNetwork({
        onReconnect: loadPolicyCompanyCardsPage,
    });

    const isLoading = !isOffline && (!allCardFeeds || (isFeedAdded && isLoadingOnyxValue(cardListMetadata)));

    const hasFeedsLoaded = !!allCardFeeds && Object.keys(allCardFeeds).length > 0;

    useEffect(() => {
        if (isOffline || hasFeedsLoaded) {
            return;
        }

        loadPolicyCompanyCardsPage();
    }, [loadPolicyCompanyCardsPage, isOffline, hasFeedsLoaded]);

    const loadPolicyCompanyCardsFeed = useCallback(() => {
        if (isLoading || !bankName || isFeedPending || isOffline) {
            return;
        }

        openPolicyCompanyCardsFeed(domainOrWorkspaceAccountID, policyID, bankName, translate);
    }, [bankName, domainOrWorkspaceAccountID, isFeedPending, isLoading, policyID, translate, isOffline]);

    useEffect(() => {
        loadPolicyCompanyCardsFeed();
    }, [loadPolicyCompanyCardsFeed]);

    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
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
                    policyID={policyID}
                    isPolicyLoaded={!!policy}
                    domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
                    companyCards={companyCards}
                    onAssignCard={assignCard}
                    isAssigningCardDisabled={isAssigningCardDisabled}
                    onReloadPage={loadPolicyCompanyCardsPage}
                    onReloadFeed={loadPolicyCompanyCardsFeed}
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
