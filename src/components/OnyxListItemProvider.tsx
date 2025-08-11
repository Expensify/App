import React from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposeProviders from './ComposeProviders';
import createOnyxContext from './createOnyxContext';

/**
 * IMPORTANT: this should only be used for components that are rendered in a list (e.g. FlatList, SectionList, etc.)
 * Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
 * the same key (e.g. FlatList renderItem components)
 */
const [PersonalDetailsProvider, PersonalDetailsContext, usePersonalDetails] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS_LIST);
const [BlockedFromConciergeProvider, , useBlockedFromConcierge] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [BetasProvider, BetasContext, useBetas] = createOnyxContext(ONYXKEYS.BETAS);
const [SessionProvider, , useSession] = createOnyxContext(ONYXKEYS.SESSION);
const [PolicyCategoriesProvider, , usePolicyCategories] = createOnyxContext(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
const [PolicyTagsProvider, , usePolicyTags] = createOnyxContext(ONYXKEYS.COLLECTION.POLICY_TAGS);
const [ReportTransactionsAndViolationsProvider, , useAllReportsTransactionsAndViolations] = createOnyxContext(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);
const [CardListProvider, , useCardList] = createOnyxContext(ONYXKEYS.CARD_LIST);
const [WorkspaceCardListProvider, , useWorkspaceCardList] = createOnyxContext(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);

type OnyxListItemProviderProps = {
    /** Rendered child component */
    children: React.ReactNode;
};

function OnyxListItemProvider(props: OnyxListItemProviderProps) {
    return (
        <ComposeProviders
            components={[
                PersonalDetailsProvider,
                BlockedFromConciergeProvider,
                BetasProvider,
                SessionProvider,
                PolicyCategoriesProvider,
                PolicyTagsProvider,
                ReportTransactionsAndViolationsProvider,
                CardListProvider,
                WorkspaceCardListProvider,
            ]}
        >
            {props.children}
        </ComposeProviders>
    );
}

OnyxListItemProvider.displayName = 'OnyxListItemProvider';

export default OnyxListItemProvider;

export {
    usePersonalDetails,
    BetasContext,
    useBetas,
    PersonalDetailsContext,
    useBlockedFromConcierge,
    useSession,
    usePolicyCategories,
    usePolicyTags,
    useAllReportsTransactionsAndViolations,
    useCardList,
    useWorkspaceCardList,
};
