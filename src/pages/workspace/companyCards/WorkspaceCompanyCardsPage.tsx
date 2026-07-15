import DecisionModal from '@components/DecisionModal';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';
import type {WorkspaceCompanyCardsTableHandle} from '@components/Tables/WorkspaceCompanyCardsTable';

import useAssignCard from '@hooks/useAssignCard';
import useCompanyCards from '@hooks/useCompanyCards';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import {openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback, useEffect, useRef, useState} from 'react';

type WorkspaceCompanyCardsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardsPage({route}: WorkspaceCompanyCardsPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const memoizedIllustrations = useMemoizedLazyIllustrations(['CompanyCard']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const companyCardsTableRef = useRef<WorkspaceCompanyCardsTableHandle>(null);

    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.companyCards');
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

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
    const canWriteCompanyCards = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS);

    const handleBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            companyCardsTableRef.current?.clearSelection();
            turnOffMobileSelectionMode();
            return;
        }

        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
        >
            <WorkspacePageWithSections
                icon={memoizedIllustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
                onBackButtonPress={handleBackButtonPress}
                shouldShowOfflineIndicatorInWideScreen
                showLoadingAsFirstRender={false}
                addBottomSafeAreaPadding
            >
                <WorkspaceCompanyCardsTable
                    ref={companyCardsTableRef}
                    policyID={policyID}
                    isPolicyLoaded={!!policy}
                    domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
                    companyCards={companyCards}
                    onAssignCard={assignCard}
                    isAssigningCardDisabled={isAssigningCardDisabled || !canWriteCompanyCards}
                    canWriteCompanyCards={canWriteCompanyCards}
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
