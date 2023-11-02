import React from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposeProviders from './ComposeProviders';
import createOnyxContext from './createOnyxContext';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider, NetworkContext] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider, , usePersonalDetails] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS_LIST);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [withReportActionsDrafts, ReportActionsDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
const [withBlockedFromConcierge, BlockedFromConciergeProvider] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [withBetas, BetasProvider, BetasContext] = createOnyxContext(ONYXKEYS.BETAS);
const [withReportCommentDrafts, ReportCommentDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
const [withPreferredTheme, PreferredThemeProvider, PreferredThemeContext] = createOnyxContext(ONYXKEYS.PREFERRED_THEME);

type OnyxProviderProps = {
    /** Rendered child component */
    children: React.ReactNode;
};

function OnyxProvider(props: OnyxProviderProps) {
    return (
        <ComposeProviders
            components={[
                NetworkProvider,
                PersonalDetailsProvider,
                ReportActionsDraftsProvider,
                CurrentDateProvider,
                BlockedFromConciergeProvider,
                BetasProvider,
                ReportCommentDraftsProvider,
                PreferredThemeProvider,
            ]}
        >
            {props.children}
        </ComposeProviders>
    );
}

OnyxProvider.displayName = 'OnyxProvider';

export default OnyxProvider;

export {
    withNetwork,
    withPersonalDetails,
    usePersonalDetails,
    withReportActionsDrafts,
    withCurrentDate,
    withBlockedFromConcierge,
    withBetas,
    NetworkContext,
    BetasContext,
    withReportCommentDrafts,
    withPreferredTheme,
    PreferredThemeContext,
};
