import lodashSortBy from 'lodash/sortBy';
import React, {useMemo} from 'react';
import type {ColorValue, ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {UpperCaseCharacters} from 'type-fest/source/internal';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {WorkspaceBuilding} from '@components/Icon/WorkspaceDefaultAvatars';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon} from '@libs/CardUtils';
import {getUserDetailTooltipText, sortIconsByName} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

type SortingOptions = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type HorizontalStacking = Partial<{
    /** Prop to identify if we should display avatars in rows */
    displayInRows: boolean;

    /** Whether the avatars are hovered */
    isHovered: boolean;

    /** Whether the avatars are active */
    isActive: boolean;

    /** Whether the avatars are in an element being pressed */
    isPressed: boolean;

    /** Prop to limit the amount of avatars displayed horizontally */
    overlapDivider: number;

    /** Prop to limit the amount of avatars displayed horizontally */
    maxAvatarsInRow: number;

    /** Whether avatars are displayed with the highlighted background color instead of the app background color. This is primarily the case for IOU previews. */
    useCardBG: boolean;

    /** Prop to sort the avatars */
    sort: SortingOptions | SortingOptions[];
}>;

type AvatarStyles = {
    singleAvatarStyle: ViewStyle & ImageStyle;
    secondAvatarStyles: ViewStyle & ImageStyle;
};

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.SMALL | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

type AvatarSizeToStylesMap = Record<AvatarSizeToStyles, AvatarStyles>;

function ProfileAvatar(props: Parameters<typeof Avatar>[0] & {useProfileNavigationWrapper?: boolean; reportID?: string}) {
    const {translate} = useLocalize();
    const {avatarID, useProfileNavigationWrapper, type, name, reportID} = props;

    if (!useProfileNavigationWrapper) {
        return (
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            <Avatar {...{...props, useProfileNavigationWrapper: undefined}} />
        );
    }

    const isWorkspace = type === CONST.ICON_TYPE_WORKSPACE;
    const firstLetter = (name?.at(0) ?? 'A').toUpperCase() as UpperCaseCharacters;

    const onPress = () => {
        if (isWorkspace) {
            if (reportID) {
                Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(reportID, String(avatarID)));
                return;
            }
            return Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(String(avatarID), firstLetter));
        }
        return Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(Number(avatarID), Navigation.getActiveRoute()));
    };

    return (
        <PressableWithoutFocus
            onPress={onPress}
            accessibilityLabel={translate(isWorkspace ? 'common.workspaces' : 'common.profile')}
            accessibilityRole={CONST.ROLE.BUTTON}
        >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Avatar {...{...props, useProfileNavigationWrapper: undefined}} />
        </PressableWithoutFocus>
    );
}

function ReportActionAvatarSingle({
    avatar,
    size,
    containerStyles,
    shouldShowTooltip,
    delegateAccountID,
    accountID,
    fallbackIcon,
    isInReportAction,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: {
    avatar: IconType | undefined;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    containerStyles?: StyleProp<ViewStyle>;
    shouldShowTooltip: boolean;
    accountID: number;
    delegateAccountID?: number;
    fallbackIcon?: AvatarSource;
    isInReportAction?: boolean;
    useProfileNavigationWrapper?: boolean;
    fallbackDisplayName?: string;
    reportID?: string;
}) {
    const StyleUtils = useStyleUtils();
    const avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={avatar}
            fallbackUserDetails={{
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: fallbackDisplayName || avatar?.name,
            }}
            shouldRender={shouldShowTooltip}
        >
            <View>
                <ProfileAvatar
                    useProfileNavigationWrapper={useProfileNavigationWrapper}
                    containerStyles={containerStyles ?? avatarContainerStyles}
                    source={avatar?.source}
                    type={avatar?.type ?? CONST.ICON_TYPE_AVATAR}
                    name={avatar?.name}
                    avatarID={avatar?.id}
                    size={size}
                    fill={avatar?.fill}
                    fallbackIcon={fallbackIcon}
                    testID="ReportActionAvatars-SingleAvatar"
                    reportID={reportID}
                />
            </View>
        </UserDetailsTooltip>
    );
}

