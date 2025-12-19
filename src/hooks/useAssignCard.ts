import {useContext} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import {importPlaidAccounts} from '@libs/actions/Plaid';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    getCompanyCardFeed,
    getCompanyFeeds,
    getDomainOrWorkspaceAccountID,
    getFilteredCardList,
    getPlaidCountry,
    getPlaidInstitutionId,
    hasOnlyOneCardToAssign,
    isCustomFeed,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDomainNameForPolicy, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import {clearAddNewCardFlow, openPolicyCompanyCardsPage, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID, CurrencyList} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {CombinedCardFeed} from './useCardFeeds';
import useCardFeeds from './useCardFeeds';
import useCardsList from './useCardsList';
import useIsAllowedToIssueCompanyCard from './useIsAllowedToIssueCompanyCard';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseAssignCardProps = {
    selectedFeed: CompanyCardFeedWithDomainID | undefined;
    policyID: string;
    setShouldShowOfflineModal: (shouldShow: boolean) => void;
};

function useAssignCard({selectedFeed, policyID, setShouldShowOfflineModal}: UseAssignCardProps) {
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = selectedFeed ? companyFeeds?.[selectedFeed] : ({} as CombinedCardFeed);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: true});
    const feed = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;

    const [cardsList] = useCardsList(selectedFeed);

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const filteredCardList = getFilteredCardList(cardsList, selectedFeed ? cardFeeds?.[selectedFeed]?.accountList : undefined, workspaceCardFeeds);

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);

    const fetchCompanyCards = () => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});

    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${selectedFeed}`]);
    const hasFeedError = selectedFeed ? !!cardFeeds?.[selectedFeed]?.errors : false;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const isAllowedToIssueCompanyCard = useIsAllowedToIssueCompanyCard({policyID});

    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const isAssigningCardDisabled = !currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken || !isAllowedToIssueCompanyCard;

    const assignCard = (cardID: string) => {
        if (isAssigningCardDisabled) {
            return;
        }

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

        if (cardID) {
            data.encryptedCardNumber = cardID;
        }

        let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;
        const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !isDeletedPolicyEmployee(employee, isOffline));
        const isFeedExpired = isSelectedFeedExpired(selectedFeedData);
        const plaidAccessToken = selectedFeedData?.plaidAccessToken;

        // Refetch plaid card list
        if (!isFeedExpired && plaidAccessToken) {
            const country = selectedFeedData?.country ?? '';
            importPlaidAccounts('', selectedFeed, '', country, getDomainNameForPolicy(policyID), '', undefined, undefined, plaidAccessToken);
        }

        if (!cardID && employeeList.length === 1) {
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
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute({policyID, feed: selectedFeed, cardID}));
        });
    };

    return {
        assignCard,
        isAssigningCardDisabled,
    };
}

export default useAssignCard;
