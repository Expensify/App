import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DecisionModal from '@components/DecisionModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    getCompanyFeeds,
    getFilteredCardList,
    getSelectedFeed,
    hasOnlyOneCardToAssign,
    isCustomFeed,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedPendingPage from './WorkspaceCompanyCardsFeedPendingPage';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';

type WorkspaceCompanyCardPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`, {selector: filterInactiveCards});

    const {cardList, ...cards} = cardsList ?? {};

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const filteredCardList = getFilteredCardList(cardsList, selectedFeed ? cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed] : undefined);

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const isNoFeed = !selectedFeedData;
    const isPending = !!selectedFeedData?.pending;
    const isFeedAdded = !isPending && !isNoFeed;
    const isFeedExpired = isSelectedFeedExpired(selectedFeed ? cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed] : undefined);
    const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(cards);
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const fetchCompanyCards = useCallback(() => {
        openPolicyCompanyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});
    const isLoading = !isOffline && (!cardFeeds || (!!cardFeeds.isLoading && isEmptyObject(cardsList)));

    useEffect(() => {
        fetchCompanyCards();
    }, [fetchCompanyCards]);

    useEffect(() => {
        if (isLoading || !selectedFeed || isPending) {
            return;
        }

        openPolicyCompanyCardsFeed(policyID, selectedFeed);
    }, [selectedFeed, isLoading, policyID, isPending]);

    const handleAssignCard = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        if (!selectedFeed) {
            return;
        }

        const isCommercialFeed = isCustomFeed(selectedFeed);

        // If the feed is a direct feed (not a commercial feed) and the user is offline,
        // show the offline alert modal to inform them of the connectivity issue.
        if (!isCommercialFeed && isOffline) {
            setShouldShowOfflineModal(true);
            return;
        }

        const data: Partial<AssignCardData> = {
            bankName: selectedFeed,
        };

        let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;
        const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !isDeletedPolicyEmployee(employee, isOffline));

        if (employeeList.length === 1) {
            const userEmail = Object.keys(policy?.employeeList ?? {}).at(0) ?? '';
            data.email = userEmail;
            const personalDetails = getPersonalDetailByEmail(userEmail);
            const memberName = personalDetails?.firstName ? personalDetails.firstName : personalDetails?.login;
            data.cardName = `${memberName}'s card`;
            currentStep = CONST.COMPANY_CARD.STEP.CARD;

            if (hasOnlyOneCardToAssign(filteredCardList)) {
                currentStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
        }

        if (isFeedExpired) {
            currentStep = CONST.COMPANY_CARD.STEP.BANK_CONNECTION;
        }

        setAssignCardStepAndData({data, currentStep});
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            {!!isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            )}
            {!isLoading && (
                <WorkspacePageWithSections
                    shouldUseScrollView={isNoFeed}
                    icon={Illustrations.CompanyCard}
                    headerText={translate('workspace.common.companyCards')}
                    route={route}
                    shouldShowOfflineIndicatorInWideScreen
                    includeSafeAreaPaddingBottom
                    showLoadingAsFirstRender={false}
                >
                    {(isFeedAdded || isPending) && !!selectedFeed && (
                        <WorkspaceCompanyCardsListHeaderButtons
                            policyID={policyID}
                            selectedFeed={selectedFeed}
                            shouldShowAssignCardButton={isPending || !isEmptyObject(cards)}
                            handleAssignCard={handleAssignCard}
                        />
                    )}
                    {isNoFeed && <WorkspaceCompanyCardPageEmptyState route={route} />}
                    {isPending && <WorkspaceCompanyCardsFeedPendingPage />}
                    {isFeedAdded && !isPending && (
                        <WorkspaceCompanyCardsList
                            cardsList={cardsList}
                            policyID={policyID}
                            handleAssignCard={handleAssignCard}
                            isDisabledAssignCardButton={!selectedFeedData || isFeedConnectionBroken}
                        />
                    )}
                </WorkspacePageWithSections>
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />

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

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