function ReportActionAvatarSubscript({
    primaryAvatar,
    secondaryAvatar,
    size,
    shouldShowTooltip,
    noRightMarginOnContainer,
    subscriptAvatarBorderColor,
    subscriptCardFeed,
    fallbackDisplayName,
    useProfileNavigationWrapper,
    reportID,
}: {
    primaryAvatar: IconType;
    secondaryAvatar: IconType;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    shouldShowTooltip: boolean;
    noRightMarginOnContainer?: boolean;
    subscriptAvatarBorderColor?: ColorValue;
    subscriptCardFeed?: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK;
    fallbackDisplayName?: string;
    useProfileNavigationWrapper?: boolean;
    reportID?: string;
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const isSmall = size === CONST.AVATAR_SIZE.SMALL;
    const containerStyle = StyleUtils.getContainerStyles(size);

    const subscriptAvatarStyle = useMemo(() => {
        if (size === CONST.AVATAR_SIZE.SMALL) {
            return styles.secondAvatarSubscriptCompact;
        }

        if (size === CONST.AVATAR_SIZE.SMALL_NORMAL) {
            return styles.secondAvatarSubscriptSmallNormal;
        }

        if (size === CONST.AVATAR_SIZE.X_LARGE) {
            return styles.secondAvatarSubscriptXLarge;
        }

        return styles.secondAvatarSubscript;
    }, [size, styles]);

    const subscriptAvatarSize = size === CONST.AVATAR_SIZE.X_LARGE ? CONST.AVATAR_SIZE.HEADER : CONST.AVATAR_SIZE.SUBSCRIPT;

    return (
        <View
            style={[containerStyle, noRightMarginOnContainer ? styles.mr0 : {}]}
            testID="ReportActionAvatars-Subscript"
        >
            <UserDetailsTooltip
                shouldRender={shouldShowTooltip}
                accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                icon={primaryAvatar}
                fallbackUserDetails={{
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    displayName: fallbackDisplayName || primaryAvatar.name,
                }}
            >
                <View>
                    <ProfileAvatar
                        useProfileNavigationWrapper={useProfileNavigationWrapper}
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={primaryAvatar.source}
                        size={size}
                        name={primaryAvatar.name}
                        avatarID={primaryAvatar.id}
                        type={primaryAvatar.type}
                        fallbackIcon={primaryAvatar.fallbackIcon}
                        testID="ReportActionAvatars-Subscript-MainAvatar"
                        reportID={reportID}
                    />
                </View>
            </UserDetailsTooltip>
            {!!secondaryAvatar && !subscriptCardFeed && (
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={secondaryAvatar}
                >
                    <View style={[size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, subscriptAvatarStyle]}>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            iconAdditionalStyles={[
                                StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize),
                                StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor ?? theme.componentBG),
                            ]}
                            source={secondaryAvatar.source}
                            size={isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize}
                            fill={secondaryAvatar.fill}
                            name={secondaryAvatar.name}
                            avatarID={secondaryAvatar.id}
                            type={secondaryAvatar.type}
                            fallbackIcon={secondaryAvatar.fallbackIcon}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
            )}
            {!!subscriptCardFeed && (
                <View
                    style={[
                        size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {},
                        // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor || theme.sidebar),
                        StyleUtils.getAvatarSubscriptIconContainerStyle(variables.cardAvatarWidth, variables.cardAvatarHeight),
                        styles.dFlex,
                        styles.justifyContentCenter,
                    ]}
                >
                    <Icon
                        src={getCardFeedIcon(subscriptCardFeed, illustrations, companyCardFeedIcons)}
                        width={variables.cardAvatarWidth}
                        height={variables.cardAvatarHeight}
                        additionalStyles={styles.alignSelfCenter}
                        testID="ReportActionAvatars-Subscript-CardIcon"
                    />
                </View>
            )}
        </View>
    );
}

