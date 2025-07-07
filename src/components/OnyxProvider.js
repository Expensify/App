"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSession = exports.useBlockedFromConcierge = exports.PreferredEmojiSkinToneContext = exports.PersonalDetailsContext = exports.useFrequentlyUsedEmojis = exports.useBetas = exports.PreferredThemeContext = exports.BetasContext = exports.usePersonalDetails = void 0;
var react_1 = require("react");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ComposeProviders_1 = require("./ComposeProviders");
var createOnyxContext_1 = require("./createOnyxContext");
// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
var _a = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST), PersonalDetailsProvider = _a[0], PersonalDetailsContext = _a[1], usePersonalDetails = _a[2];
exports.PersonalDetailsContext = PersonalDetailsContext;
exports.usePersonalDetails = usePersonalDetails;
var _b = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.NVP_BLOCKED_FROM_CONCIERGE), BlockedFromConciergeProvider = _b[0], useBlockedFromConcierge = _b[2];
exports.useBlockedFromConcierge = useBlockedFromConcierge;
var _c = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.BETAS), BetasProvider = _c[0], BetasContext = _c[1], useBetas = _c[2];
exports.BetasContext = BetasContext;
exports.useBetas = useBetas;
var ReportCommentDraftsProvider = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT)[0];
var _d = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.PREFERRED_THEME), PreferredThemeProvider = _d[0], PreferredThemeContext = _d[1];
exports.PreferredThemeContext = PreferredThemeContext;
var _e = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS), FrequentlyUsedEmojisProvider = _e[0], useFrequentlyUsedEmojis = _e[2];
exports.useFrequentlyUsedEmojis = useFrequentlyUsedEmojis;
var _f = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE), PreferredEmojiSkinToneProvider = _f[0], PreferredEmojiSkinToneContext = _f[1];
exports.PreferredEmojiSkinToneContext = PreferredEmojiSkinToneContext;
var _g = (0, createOnyxContext_1.default)(ONYXKEYS_1.default.SESSION), SessionProvider = _g[0], useSession = _g[2];
exports.useSession = useSession;
function OnyxProvider(props) {
    return (<ComposeProviders_1.default components={[
            PersonalDetailsProvider,
            BlockedFromConciergeProvider,
            BetasProvider,
            ReportCommentDraftsProvider,
            PreferredThemeProvider,
            FrequentlyUsedEmojisProvider,
            PreferredEmojiSkinToneProvider,
            SessionProvider,
        ]}>
            {props.children}
        </ComposeProviders_1.default>);
}
OnyxProvider.displayName = 'OnyxProvider';
exports.default = OnyxProvider;
