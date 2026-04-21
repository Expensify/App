import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {CardFeed} from '@src/types/onyx/CardFeeds';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {HorizontalStacking} from './ReportActionAvatar';
import ReportActionAvatar from './ReportActionAvatar';

type IconsAvatarProps = {
    icons: Icon[];

    /** Explicit avatar layout type; when provided, takes priority over derived layout */
    avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    /** Whether to use the subscript layout (alternative to explicit avatarType) */
    shouldShowSubscript?: boolean;

    /** Horizontal stacking configuration; truthy value forces horizontal layout */
    horizontalStacking?: HorizontalStacking | boolean;

    /** Card feed icon shown as subscript; forces subscript layout */
    subscriptCardFeed?: CardFeed;

    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    shouldShowTooltip?: boolean;

    isInReportAction?: boolean;

    fallbackDisplayName?: string;

    useProfileNavigationWrapper?: boolean;

    reportID?: string;

    singleAvatarContainerStyle?: ViewStyle[];

    /** Account ID for the delegate tooltip on the single avatar */
    delegateAccountID?: number;

    /** Account ID shown in the tooltip when a delegate is active */
    delegateTooltipAccountID?: number;

    subscriptAvatarBorderColor?: ColorValue;

    noRightMarginOnSubscriptContainer?: boolean;

    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    useMidSubscriptSize?: boolean;
};

/**
 * Unified presentational dispatcher that selects the correct ReportActionAvatar
 * primitive (Single, Subscript, Diagonal, or Horizontal) based on the provided
 * icons and layout hints. This component contains NO data-fetching hooks.
 */
function IconsAvatar({
    icons,
    avatarType: explicitAvatarType,
    shouldShowSubscript = false,
    horizontalStacking,
    subscriptCardFeed,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowTooltip = true,
    isInReportAction = false,
    fallbackDisplayName,
    useProfileNavigationWrapper,
    reportID,
    singleAvatarContainerStyle,
    delegateAccountID,
    delegateTooltipAccountID,
    subscriptAvatarBorderColor,
    noRightMarginOnSubscriptContainer = false,
    secondaryAvatarContainerStyle,
    useMidSubscriptSize = false,
}: IconsAvatarProps) {
    const [primaryAvatar, secondaryAvatar] = icons;

    if (!primaryAvatar) {
        return null;
    }

    const shouldStackHorizontally = !!horizontalStacking;
    const isHorizontalStackingAnObject = shouldStackHorizontally && typeof horizontalStacking !== 'boolean';
    const {isHovered = false} = isHorizontalStackingAnObject ? horizontalStacking : {};

    const layout = resolveLayout({
        icons,
        explicitAvatarType,
        shouldShowSubscript,
        shouldStackHorizontally,
        subscriptCardFeed,
    });

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && (!!secondaryAvatar?.name || !!subscriptCardFeed)) {
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar ?? primaryAvatar}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                noRightMarginOnContainer={noRightMarginOnSubscriptContainer}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                subscriptCardFeed={subscriptCardFeed}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                fallbackDisplayName={fallbackDisplayName}
                reportID={reportID}
            />
        );
    }

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        return (
            <ReportActionAvatar.Multiple.Horizontal
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...(isHorizontalStackingAnObject ? horizontalStacking : {})}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                shouldShowTooltip={shouldShowTooltip}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                fallbackDisplayName={fallbackDisplayName}
                reportID={reportID}
            />
        );
    }

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && !!secondaryAvatar?.name) {
        return (
            <ReportActionAvatar.Multiple.Diagonal
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                useMidSubscriptSize={useMidSubscriptSize}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                isHovered={isHovered}
                fallbackDisplayName={fallbackDisplayName}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                reportID={reportID}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            avatar={primaryAvatar}
            size={size}
            containerStyles={shouldStackHorizontally ? [] : singleAvatarContainerStyle}
            shouldShowTooltip={shouldShowTooltip}
            accountID={delegateTooltipAccountID ?? Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={delegateAccountID}
            fallbackIcon={primaryAvatar.fallbackIcon}
            fallbackDisplayName={fallbackDisplayName}
            useProfileNavigationWrapper={useProfileNavigationWrapper}
            reportID={reportID}
        />
    );
}

function resolveLayout({
    icons,
    explicitAvatarType,
    shouldShowSubscript,
    shouldStackHorizontally,
    subscriptCardFeed,
}: {
    icons: Icon[];
    explicitAvatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;
    shouldShowSubscript: boolean;
    shouldStackHorizontally: boolean;
    subscriptCardFeed?: CardFeed;
}): ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> {
    if (subscriptCardFeed) {
        return CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    }

    if (shouldStackHorizontally) {
        return CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL;
    }

    if (explicitAvatarType && explicitAvatarType !== CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE) {
        return explicitAvatarType;
    }

    if (explicitAvatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE) {
        return CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    }

    if (icons.length < 2) {
        return CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
    }

    if (shouldShowSubscript) {
        return CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    }

    return CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
}

IconsAvatar.displayName = 'IconsAvatar';

export default IconsAvatar;
export type {IconsAvatarProps};