function ReportActionAvatarMultipleHorizontal({
    isHovered = false,
    isActive = false,
    isPressed = false,
    maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
    displayInRows: shouldDisplayAvatarsInRows = false,
    useCardBG: shouldUseCardBackground = false,
    overlapDivider = 3,
    size,
    shouldShowTooltip,
    icons: unsortedIcons,
    isInReportAction,
    sort: sortAvatars,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: HorizontalStacking & {
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    shouldShowTooltip: boolean;
    icons: IconType[];
    isInReportAction: boolean;
    fallbackDisplayName?: string;
    useProfileNavigationWrapper?: boolean;
    reportID?: string;
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {localeCompare, formatPhoneNumber} = useLocalize();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });

    const oneAvatarSize = StyleUtils.getAvatarStyle(size);
    const overlapSize = oneAvatarSize.width / overlapDivider;
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
    const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
    const avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);

    const icons = useMemo(() => {
        let avatars: IconType[] = unsortedIcons;

        if (sortAvatars?.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME)) {
            avatars = sortIconsByName(unsortedIcons, personalDetails, localeCompare);
        } else if (sortAvatars?.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.ID)) {
            avatars = lodashSortBy(unsortedIcons, (icon) => icon.id);
        }

        return sortAvatars?.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE) ? avatars.reverse() : avatars;
    }, [unsortedIcons, personalDetails, sortAvatars, localeCompare]);

    const avatarRows = useMemo(() => {
        // If we're not displaying avatars in rows or the number of icons is less than or equal to the max avatars in a row, return a single row
        if (!shouldDisplayAvatarsInRows || icons.length <= maxAvatarsInRow) {
            return [icons];
        }

        // Calculate the size of each row
        const rowSize = Math.min(Math.ceil(icons.length / 2), maxAvatarsInRow);

        // Slice the icons array into two rows
        const firstRow = icons.slice(0, rowSize);
        const secondRow = icons.slice(rowSize);

        // Update the state with the two rows as an array
        return [firstRow, secondRow];
    }, [icons, maxAvatarsInRow, shouldDisplayAvatarsInRows]);

    const tooltipTexts = useMemo(
        () => (shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name)) : ['']),
        [shouldShowTooltip, icons, formatPhoneNumber],
    );

    return avatarRows.map((avatars, rowIndex) => (
        <View
            style={avatarContainerStyles}
            /* eslint-disable-next-line react/no-array-index-key */
            key={`avatarRow-${rowIndex}`}
            testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Row"
        >
            {[...avatars].splice(0, maxAvatarsInRow).map((icon, index) => (
                <UserDetailsTooltip
                    key={`stackedAvatars-${icon.id}`}
                    accountID={Number(icon.id)}
                    icon={icon}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || icon.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            iconAdditionalStyles={[
                                StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                    theme,
                                    isHovered,
                                    isPressed,
                                    isInReportAction,
                                    shouldUseCardBackground,
                                    isActive,
                                }),
                                StyleUtils.getAvatarBorderWidth(size),
                            ]}
                            source={icon.source ?? WorkspaceBuilding}
                            size={size}
                            name={icon.name}
                            avatarID={icon.id}
                            type={icon.type}
                            fallbackIcon={icon.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Avatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
            ))}
            {avatars.length > maxAvatarsInRow && (
                <Tooltip
                    // We only want to cap tooltips to only 10 users or so since some reports have hundreds of users, causing performance to degrade.
                    text={tooltipTexts.slice(avatarRows.length * maxAvatarsInRow - 1, avatarRows.length * maxAvatarsInRow + 9).join(', ')}
                    shouldRender={shouldShowTooltip}
                >
                    <View
                        testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-LimitReached"
                        style={[
                            styles.alignItemsCenter,
                            styles.justifyContentCenter,
                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                theme,
                                isHovered,
                                isPressed,
                                isInReportAction,
                                shouldUseCardBackground,
                            }),

                            // Set overlay background color with RGBA value so that the text will not inherit opacity
                            StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity),
                            StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                            icons.at(3)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(3)?.type),
                        ]}
                    >
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}>
                            <Text
                                style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >{`+${avatars.length - maxAvatarsInRow}`}</Text>
                        </View>
                    </View>
                </Tooltip>
            )}
        </View>
    ));
}

