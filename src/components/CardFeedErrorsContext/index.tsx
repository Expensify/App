import React, {createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';
import useOnyx from '@hooks/useOnyx';
import {getCombinedCardFeedsFromAllFeeds} from '@libs/CardFeedUtils';
import {getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {AllCardFeedErrors, CardErrors, CardFeedErrors} from './types';

type CardFeedErrorsContextValue = {
    cardFeedErrors: AllCardFeedErrors;
};

const defaultCardFeedErrorsContextValue: CardFeedErrorsContextValue = {
    cardFeedErrors: new Map<number, Map<CompanyCardFeedWithDomainID, CardFeedErrors>>(),
};

const CardFeedErrorsContext = createContext<CardFeedErrorsContextValue>(defaultCardFeedErrorsContextValue);

// function getPolicyWorkspaceAccountIDMapping(policyCollection: OnyxCollection<Policy>): Record<string, number> {
//     return Object.entries(policyCollection ?? {}).reduce<Record<string, number>>((acc, [key, value]) => {
//         acc[key] = value?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
//         return acc;
//     }, {});
// }

function CardFeedErrorsContextProvider({children}: PropsWithChildren) {
    const [globalCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    // const [policyWorkspaceAccountIDMapping] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector: getPolicyWorkspaceAccountIDMapping});

    const [allWorkspaceCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const [companyCardFeedsPerWorkspaceAccountID] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});

    const [failedCompanyCardAssignmentsPerFeed] = useOnyx(ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, {canBeMissing: true});

    // const companyCardFeeds = new Map<{workspaceAccountID: number, feedName: CardFeed}, CardFeedData>();

    // for (const [key, value] of Object.entries(allWorkspaceCards ?? {})) {
    //     const keyParts = key.split(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST)
    //     const workspaceCardParamParts = keyParts.at(1)?.split('_');

    //     if (!workspaceCardParamParts) {
    //         continue;
    //     }

    //     const [workspaceAccountID, feedName] = workspaceCardParamParts as [string, CardFeed];

    //     companyCardFeeds.set({workspaceAccountID: Number(workspaceAccountID), feedName}, value);
    // }

    const cardFeedErrors: AllCardFeedErrors = new Map();

    function addErrorsForCard(card: Card) {
        const bankName = card.bank as CompanyCardFeed;
        const workspaceAccountID = Number(card.fundID);
        const feedName = getCompanyCardFeedWithDomainID(bankName, workspaceAccountID);

        // const cardFeedCards = allWorkspaceCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`];

        // const companyCardFeeds = companyCardFeedsPerWorkspaceAccountID?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];

        const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(companyCardFeedsPerWorkspaceAccountID);
        const selectedFeed = combinedCompanyCardFeeds?.[feedName];

        const hasFailedCardAssignments = !isEmptyObject(failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${feedName}`]);

        const hasFeedError = feedName ? !!selectedFeed?.errors : false;
        const isFeedConnectionBroken = isCardConnectionBroken(card);

        const shouldShowRBR = hasFailedCardAssignments || hasFeedError || isFeedConnectionBroken;

        const allFeedsErrors = cardFeedErrors.get(workspaceAccountID) ?? new Map<CompanyCardFeedWithDomainID, CardFeedErrors>();

        const feedErrors = allFeedsErrors.get(feedName);

        const cardErrors = feedErrors?.cardErrors ?? new Map<string, CardErrors>();

        allFeedsErrors.set(feedName, {
            shouldShowRBR,
            hasFailedCardAssignments,
            hasFeedError,
            isFeedConnectionBroken,
            cardErrors,
        });

        cardFeedErrors.set(workspaceAccountID, allFeedsErrors);
    }

    for (const card of Object.values(globalCardList ?? {})) {
        addErrorsForCard(card);
    }

    for (const [key, workspaceCardFeedCards] of Object.entries(allWorkspaceCards ?? {})) {
        const keyParts = key.split(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
        const workspaceCardParamParts = keyParts.at(1)?.split('_');

        if (!workspaceCardParamParts) {
            continue;
        }

        // const [workspaceAccountID, feedName] = workspaceCardParamParts as [number, CardFeed];

        const {cardList, ...cards} = workspaceCardFeedCards ?? {};

        for (const card of Object.values(cards ?? {})) {
            addErrorsForCard(card);
        }
    }

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    return <CardFeedErrorsContext.Provider value={{cardFeedErrors}}>{children}</CardFeedErrorsContext.Provider>;
}

function useCardFeedErrors() {
    return useContext(CardFeedErrorsContext);
}

export {CardFeedErrorsContext, CardFeedErrorsContextProvider, useCardFeedErrors};
