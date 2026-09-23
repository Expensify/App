import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

type AvatarLayout = Exclude<ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>, typeof CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE>;

type GetAvatarLayoutParams = {
    /** Pre-computed avatar icons. The second icon, when present, is the secondary/subscript avatar. */
    icons: Icon[];

    /** Requested layout. When omitted, a single avatar is rendered even if a secondary icon is present. */
    avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    /** When true and avatarType is MULTIPLE, resolves to MULTIPLE_HORIZONTAL instead of MULTIPLE_DIAGONAL */
    shouldStackHorizontally?: boolean;

    /** When true, a requested subscript layout resolves to SUBSCRIPT_CARD_FEED (a card-feed icon replaces the secondary avatar, which may be absent or nameless) */
    hasCardFeed?: boolean;

    /**
     * When true, a secondary icon only counts if it has a name, so a nameless one downgrades the layout to a single avatar.
     * Needed for icons built by `useReportActionAvatars`, which yields a placeholder secondary icon while the workspace loads.
     * Call sites working with pre-computed icons leave this off, because there a present secondary icon is always renderable.
     */
    shouldRequireSecondaryIconName?: boolean;
};

type AvatarLayoutResult = {
    /** Resolved layout primitive to render */
    layout: AvatarLayout;

    primaryIcon: Icon | undefined;

    /** The secondary avatar icon, when present */
    secondaryIcon: Icon | undefined;
};

/** Resolves the avatar layout primitive and primary/secondary icons from pre-computed icons and a requested layout type. */
function getAvatarLayout(params: GetAvatarLayoutParams & {icons: [Icon, ...Icon[]]}): AvatarLayoutResult & {primaryIcon: Icon};
function getAvatarLayout(params: GetAvatarLayoutParams): AvatarLayoutResult;
function getAvatarLayout({icons, avatarType, shouldStackHorizontally = false, hasCardFeed = false, shouldRequireSecondaryIconName = false}: GetAvatarLayoutParams): AvatarLayoutResult {
    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);
    let resolvedType = avatarType ?? CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE) {
        resolvedType = shouldStackHorizontally ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL : CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    }

    const hasRenderableSecondaryIcon = shouldRequireSecondaryIconName ? !!secondaryIcon?.name : !!secondaryIcon;

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT) {
        let subscriptLayout: AvatarLayout = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
        if (hasCardFeed) {
            subscriptLayout = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT_CARD_FEED;
        } else if (hasRenderableSecondaryIcon) {
            subscriptLayout = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
        }

        return {
            layout: subscriptLayout,
            primaryIcon,
            secondaryIcon,
        };
    }

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
        return {
            layout: hasRenderableSecondaryIcon ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
            primaryIcon,
            secondaryIcon,
        };
    }

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        return {
            layout: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL,
            primaryIcon,
            secondaryIcon,
        };
    }

    return {
        layout: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
        primaryIcon,
        secondaryIcon,
    };
}

export default getAvatarLayout;
