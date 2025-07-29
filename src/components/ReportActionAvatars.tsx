import lodashSortBy from 'lodash/sortBy';
import React, {useMemo} from 'react';
import type {ColorValue, ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPreviewSenderID from '@hooks/useReportPreviewSenderID';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon} from '@libs/CardUtils';
import localeCompare from '@libs/LocaleCompare';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getReportActionAvatars, getUserDetailTooltipText, isChatReport} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, OnyxInputOrEntry, PersonalDetailsList, ReportAction} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import Icon from './Icon';
import {FallbackAvatar} from './Icon/Expensicons';
import {WorkspaceBuilding} from './Icon/WorkspaceDefaultAvatars';
import Text from './Text';
import Tooltip from './Tooltip';
import UserDetailsTooltip from './UserDetailsTooltip';

type SortingOptions = 'byID' | 'byName' | 'reverse';

/** Prop to identify if we should load avatars vertically instead of diagonally */
type HorizontalStacking =
    | Partial<{
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
      }>
    | boolean;

type ReportActionAvatarsProps = {
    horizontalStacking?: HorizontalStacking;

    /** IOU Report ID for single avatar */
    reportID?: string;

    /** IOU Report ID for single avatar */
    action?: OnyxEntry<ReportAction>;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: ViewStyle[];

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Whether to show the subscript avatar without margin */
    noRightMarginOnSubscriptContainer?: boolean;

    /** Account IDs to display avatars for, it overrides the reportID and action props */
    accountIDs?: number[];

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Style for Second Avatar */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Whether #focus mode is on */
    useMidSubscriptSizeForMultipleAvatars?: boolean;

    /** Whether avatars are displayed within a reportAction */
    isInReportAction?: boolean;

    /** Whether to show the tooltip text */
    shouldShowTooltip?: boolean;

    /** Subscript card feed to display instead of the second avatar */
    subscriptCardFeed?: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK;
};

type AvatarStyles = {
    singleAvatarStyle: ViewStyle & ImageStyle;
    secondAvatarStyles: ViewStyle & ImageStyle;
};

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.SMALL | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

type AvatarSizeToStylesMap = Record<AvatarSizeToStyles, AvatarStyles>;

const getIconDisplayName = (icon: IconType, personalDetails: OnyxInputOrEntry<PersonalDetailsList>) =>
    icon.id ? (personalDetails?.[icon.id]?.displayName ?? personalDetails?.[icon.id]?.login ?? '') : '';

function sortIconsByName(icons: IconType[], personalDetails: OnyxInputOrEntry<PersonalDetailsList>) {
    return icons.sort((first, second) => {
        // First sort by displayName/login
        const displayNameLoginOrder = localeCompare(getIconDisplayName(first, personalDetails), getIconDisplayName(second, personalDetails));
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        // Then fallback on accountID as the final sorting criteria.
        // This will ensure that the order of avatars with same login/displayName
        // stay consistent across all users and devices
        return Number(first?.id) - Number(second?.id);
    });
}

