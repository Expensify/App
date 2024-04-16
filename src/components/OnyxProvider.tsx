import React from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposeProviders from './ComposeProviders';
import createOnyxContext from './createOnyxContext';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider, NetworkContext] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider, , usePersonalDetails] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS_LIST);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [withReportActionsDrafts, ReportActionsDraftsProvider, , useReportActionsDrafts] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
const [withBlockedFromConcierge, BlockedFromConciergeProvider, , useBlockedFromConcierge] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [withBetas, BetasProvider, BetasContext, useBetas] = createOnyxContext(ONYXKEYS.BETAS);
const [withReportCommentDrafts, ReportCommentDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
const [withPreferredTheme, PreferredThemeProvider, PreferredThemeContext] = createOnyxContext(ONYXKEYS.PREFERRED_THEME);
const [withFrequentlyUsedEmojis, FrequentlyUsedEmojisProvider, , useFrequentlyUsedEmojis] = createOnyxContext(ONYXKEYS.FREQUENTLY_USED_EMOJIS);
const [withPreferredEmojiSkinTone, PreferredEmojiSkinToneProvider, PreferredEmojiSkinToneContext] = createOnyxContext(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
const [, SessionProvider, , useSession] = createOnyxContext(ONYXKEYS.SESSION);
const [, AccountProvider, , useAccount] = createOnyxContext(ONYXKEYS.ACCOUNT);

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
                FrequentlyUsedEmojisProvider,
                PreferredEmojiSkinToneProvider,
                SessionProvider,
                AccountProvider,
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
    useBetas,
    withFrequentlyUsedEmojis,
    useFrequentlyUsedEmojis,
    withPreferredEmojiSkinTone,
    PreferredEmojiSkinToneContext,
    useBlockedFromConcierge,
    useReportActionsDrafts,
    useSession,
    useAccount,
};
