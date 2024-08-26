import React from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposeProviders from './ComposeProviders';
import createOnyxContext from './createOnyxContext';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider, NetworkContext] = createOnyxContext(ONYXKEYS.NETWORK);
const [, PersonalDetailsProvider, , usePersonalDetails] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS_LIST);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [, BlockedFromConciergeProvider, , useBlockedFromConcierge] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [, BetasProvider, BetasContext, useBetas] = createOnyxContext(ONYXKEYS.BETAS);
const [, ReportCommentDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
const [, PreferredThemeProvider, PreferredThemeContext] = createOnyxContext(ONYXKEYS.PREFERRED_THEME);
const [, FrequentlyUsedEmojisProvider, , useFrequentlyUsedEmojis] = createOnyxContext(ONYXKEYS.FREQUENTLY_USED_EMOJIS);
const [, PreferredEmojiSkinToneProvider, PreferredEmojiSkinToneContext] = createOnyxContext(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
const [, SessionProvider, , useSession] = createOnyxContext(ONYXKEYS.SESSION);

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
                CurrentDateProvider,
                BlockedFromConciergeProvider,
                BetasProvider,
                ReportCommentDraftsProvider,
                PreferredThemeProvider,
                FrequentlyUsedEmojisProvider,
                PreferredEmojiSkinToneProvider,
                SessionProvider,
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
    usePersonalDetails,
    withCurrentDate,
    NetworkContext,
    BetasContext,
    PreferredThemeContext,
    useBetas,
    useFrequentlyUsedEmojis,
    PreferredEmojiSkinToneContext,
    useBlockedFromConcierge,
    useSession,
};
