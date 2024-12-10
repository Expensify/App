import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as CompanyCards from '@userActions/CompanyCards';
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

type WorkspaceCompanyCardPageProps = PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policyID = route.params.policyID;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeeds);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`);

    const {cardList, ...cards} = cardsList ?? {};
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const filteredCardList = CardUtils.getFilteredCardList(cardsList, selectedFeed ? cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed] : undefined);

    const companyCards = CardUtils.removeExpensifyCardFromCompanyCards(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const isNoFeed = isEmptyObject(companyCards) && !selectedFeedData;
    const isPending = !!selectedFeedData?.pending;
    const isFeedAdded = !isPending && !isNoFeed;

    const fetchCompanyCards = useCallback(() => {
        CompanyCards.openPolicyCompanyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});
    const isLoading = !isOffline && (!cardFeeds || (cardFeeds.isLoading && !cardsList));

    useFocusEffect(fetchCompanyCards);

    useEffect(() => {
        if (!!isLoading || !selectedFeed || isPending) {
            return;
        }

        CompanyCards.openPolicyCompanyCardsFeed(policyID, selectedFeed);
    }, [selectedFeed, isLoading, policyID, isPending]);

    const handleAssignCard = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        if (!selectedFeed) {
            return;
        }
        const data: Partial<AssignCardData> = {
            bankName: selectedFeed,
        };

        let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;
        const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !PolicyUtils.isDeletedPolicyEmployee(employee, isOffline));

        if (employeeList.length === 1) {
            const userEmail = Object.keys(policy?.employeeList ?? {}).at(0) ?? '';
            data.email = userEmail;
            const personalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(userEmail);
            const memberName = personalDetails?.firstName ? personalDetails.firstName : personalDetails?.login;
            data.cardName = `${memberName}'s card`;
            currentStep = CONST.COMPANY_CARD.STEP.CARD;

            if (CardUtils.hasOnlyOneCardToAssign(filteredCardList)) {
                currentStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
        }

        CompanyCards.setAssignCardStepAndData({data, currentStep});
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
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
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
                            isDisabledAssignCardButton={!selectedFeedData || !!selectedFeedData?.errors}
                        />
                    )}
                </WorkspacePageWithSections>
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
