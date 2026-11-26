import {useAllPersonalDetails} from '@hooks/usePersonalDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext} from 'react';

import ActivePolicyProvider from './ActivePolicyProvider';
import ComposeProviders from './ComposeProviders';
import createOnyxContext from './createOnyxContext';

/**
 * IMPORTANT: this should only be used for components that are rendered in a list (e.g. FlatList, etc.)
 * Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
 * the same key (e.g. FlatList renderItem components)
 */
const PersonalDetailsContext = createContext<PersonalDetailsList | undefined | null>(null);

function PersonalDetailsProvider({children}: ChildrenProps) {
    const [personalDetails] = useAllPersonalDetails();
    return <PersonalDetailsContext.Provider value={personalDetails}>{children}</PersonalDetailsContext.Provider>;
}

function usePersonalDetails() {
    const personalDetails = useContext(PersonalDetailsContext);
    if (personalDetails === null) {
        throw new Error('usePersonalDetails must be used within a OnyxListItemProvider');
    }
    return personalDetails;
}

const [BlockedFromConciergeProvider, , useBlockedFromConcierge] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [BetasProvider, BetasContext] = createOnyxContext(ONYXKEYS.BETAS);
const [BetaConfigurationProvider, BetaConfigurationContext] = createOnyxContext(ONYXKEYS.BETA_CONFIGURATION);
const [BetaOverridesProvider, BetaOverridesContext] = createOnyxContext(ONYXKEYS.BETA_OVERRIDES);
const [SessionProvider, , useSession] = createOnyxContext(ONYXKEYS.SESSION);
const [ReportTransactionsAndViolationsProvider, , useAllReportsTransactionsAndViolations] = createOnyxContext(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);
const [CardListProvider, , useCardList] = createOnyxContext(ONYXKEYS.CARD_LIST);
const [WorkspaceCardListProvider, , useWorkspaceCardList] = createOnyxContext(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
const [OnboardingValuesProvider, ,] = createOnyxContext(ONYXKEYS.NVP_ONBOARDING);

type OnyxListItemProviderProps = {
    children: React.ReactNode;
};

function OnyxListItemProvider(props: OnyxListItemProviderProps) {
    return (
        <ComposeProviders
            components={[
                PersonalDetailsProvider,
                BlockedFromConciergeProvider,
                BetasProvider,
                BetaConfigurationProvider,
                BetaOverridesProvider,
                SessionProvider,
                ReportTransactionsAndViolationsProvider,
                CardListProvider,
                WorkspaceCardListProvider,
                OnboardingValuesProvider,
                ActivePolicyProvider,
            ]}
        >
            {props.children}
        </ComposeProviders>
    );
}

export default OnyxListItemProvider;

export {
    usePersonalDetails,
    BetasContext,
    BetaConfigurationContext,
    BetaOverridesContext,
    useBlockedFromConcierge,
    useSession,
    useAllReportsTransactionsAndViolations,
    useCardList,
    useWorkspaceCardList,
};