function ReportActionAvatarMultipleDiagonal({
    size,
    shouldShowTooltip,
    icons,
    isInReportAction,
    useMidSubscriptSize,
    secondaryAvatarContainerStyle,
    isHovered = false,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: {
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    shouldShowTooltip: boolean;
    icons: IconType[];
    isInReportAction: boolean;
    useMidSubscriptSize: boolean;
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;
    isHovered?: boolean;
    useProfileNavigationWrapper?: boolean;
    fallbackDisplayName?: string;
    reportID?: string;
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber} = useLocalize();

    const tooltipTexts = useMemo(
        () => (shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name)) : ['']),
        [shouldShowTooltip, icons, formatPhoneNumber],
    );
    const removeRightMargin = icons.length === 2 && size === CONST.AVATAR_SIZE.X_LARGE;
    const avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);

    const avatarSizeToStylesMap: AvatarSizeToStylesMap = useMemo(
        () => ({
            [CONST.AVATAR_SIZE.SMALL]: {
                singleAvatarStyle: styles.singleAvatarSmall,
                secondAvatarStyles: styles.secondAvatarSmall,
            },
            [CONST.AVATAR_SIZE.LARGE]: {
                singleAvatarStyle: styles.singleAvatarMedium,
                secondAvatarStyles: styles.secondAvatarMedium,
            },
            [CONST.AVATAR_SIZE.X_LARGE]: {
                singleAvatarStyle: styles.singleAvatarMediumLarge,
                secondAvatarStyles: styles.secondAvatarMediumLarge,
            },
            [CONST.AVATAR_SIZE.DEFAULT]: {
                singleAvatarStyle: styles.singleAvatar,
                secondAvatarStyles: styles.secondAvatar,
            },
        }),
        [styles],
    );

    const avatarSize = useMemo(() => {
        if (useMidSubscriptSize) {
            return CONST.AVATAR_SIZE.MID_SUBSCRIPT;
        }

        if (size === CONST.AVATAR_SIZE.LARGE) {
            return CONST.AVATAR_SIZE.MEDIUM;
        }

        if (size === CONST.AVATAR_SIZE.X_LARGE) {
            return CONST.AVATAR_SIZE.MEDIUM_LARGE;
        }

        return CONST.AVATAR_SIZE.SMALLER;
    }, [useMidSubscriptSize, size]);

    const {singleAvatarStyle, secondAvatarStyles} = useMemo(() => avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default, [size, avatarSizeToStylesMap]);
    const secondaryAvatarContainerStyles = secondaryAvatarContainerStyle ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    return (
        <View style={[avatarContainerStyles, removeRightMargin && styles.mr0]}>
            <View
                style={[singleAvatarStyle, icons.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(0)?.type)]}
                testID="ReportActionAvatars-MultipleAvatars"
            >
                <UserDetailsTooltip
                    accountID={Number(icons.at(0)?.id)}
                    icon={icons.at(0)}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || icons.at(0)?.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                    <View>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            source={icons.at(0)?.source ?? WorkspaceBuilding}
                            size={avatarSize}
                            imageStyles={[singleAvatarStyle]}
                            name={icons.at(0)?.name}
                            type={icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                            avatarID={icons.at(0)?.id}
                            fallbackIcon={icons.at(0)?.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-MainAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
                <View
                    style={[
                        secondAvatarStyles,
                        secondaryAvatarContainerStyles,
                        icons.at(1)?.type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons.at(1)?.type) : {},
                    ]}
                >
                    {icons.length === 2 ? (
                        <UserDetailsTooltip
                            accountID={Number(icons.at(1)?.id)}
                            icon={icons.at(1)}
                            fallbackUserDetails={{
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                displayName: fallbackDisplayName || icons.at(1)?.name,
                            }}
                            shouldRender={shouldShowTooltip}
                        >
                            <View>
                                <ProfileAvatar
                                    useProfileNavigationWrapper={useProfileNavigationWrapper}
                                    source={icons.at(1)?.source ?? WorkspaceBuilding}
                                    size={avatarSize}
                                    imageStyles={[singleAvatarStyle]}
                                    name={icons.at(1)?.name}
                                    avatarID={icons.at(1)?.id}
                                    type={icons.at(1)?.type ?? CONST.ICON_TYPE_AVATAR}
                                    fallbackIcon={icons.at(1)?.fallbackIcon}
                                    testID="ReportActionAvatars-MultipleAvatars-SecondaryAvatar"
                                    reportID={reportID}
                                />
                            </View>
                        </UserDetailsTooltip>
                    ) : (
                        <Tooltip
                            text={tooltipTexts.slice(1).join(', ')}
                            shouldRender={shouldShowTooltip}
                        >
                            <View
                                style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}
                                testID="ReportActionAvatars-MultipleAvatars-LimitReached"
                            >
                                <Text
                                    style={[styles.userSelectNone, size === CONST.AVATAR_SIZE.SMALL ? styles.avatarInnerTextSmall : styles.avatarInnerText]}
                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                >
                                    {`+${icons.length - 1}`}
                                </Text>
                            </View>
                        </Tooltip>
                    )}
                </View>
            </View>
        </View>
    );
}

/**
 * This component should not be used outside ReportActionAvatars; its sole purpose is to render the ReportActionAvatars UI.
 * To render user avatars, use ReportActionAvatars.
 */
export default {
    Single: ReportActionAvatarSingle,
    Subscript: ReportActionAvatarSubscript,
    Multiple: {
        Diagonal: ReportActionAvatarMultipleDiagonal,
        Horizontal: ReportActionAvatarMultipleHorizontal,
    },
};

export type {HorizontalStacking};
