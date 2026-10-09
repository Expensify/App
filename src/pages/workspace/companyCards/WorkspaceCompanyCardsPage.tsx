import DecisionModal from '@components/DecisionModal';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';
import type {WorkspaceCompanyCardsTableHandle} from '@components/Tables/WorkspaceCompanyCardsTable';

import useAssignCard from '@hooks/useAssignCard';
import useCompanyCards from '@hooks/useCompanyCards';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
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

import React, {useCallback, useEffect, useEffectEvent, useRef, useState} from 'react';

type WorkspaceCompanyCardsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardsPage({route}: WorkspaceCompanyCardsPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
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

    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));

    const loadPolicyCompanyCardsPage = () => {
        const emailList = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails));
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, emailList, translate);
    };

    const {isOffline} = useNetwork({
        onReconnect: loadPolicyCompanyCardsPage,
    });

    // A freshly created workspace has no account ID until the back end returns one, so we can't treat the policy as loaded yet.
    // Offline that response can never arrive, so we consider the policy loaded to avoid showing a spinner that would never resolve.
    const isPolicyLoaded = !!policy && (policy.policyAccountID !== undefined || isOffline);

    const isLoading = !isOffline && (!allCardFeeds || (isFeedAdded && isLoadingOnyxValue(cardListMetadata)));

    const hasFeedsLoaded = !!allCardFeeds && Object.keys(allCardFeeds).length > 0;

    const isPageFetchPending = !hasFeedsLoaded;

    const loadPolicyCompanyCardsPageEvent = useEffectEvent(() => {
        if (isOffline || hasFeedsLoaded) {
            return;
        }

        loadPolicyCompanyCardsPage();
    });

    useEffect(() => {
        loadPolicyCompanyCardsPageEvent();
    }, []);

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
    const isSelectionModeEnabled = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

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
                headerText={translate(isSelectionModeEnabled ? 'common.selectMultiple' : 'workspace.common.companyCards')}
                route={route}
                policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
                onBackButtonPress={handleBackButtonPress}
                shouldUseHeadlineHeader={!isSelectionModeEnabled}
                shouldShowOfflineIndicatorInWideScreen
                showLoadingAsFirstRender={false}
                addBottomSafeAreaPadding
            >
                <WorkspaceCompanyCardsTable
                    ref={companyCardsTableRef}
                    policyID={policyID}
                    isPolicyLoaded={isPolicyLoaded}
                    isPageFetchPending={isPageFetchPending}
                    domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
                    companyCards={companyCards}
                    onAssignCard={assignCard}
                    isAssigningCardDisabled={isAssigningCardDisabled || !canWriteCompanyCards}
                    canWriteCompanyCards={canWriteCompanyCards}
                    isSelectionModeEnabled={isSelectionModeEnabled}
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
