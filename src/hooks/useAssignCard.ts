import {useContext} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import {importPlaidAccounts} from '@libs/actions/Plaid';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    getCompanyCardFeed,
    getCompanyFeeds,
    getDomainOrWorkspaceAccountID,
    getPlaidCountry,
    getPlaidInstitutionId,
    isCustomFeed,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDomainNameForPolicy, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import {clearAddNewCardFlow, clearAssignCardStepAndData, openPolicyCompanyCardsPage, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID, CurrencyList} from '@src/types/onyx';
import type {AssignCardData} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed} from './useCardFeeds';
import useIsAllowedToIssueCompanyCard from './useIsAllowedToIssueCompanyCard';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

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

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);

    const fetchCompanyCards = () => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});

    const cardList = allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${selectedFeed}`];

    const filteredFeedCards = filterInactiveCards(cardList);
    const hasFeedError = selectedFeed ? !!cardFeeds?.[selectedFeed]?.errors : false;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const isAllowedToIssueCompanyCard = useIsAllowedToIssueCompanyCard({policyID});

    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const isAssigningCardDisabled = !currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken || !isAllowedToIssueCompanyCard;

    const getInitialAssignCardStep = useInitialAssignCardStep({policyID, selectedFeed});

    const assignCard = (cardID?: string) => {
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

        clearAddNewCardFlow();
        clearAssignCardStepAndData();

        const initialAssignCardStep = getInitialAssignCardStep(cardID);

        if (!initialAssignCardStep) {
            return;
        }

        const {initialStep, cardToAssign} = initialAssignCardStep;

        setAssignCardStepAndData({currentStep: initialStep, cardToAssign});

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            const routeParams = {policyID, feed: selectedFeed, cardID: cardID ?? ''};

            switch (initialStep) {
                case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
                case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
                    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(policyID, selectedFeed));
                    break;
                case CONST.COMPANY_CARD.STEP.ASSIGNEE:
                default:
                    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute(routeParams));
                    break;
            }
        });
    };

    return {
        assignCard,
        isAssigningCardDisabled,
    };
}

type UseInitialAssignCardStepProps = {
    policyID: string | undefined;
    selectedFeed: CompanyCardFeedWithDomainID | undefined;
};

function useInitialAssignCardStep({policyID, selectedFeed}: UseInitialAssignCardStepProps) {
    const {isOffline} = useNetwork();

    const policy = usePolicy(policyID);

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const feedData = selectedFeed && companyCards[selectedFeed];
    const bankName = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const isFeedExpired = isSelectedFeedExpired(feedData);
    const plaidAccessToken = feedData?.plaidAccessToken;

    const getInitialAssignCardStep = (cardID: string | undefined): {initialStep: AssignCardStep; cardToAssign: Partial<AssignCardData>} | undefined => {
        if (!selectedFeed) {
            return;
        }

        const cardToAssign: Partial<AssignCardData> = {
            bankName,
            cardNumber: cardID,
            encryptedCardNumber: cardID,
        };

        // Refetch plaid card list
        if (!isFeedExpired && plaidAccessToken) {
            const country = feedData?.country ?? '';
            importPlaidAccounts('', selectedFeed, '', country, getDomainNameForPolicy(policyID), '', undefined, undefined, plaidAccessToken);
        }

        if (isFeedExpired || !cardID) {
            const institutionId = !!getPlaidInstitutionId(selectedFeed);
            if (institutionId) {
                const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
                setAddNewCompanyCardStepAndData({
                    data: {
                        selectedCountry: country,
                    },
                });

                return {
                    initialStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
                    cardToAssign,
                };
            }

            return {
                initialStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
                cardToAssign,
            };
        }

        const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !isDeletedPolicyEmployee(employee, isOffline));
        if (employeeList.length === 1) {
            const userEmail = Object.keys(policy?.employeeList ?? {}).at(0) ?? '';
            cardToAssign.email = userEmail;
            const personalDetails = getPersonalDetailByEmail(userEmail);
            const memberName = personalDetails?.firstName ? personalDetails.firstName : personalDetails?.login;
            cardToAssign.cardName = `${memberName}'s card`;

            return {
                initialStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                cardToAssign,
            };
        }

        return {
            initialStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            cardToAssign,
        };
    };

    return getInitialAssignCardStep;
}

export default useAssignCard;
