import React, {useEffect, useState} from 'react';
import Button from '@components/Button';
import DecisionModal from '@components/DecisionModal';
import Text from '@components/Text';
import useAssignCard from '@hooks/useAssignCard';
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
    const {isOffline} = useNetwork({
        onReconnect: () => openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID),
    });

    const isLoading = !isOffline && (!allCardFeeds || (isFeedAdded && isLoadingOnyxValue(cardListMetadata)));
    useEffect(() => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    }, [policyID, domainOrWorkspaceAccountID]);

    useEffect(() => {
        if (isLoading || !bankName || isFeedPending) {
            return;
        }

        const clientMemberEmails = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList));
        openWorkspaceMembersPage(policyID, clientMemberEmails);
        openPolicyCompanyCardsFeed(domainOrWorkspaceAccountID, policyID, bankName);
    }, [bankName, isLoading, policyID, isFeedPending, domainOrWorkspaceAccountID, policy?.employeeList]);

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
                />
            </WorkspacePageWithSections>

            <DecisionModal
                isVisible={shouldShowOfflineModal}
                onClose={() => setShouldShowOfflineModal(false)}
                isSmallScreenWidth={shouldUseNarrowLayout}
            >
                <DecisionModal.Header title={translate('common.youAppearToBeOffline')} />
                <Text>{translate('common.offlinePrompt')}</Text>
                <DecisionModal.Footer>
                    <Button
                        text={translate('common.buttonConfirm')}
                        onPress={() => setShouldShowOfflineModal(false)}
                        large
                    />
                </DecisionModal.Footer>
            </DecisionModal>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardsPage;
