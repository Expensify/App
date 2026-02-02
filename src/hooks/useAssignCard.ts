import {useContext, useRef} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import {importPlaidAccounts} from '@libs/actions/Plaid';
import {
    getCompanyCardFeed,
    getCompanyFeeds,
    getDefaultCardName,
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
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import useCardFeedErrors from './useCardFeedErrors';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed} from './useCardFeeds';
import useCurrencyList from './useCurrencyList';
import useIsAllowedToIssueCompanyCard from './useIsAllowedToIssueCompanyCard';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type UseAssignCardProps = {
    /** The currently selected card feed */
    feedName: CompanyCardFeedWithDomainID | undefined;

    /** The ID of the workspace/policy */
    policyID: string;

    /** Callback to show the offline modal */
    showOfflineModal: () => void | Promise<void>;
};

function useAssignCard({feedName, policyID, showOfflineModal}: UseAssignCardProps) {
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = feedName ? companyFeeds?.[feedName] : ({} as CombinedCardFeed);
    const {translate} = useLocalize();

    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = feedName && companyCards[feedName];
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);

    const fetchCompanyCards = () => {
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, translate);
    };

    const {isOffline} = useNetwork({onReconnect: fetchCompanyCards});

    const {cardFeedErrors} = useCardFeedErrors();
    const feedErrors = feedName ? cardFeedErrors[feedName] : undefined;
    const isSelectedFeedConnectionBroken = !!feedErrors?.isFeedConnectionBroken || !!feedErrors?.hasFeedErrors;

    const isAllowedToIssueCompanyCard = useIsAllowedToIssueCompanyCard({policyID});

    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const isAssigningCardDisabled = !currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken || !isAllowedToIssueCompanyCard;

    const getInitialAssignCardStep = useInitialAssignCardStep({policyID, selectedFeed: feedName});

    /**
     * Initiates the card assignment flow.
     * @param cardName - The masked card number displayed to users (e.g., "XXXX1234")
     * @param cardID - The identifier sent to backend (equals cardName for direct feeds)
     */
    const assignCard = (cardName?: string, cardID?: string) => {
        if (isAssigningCardDisabled) {
            return;
        }

        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }

        if (!feedName || !cardID) {
            return;
        }

        const isCommercialFeed = isCustomFeed(feedName);

        // If the feed is a direct feed (not a commercial feed) and the user is offline,
        // show the offline alert modal to inform them of the connectivity issue.
        if (!isCommercialFeed && isOffline) {
            showOfflineModal();
            return;
        }

        clearAddNewCardFlow();
        clearAssignCardStepAndData();

        const initialAssignCardStep = getInitialAssignCardStep(cardName, cardID);

        if (!initialAssignCardStep) {
            return;
        }

        const {initialStep, cardToAssign} = initialAssignCardStep;

        setAssignCardStepAndData({currentStep: initialStep, cardToAssign});

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            switch (initialStep) {
                case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
                case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
                    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.getRoute(policyID, feedName));
                    break;
                case CONST.COMPANY_CARD.STEP.ASSIGNEE:
                default:
                    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute({policyID, feed: feedName, cardID}));
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
    const {currencyList} = useCurrencyList();

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const feedData = selectedFeed && companyCards[selectedFeed];
    const bankName = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const isFeedExpired = isSelectedFeedExpired(feedData);
    const plaidAccessToken = feedData?.plaidAccessToken;
    const hasImportedPlaidAccounts = useRef(false);

    /**
     * Gets the initial step and card data for the assignment flow.
     * @param cardName - The masked card number displayed to users
     * @param cardID - The identifier sent to backend (equals cardName for direct feeds)
     */
    const getInitialAssignCardStep = (cardName: string | undefined, cardID?: string): {initialStep: AssignCardStep; cardToAssign: Partial<AssignCardData>} | undefined => {
        if (!selectedFeed) {
            return;
        }

        const cardToAssign: Partial<AssignCardData> = {
            bankName,
            cardName,
            encryptedCardNumber: cardID,
        };

        // Refetch plaid card list
        if (!isFeedExpired && plaidAccessToken && !hasImportedPlaidAccounts.current) {
            const country = feedData?.country ?? '';
            importPlaidAccounts('', selectedFeed, '', country, getDomainNameForPolicy(policyID), '', undefined, undefined, plaidAccessToken);
            hasImportedPlaidAccounts.current = true;
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
            cardToAssign.customCardName = getDefaultCardName(memberName);

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