function ReportActionAvatars({
    reportID: potentialReportID,
    action: passedAction,
    accountIDs: unfilteredPassedAccountIDs = [],
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowTooltip = true,
    horizontalStacking,
    singleAvatarContainerStyle,
    subscriptAvatarBorderColor,
    noRightMarginOnSubscriptContainer = false,
    subscriptCardFeed,
    secondaryAvatarContainerStyle,
    useMidSubscriptSizeForMultipleAvatars = false,
    isInReportAction = false,
}: ReportActionAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();

    const passedAccountIDs = unfilteredPassedAccountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);

    const reportID =
        potentialReportID ??
        ([CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW].find((act) => act === passedAction?.actionName) ? passedAction?.childReportID : undefined);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});

    const [potentialChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const iouReport = isChatReport(report) && report?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM ? undefined : report;
    const chatReport = isChatReport(report) && report?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM ? report : potentialChatReport;
    const subscriptAvatarSize = size === CONST.AVATAR_SIZE.X_LARGE ? CONST.AVATAR_SIZE.HEADER : CONST.AVATAR_SIZE.SUBSCRIPT;

    const action = passedAction ?? (iouReport?.parentReportActionID ? getReportAction(chatReport?.reportID ?? iouReport?.chatReportID, iouReport?.parentReportActionID) : undefined);

    const reportPreviewSenderID = useReportPreviewSenderID({action, iouReport, chatReport});

    const {
        displayInRows: shouldDisplayAvatarsInRows = false,
        isHovered = false,
        isActive = false,
        isPressed = false,
        overlapDivider = 3,
        maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
        sort: sortAvatars = undefined,
        useCardBG: shouldUseCardBackground = false,
    } = typeof horizontalStacking === 'boolean' ? {} : (horizontalStacking ?? {});

    const shouldStackHorizontally = !!horizontalStacking;

    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const isReportArchived = useReportIsArchived(reportID);

    const {
        avatarType,
        icons: [primaryAvatar, secondaryAvatar],
        delegateAccountID,
        accountID,
    } = getReportActionAvatars({
        chatReport,
        iouReport,
        action,
        personalDetails,
        reportPreviewSenderID,
        policies,

        shouldStackHorizontally,
        isReportArchived,
        shouldUseCardFeed: !!subscriptCardFeed,
        shouldUseAccountIDs: passedAccountIDs.length > 0,
    });

    const {fallbackIcon} = personalDetails?.[accountID] ?? {};

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
                singleAvatarStyle: styles.singleAvatarLarge,
                secondAvatarStyles: styles.secondAvatarLarge,
            },
            [CONST.AVATAR_SIZE.DEFAULT]: {
                singleAvatarStyle: styles.singleAvatar,
                secondAvatarStyles: styles.secondAvatar,
            },
        }),
        [styles],
    );

    const sortedAvatars = useMemo(() => {
        const avatarsForAccountIDs: IconType[] = passedAccountIDs.map((id) => ({
            id,
            type: CONST.ICON_TYPE_AVATAR,
            source: personalDetails?.[id]?.avatar ?? FallbackAvatar,
            name: personalDetails?.[id]?.login ?? '',
        }));

        const multipleAvatars = avatarsForAccountIDs.length > 0 ? avatarsForAccountIDs : [primaryAvatar, secondaryAvatar];

        if (sortAvatars?.includes('byName')) {
            return sortIconsByName(multipleAvatars, personalDetails);
        }
        return sortAvatars?.includes('byID') ? lodashSortBy(multipleAvatars, (icon) => icon.id) : multipleAvatars;
    }, [passedAccountIDs, personalDetails, primaryAvatar, secondaryAvatar, sortAvatars]);

    const icons = sortAvatars?.includes('reverse') ? sortedAvatars.reverse() : sortedAvatars;

    const secondaryAvatarContainerStyles = secondaryAvatarContainerStyle ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    let avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);
    const {singleAvatarStyle, secondAvatarStyles} = useMemo(() => avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default, [size, avatarSizeToStylesMap]);

    const tooltipTexts = useMemo(() => (shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), icon.name)) : ['']), [shouldShowTooltip, icons]);

    const avatarSize = useMemo(() => {
        if (useMidSubscriptSizeForMultipleAvatars) {
            return CONST.AVATAR_SIZE.MID_SUBSCRIPT;
        }

        if (size === CONST.AVATAR_SIZE.LARGE) {
            return CONST.AVATAR_SIZE.MEDIUM;
        }

        if (size === CONST.AVATAR_SIZE.X_LARGE) {
            return CONST.AVATAR_SIZE.LARGE;
        }

        return CONST.AVATAR_SIZE.SMALLER;
    }, [useMidSubscriptSizeForMultipleAvatars, size]);

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

    if (avatarType === 'subscript') {
        const isSmall = size === CONST.AVATAR_SIZE.SMALL;
        const containerStyle = StyleUtils.getContainerStyles(size);

        return (
            <View
                style={[containerStyle, noRightMarginOnSubscriptContainer ? styles.mr0 : {}]}
                testID="ReportActionAvatars-Subscript"
            >
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={primaryAvatar}
                    fallbackUserDetails={{
                        displayName: primaryAvatar.name,
                    }}
                >
                    <View>
                        <Avatar
                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                            source={primaryAvatar.source}
                            size={size}
                            name={primaryAvatar.name}
                            avatarID={primaryAvatar.id}
                            type={primaryAvatar.type}
                            fallbackIcon={primaryAvatar.fallbackIcon}
                            testID="ReportActionAvatars-Subscript-MainAvatar"
                        />
                    </View>
                </UserDetailsTooltip>
                {!!secondaryAvatar && !subscriptCardFeed && (
                    <UserDetailsTooltip
                        shouldRender={shouldShowTooltip}
                        accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                        icon={secondaryAvatar}
                    >
                        <View
                            style={[size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, subscriptAvatarStyle]}
                            // Hover on overflowed part of icon will not work on Electron if dragArea is true
                            // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                            dataSet={{dragArea: false}}
                        >
                            <Avatar
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
                        // Hover on overflowed part of icon will not work on Electron if dragArea is true
                        // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                        dataSet={{dragArea: false}}
                    >
                        <Icon
                            src={getCardFeedIcon(subscriptCardFeed, illustrations)}
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

    if (avatarType === 'multiple') {
        if (!icons.length) {
            return null;
        }

        if (icons.length === 1 && !shouldStackHorizontally) {
            return (
                <UserDetailsTooltip
                    accountID={Number(icons.at(0)?.id)}
                    icon={icons.at(0)}
                    fallbackUserDetails={{
                        displayName: icons.at(0)?.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    <View style={avatarContainerStyles}>
                        <Avatar
                            source={icons.at(0)?.source}
                            size={size}
                            fill={icons.at(0)?.fill}
                            name={icons.at(0)?.name}
                            avatarID={icons.at(0)?.id}
                            type={icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                            fallbackIcon={icons.at(0)?.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-OneIcon"
                        />
                    </View>
                </UserDetailsTooltip>
            );
        }

        const oneAvatarSize = StyleUtils.getAvatarStyle(size);
        const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
        const overlapSize = oneAvatarSize.width / overlapDivider;
        if (shouldStackHorizontally) {
            // Height of one avatar + border space
            const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
            avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);
        }
        const useHugeBottomMargin = icons.length === 2 && size === CONST.AVATAR_SIZE.X_LARGE;

        return shouldStackHorizontally ? (
            avatarRows.map((avatars, rowIndex) => (
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
                                displayName: icon.name,
                            }}
                            shouldRender={shouldShowTooltip}
                        >
                            <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                                <Avatar
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
                                <View
                                    style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}
                                >
                                    <Text
                                        style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    >{`+${avatars.length - maxAvatarsInRow}`}</Text>
                                </View>
                            </View>
                        </Tooltip>
                    )}
                </View>
            ))
        ) : (
            <View style={[avatarContainerStyles, useHugeBottomMargin && styles.mb7]}>
                <View
                    style={[singleAvatarStyle, icons.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(0)?.type)]}
                    testID="ReportActionAvatars-MultipleAvatars"
                >
                    <UserDetailsTooltip
                        accountID={Number(icons.at(0)?.id)}
                        icon={icons.at(0)}
                        fallbackUserDetails={{
                            displayName: icons.at(0)?.name,
                        }}
                        shouldRender={shouldShowTooltip}
                    >
                        {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                        <View>
                            <Avatar
                                source={icons.at(0)?.source ?? WorkspaceBuilding}
                                size={avatarSize}
                                imageStyles={[singleAvatarStyle]}
                                name={icons.at(0)?.name}
                                type={icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                                avatarID={icons.at(0)?.id}
                                fallbackIcon={icons.at(0)?.fallbackIcon}
                                testID="ReportActionAvatars-MultipleAvatars-MainAvatar"
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
                                    displayName: icons.at(1)?.name,
                                }}
                                shouldRender={shouldShowTooltip}
                            >
                                <View>
                                    <Avatar
                                        source={icons.at(1)?.source ?? WorkspaceBuilding}
                                        size={avatarSize}
                                        imageStyles={[singleAvatarStyle]}
                                        name={icons.at(1)?.name}
                                        avatarID={icons.at(1)?.id}
                                        type={icons.at(1)?.type ?? CONST.ICON_TYPE_AVATAR}
                                        fallbackIcon={icons.at(1)?.fallbackIcon}
                                        testID="ReportActionAvatars-MultipleAvatars-SecondaryAvatar"
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

    return (
        <UserDetailsTooltip
            accountID={Number(delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={action?.delegateAccountID}
            icon={primaryAvatar}
        >
            <View>
                <Avatar
                    containerStyles={singleAvatarContainerStyle}
                    source={primaryAvatar.source}
                    type={primaryAvatar.type}
                    name={primaryAvatar.name}
                    avatarID={primaryAvatar.id}
                    size={size}
                    fallbackIcon={fallbackIcon}
                    testID="ReportActionAvatars-SingleAvatar"
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default ReportActionAvatars;
