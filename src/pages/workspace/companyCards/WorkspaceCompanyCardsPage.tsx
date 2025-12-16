import React, {useCallback, useContext, useEffect, useState} from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import DecisionModal from '@components/DecisionModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    checkIfFeedConnectionIsBroken,
    getCompanyCardFeed,
    getCompanyFeeds,
    getDomainOrWorkspaceAccountID,
    getFilteredCardList,
    getPlaidCountry,
    getPlaidInstitutionId,
    getSelectedFeed,
    hasOnlyOneCardToAssign,
    isCustomFeed,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDomainNameForPolicy, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {clearAddNewCardFlow, openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import {importPlaidAccounts} from '@userActions/Plaid';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CurrencyList} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedPendingPage from './WorkspaceCompanyCardsFeedPendingPage';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';

type WorkspaceCompanyCardsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardsPage({route}: WorkspaceCompanyCardsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CompanyCard']);
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: true});
    const [cardFeeds, , defaultFeed] = useCardFeeds(policyID);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const feed = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const [cardsList] = useCardsList(selectedFeed);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const hasNoAssignedCard = Object.keys(cardsList ?? {}).length === 0;

    const {cardList, ...cards} = cardsList ?? {};

    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const filteredCardList = getFilteredCardList(cardsList, selectedFeed ? cardFeeds?.[selectedFeed]?.accountList : undefined, workspaceCardFeeds);

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const isNoFeed = !selectedFeedData;
    const isPending = !!selectedFeedData?.pending;
    const isFeedAdded = !isPending && !isNoFeed;
    const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(cards);
    const [shouldShowOfflineModal, setShouldShowOfflineModal] = useState(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);
    const fetchCompanyCards = useCallback(() => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    }, [policyID, domainOrWorkspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});
    const isLoading = !isOffline && (!cardFeeds || (!!defaultFeed?.isLoading && isEmptyObject(cardsList)));
    const isGB = countryByIp === CONST.COUNTRY.GB;
    const shouldShowGBDisclaimer = isGB && isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && (isNoFeed || hasNoAssignedCard);
    const isAllowedToIssueCompanyCard = useIsAllowedToIssueCompanyCard({policyID});

    useEffect(() => {
        fetchCompanyCards();
    }, [fetchCompanyCards]);

    useEffect(() => {
        if (isLoading || !feed || isPending) {
            return;
        }

        openPolicyCompanyCardsFeed(domainOrWorkspaceAccountID, policyID, feed);
    }, [feed, isLoading, policyID, isPending, domainOrWorkspaceAccountID]);

    const handleAssignCard = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
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
            bankName: feed,
        };

        let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;
        const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !isDeletedPolicyEmployee(employee, isOffline));
        const isFeedExpired = isSelectedFeedExpired(selectedFeedData);
        const plaidAccessToken = selectedFeedData?.plaidAccessToken;

        // Refetch plaid card list
        if (!isFeedExpired && plaidAccessToken) {
            const country = selectedFeedData?.country ?? '';
            importPlaidAccounts('', selectedFeed, '', country, getDomainNameForPolicy(policyID), '', undefined, undefined, plaidAccessToken);
        }

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
            const institutionId = !!getPlaidInstitutionId(selectedFeed);
            if (institutionId) {
                const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
                setAddNewCompanyCardStepAndData({
                    data: {
                        selectedCountry: country,
                    },
                });
            }
            currentStep = institutionId ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION;
        }

        clearAddNewCardFlow();
        setAssignCardStepAndData({data, currentStep});
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)));
    };

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
                            shouldShowAssignCardButton={isPending || !isEmptyObject(cards)}
                            handleAssignCard={handleAssignCard}
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
                            cardsList={cardsList}
                            shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                            policyID={policyID}
                            handleAssignCard={handleAssignCard}
                            isDisabledAssignCardButton={!selectedFeedData || isFeedConnectionBroken || !isAllowedToIssueCompanyCard}
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

export default WorkspaceCompanyCardsPage;
