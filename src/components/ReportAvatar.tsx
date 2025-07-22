import lodashSortBy from 'lodash/sortBy';
import React, {useMemo} from 'react';
import type {ColorValue, ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPreviewSenderID from '@hooks/useReportPreviewSenderID';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import {getReportAction} from '@libs/ReportActionsUtils';
import {
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getIcons,
    getPolicyName,
    getReportActionActorAccountID,
    getUserDetailTooltipText,
    getWorkspaceIcon,
    isChatReport,
    isIndividualInvoiceRoom,
    isInvoiceReport,
    isInvoiceRoom,
    isPolicyExpenseChat,
    isTripRoom,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import Avatar from './Avatar';
import Icon from './Icon';
import {FallbackAvatar} from './Icon/Expensicons';
import Text from './Text';
import Tooltip from './Tooltip';
import UserDetailsTooltip from './UserDetailsTooltip';

type SubIcon = {
    /** Avatar source to display */
    source: IconAsset;

    /** Width of the icon */
    width?: number;

    /** Height of the icon */
    height?: number;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill?: string;
};

type ReportAvatarProps = {
    /** IOU Report ID for single avatar */
    reportID?: string;

    /** IOU Report ID for single avatar */
    action?: OnyxEntry<ReportAction>;

    /** Single avatar size */
    singleAvatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: ViewStyle[];

    /** Border color for the subscript avatar */
    subscriptBorderColor?: ColorValue;

    /** Whether to show the subscript avatar without margin */
    subscriptNoMargin?: boolean;

    /** Subscript icon to display */
    subIcon?: SubIcon;

    /** A fallback main avatar icon */
    subscriptFallbackIcon?: IconType;

    /** Size of the secondary avatar */
    subscriptAvatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    accountIDs?: number[];

    reverseAvatars?: boolean;

    convertSubscriptToMultiple?: boolean;

    sortAvatarsByID?: boolean;

    sortAvatarsByName?: boolean;

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Style for Second Avatar */
    secondAvatarStyle?: StyleProp<ViewStyle>;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIconForMultipleAvatars?: AvatarSource;

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally?: boolean;

    /** Prop to identify if we should display avatars in rows */
    shouldDisplayAvatarsInRows?: boolean;

    /** Whether the avatars are hovered */
    isHovered?: boolean;

    /** Whether the avatars are active */
    isActive?: boolean;

    /** Whether the avatars are in an element being pressed */
    isPressed?: boolean;

    /** Whether #focus mode is on */
    isFocusMode?: boolean;

    /** Whether avatars are displayed within a reportAction */
    isInReportAction?: boolean;

    /** Whether to show the tooltip text */
    shouldShowTooltip?: boolean;

    /** Whether avatars are displayed with the highlighted background color instead of the app background color. This is primarily the case for IOU previews. */
    shouldUseCardBackground?: boolean;

    /** Prop to limit the amount of avatars displayed horizontally */
    maxAvatarsInRow?: number;

    /** Prop to limit the amount of avatars displayed horizontally */
    overlapDivider?: number;
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
    // const accountIDsWithDisplayName: Array<[number, string]> = [];

    // for (const accountID of accountIDs) {
    //     const displayNameLogin = personalDetails?.[accountID]?.displayName ? personalDetails?.[accountID]?.displayName : personalDetails?.[accountID]?.login;
    //     accountIDsWithDisplayName.push([accountID, displayNameLogin ?? '']);
    // }

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

function getPrimaryAndSecondaryAvatar({
    iouReport,
    action,
    chatReport,
    personalDetails,
    policies,
    reportPreviewSenderID,
}: {
    iouReport: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
    chatReport: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policies: OnyxCollection<Policy>;
    reportPreviewSenderID: number | undefined;
}) {
    const delegatePersonalDetails = action?.delegateAccountID ? personalDetails?.[action?.delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, chatReport, delegatePersonalDetails);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = reportPreviewSenderID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);

    const usePersonalDetailsAvatars = !iouReport && chatReport && (!action || action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);

    const ownerAccountID = iouReport?.ownerAccountID ?? action?.childOwnerAccountID;
    const isReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    const policyID = chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID ? (iouReport?.policyID ?? chatReport?.policyID) : chatReport?.policyID;
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    const invoiceReceiverPolicy =
        chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${chatReport.invoiceReceiver.policyID}`] : undefined;

    const {avatar, fallbackIcon} = personalDetails?.[accountID] ?? {};

    const isATripRoom = isTripRoom(chatReport);
    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const displayAllActors = isReportPreviewAction && !isATripRoom && !isPolicyExpenseChat(chatReport) && !reportPreviewSenderID;
    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);
    const isWorkspaceActor = isAInvoiceReport || (isPolicyExpenseChat(chatReport) && (!actorAccountID || displayAllActors));

    const defaultDisplayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails}) ?? '';

    const defaultAvatar = {
        source: avatar ?? FallbackAvatar,
        id: accountID,
        name: defaultDisplayName,
        type: CONST.ICON_TYPE_AVATAR,
        fill: undefined,
        fallbackIcon,
    };

    const defaultSecondaryAvatar = {
        name: '',
        source: '',
        type: CONST.ICON_TYPE_AVATAR,
        id: 0,
        fill: undefined,
        fallbackIcon,
    };

    const getPrimaryAvatar = () => {
        if (isWorkspaceActor) {
            return {
                ...defaultAvatar,
                name: getPolicyName({report: chatReport, policy}),
                type: CONST.ICON_TYPE_WORKSPACE,
                source: getWorkspaceIcon(chatReport, policy).source,
                id: chatReport?.policyID,
            };
        }

        if (delegatePersonalDetails) {
            return {
                ...defaultAvatar,
                name: delegatePersonalDetails?.displayName ?? '',
                source: delegatePersonalDetails?.avatar ?? FallbackAvatar,
                id: delegatePersonalDetails?.accountID,
            };
        }

        if (isReportPreviewAction && isATripRoom) {
            return {
                ...defaultAvatar,
                name: chatReport?.reportName ?? '',
                source: personalDetails?.[ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.avatar ?? FallbackAvatar,
                id: ownerAccountID,
            };
        }

        return defaultAvatar;
    };

    const getSecondaryAvatar = () => {
        // If this is a report preview, display names and avatars of both people involved
        if (displayAllActors) {
            const secondaryAccountId = ownerAccountID === actorAccountID || isAInvoiceReport ? actorAccountID : ownerAccountID;
            const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? FallbackAvatar;
            const secondaryDisplayName = getDisplayNameForParticipant({accountID: secondaryAccountId});
            const secondaryPolicyAvatar = invoiceReceiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(invoiceReceiverPolicy?.name);
            const isWorkspaceInvoice = isInvoiceRoom(chatReport) && !isIndividualInvoiceRoom(chatReport);

            return isWorkspaceInvoice
                ? {
                      source: secondaryPolicyAvatar,
                      type: CONST.ICON_TYPE_WORKSPACE,
                      name: invoiceReceiverPolicy?.name,
                      id: invoiceReceiverPolicy?.id,
                  }
                : {
                      source: secondaryUserAvatar,
                      type: CONST.ICON_TYPE_AVATAR,
                      name: secondaryDisplayName ?? '',
                      id: secondaryAccountId,
                  };
        }

        if (!isWorkspaceActor) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarIconIndex = chatReport?.isOwnPolicyExpenseChat || isPolicyExpenseChat(chatReport) ? 0 : 1;
            const reportIcons = getIcons(chatReport, personalDetails, undefined, undefined, undefined, policy);

            return reportIcons.at(avatarIconIndex) ?? defaultSecondaryAvatar;
        }

        if (isInvoiceReport(iouReport)) {
            const secondaryAccountId = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
            const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? FallbackAvatar;
            const secondaryDisplayName = getDisplayNameForParticipant({accountID: secondaryAccountId});

            return {
                source: secondaryUserAvatar,
                type: CONST.ICON_TYPE_AVATAR,
                name: secondaryDisplayName,
                id: secondaryAccountId,
            };
        }

        return defaultSecondaryAvatar;
    };

    const icons = getIcons(chatReport ?? iouReport, personalDetails);

    const primaryAvatar = (usePersonalDetailsAvatars ? icons.at(0) : getPrimaryAvatar()) ?? defaultAvatar;
    const secondaryAvatar = (usePersonalDetailsAvatars ? icons.at(1) : getSecondaryAvatar()) ?? defaultSecondaryAvatar;

    return [primaryAvatar, secondaryAvatar];
}

function ReportAvatar({
    reportID,
    singleAvatarContainerStyle,
    singleAvatarSize,
    subscriptBorderColor,
    subscriptNoMargin = false,
    subIcon,
    subscriptFallbackIcon,
    subscriptAvatarSize = CONST.AVATAR_SIZE.SUBSCRIPT,
    accountIDs: passedAccountIDs,
    action: passedAction,
    reverseAvatars,
    convertSubscriptToMultiple,
    sortAvatarsByID,
    sortAvatarsByName,
    fallbackIconForMultipleAvatars,
    size = CONST.AVATAR_SIZE.DEFAULT,
    secondAvatarStyle: secondAvatarStyleProp,
    shouldStackHorizontally = false,
    shouldDisplayAvatarsInRows = false,
    isHovered = false,
    isActive = false,
    isPressed = false,
    isFocusMode = false,
    isInReportAction = false,
    shouldShowTooltip = true,
    shouldUseCardBackground = false,
    maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
    overlapDivider = 3,
}: Omit<ReportAvatarProps, 'icons'>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});

    const [potentialChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const iouReport = isChatReport(report) ? undefined : report;
    const chatReport = isChatReport(report) ? report : potentialChatReport;

    const action = passedAction ?? (iouReport?.parentReportActionID ? getReportAction(chatReport?.reportID ?? iouReport?.chatReportID, iouReport?.parentReportActionID) : undefined);

    const reportPreviewSenderID = useReportPreviewSenderID({action, iouReport, chatReport});

    const delegatePersonalDetails = action?.delegateAccountID ? personalDetails?.[action?.delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, chatReport, delegatePersonalDetails);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = reportPreviewSenderID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);

    const isReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    const {fallbackIcon} = personalDetails?.[accountID] ?? {};

    const isATripRoom = isTripRoom(chatReport);
    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const shouldDisplayAllActors = isReportPreviewAction && !isATripRoom && !isPolicyExpenseChat(chatReport) && !reportPreviewSenderID;
    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);
    const isWorkspaceActor = isAInvoiceReport || (isPolicyExpenseChat(chatReport) && (!actorAccountID || shouldDisplayAllActors));

    const [primaryAvatar, secondaryAvatar] = getPrimaryAndSecondaryAvatar({
        chatReport,
        iouReport,
        action,
        personalDetails,
        reportPreviewSenderID,
        policies,
    });

    const isReportArchived = useReportIsArchived(reportID);
    const shouldShowSubscriptAvatar = shouldReportShowSubscript(report, isReportArchived);

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
            [CONST.AVATAR_SIZE.DEFAULT]: {
                singleAvatarStyle: styles.singleAvatar,
                secondAvatarStyles: styles.secondAvatar,
            },
        }),
        [styles],
    );

    const avatarsForAccountIDs: IconType[] = (passedAccountIDs ?? []).map((id) => ({
        id,
        type: CONST.ICON_TYPE_AVATAR,
        source: personalDetails?.[id]?.avatar ?? FallbackAvatar,
        name: personalDetails?.[id]?.login ?? '',
    }));

    const multipleAvatars = avatarsForAccountIDs.length > 0 ? avatarsForAccountIDs : [primaryAvatar, secondaryAvatar];
    const sortedAvatars = (() => {
        if (sortAvatarsByName) {
            return sortIconsByName(multipleAvatars, personalDetails);
        }
        return sortAvatarsByID ? lodashSortBy(multipleAvatars, (icon) => icon.id) : multipleAvatars;
    })();
    const icons = reverseAvatars ? sortedAvatars.reverse() : sortedAvatars;

    const secondAvatarStyle = secondAvatarStyleProp ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    let avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);
    const {singleAvatarStyle, secondAvatarStyles} = useMemo(() => avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default, [size, avatarSizeToStylesMap]);

    const tooltipTexts = useMemo(() => (shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), icon.name)) : ['']), [shouldShowTooltip, icons]);

    const avatarSize = useMemo(() => {
        if (isFocusMode) {
            return CONST.AVATAR_SIZE.MID_SUBSCRIPT;
        }

        if (size === CONST.AVATAR_SIZE.LARGE) {
            return CONST.AVATAR_SIZE.MEDIUM;
        }

        return CONST.AVATAR_SIZE.SMALLER;
    }, [isFocusMode, size]);

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

    if (shouldShowSubscriptAvatar && !shouldStackHorizontally) {
        const isSmall = size === CONST.AVATAR_SIZE.SMALL;
        const subscriptStyle = size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.secondAvatarSubscriptSmallNormal : styles.secondAvatarSubscript;
        const containerStyle = StyleUtils.getContainerStyles(size);

        const mainAvatar = primaryAvatar ?? subscriptFallbackIcon;

        return (
            <View
                style={[containerStyle, subscriptNoMargin ? styles.mr0 : {}]}
                testID="SubscriptAvatar"
            >
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(mainAvatar?.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={mainAvatar}
                    fallbackUserDetails={{
                        displayName: mainAvatar?.name,
                    }}
                >
                    <View>
                        <Avatar
                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                            source={mainAvatar?.source}
                            size={size}
                            name={mainAvatar?.name}
                            avatarID={mainAvatar?.id}
                            type={mainAvatar?.type}
                            fallbackIcon={mainAvatar?.fallbackIcon}
                        />
                    </View>
                </UserDetailsTooltip>
                {!!secondaryAvatar && (
                    <UserDetailsTooltip
                        shouldRender={shouldShowTooltip}
                        accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                        icon={secondaryAvatar}
                    >
                        <View
                            style={[size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, isSmall ? styles.secondAvatarSubscriptCompact : subscriptStyle]}
                            // Hover on overflowed part of icon will not work on Electron if dragArea is true
                            // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                            dataSet={{dragArea: false}}
                        >
                            <Avatar
                                iconAdditionalStyles={[
                                    StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize),
                                    StyleUtils.getBorderColorStyle(subscriptBorderColor ?? theme.componentBG),
                                ]}
                                source={secondaryAvatar.source}
                                size={isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize}
                                fill={secondaryAvatar.fill}
                                name={secondaryAvatar.name}
                                avatarID={secondaryAvatar.id}
                                type={secondaryAvatar.type}
                                fallbackIcon={secondaryAvatar.fallbackIcon}
                            />
                        </View>
                    </UserDetailsTooltip>
                )}
                {!!subIcon && (
                    <View
                        style={[
                            size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {},
                            // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            StyleUtils.getBorderColorStyle(subscriptBorderColor || theme.sidebar),
                            StyleUtils.getAvatarSubscriptIconContainerStyle(subIcon.width, subIcon.height),
                            styles.dFlex,
                            styles.justifyContentCenter,
                        ]}
                        // Hover on overflowed part of icon will not work on Electron if dragArea is true
                        // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                        dataSet={{dragArea: false}}
                    >
                        <Icon
                            src={subIcon.source}
                            width={subIcon.width}
                            height={subIcon.height}
                            additionalStyles={styles.alignSelfCenter}
                            fill={subIcon.fill}
                        />
                    </View>
                )}
            </View>
        );
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (passedAccountIDs || (shouldDisplayAllActors && !reportPreviewSenderID) || (convertSubscriptToMultiple && shouldShowSubscriptAvatar && !reportPreviewSenderID)) {
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

        return shouldStackHorizontally ? (
            avatarRows.map((avatars, rowIndex) => (
                <View
                    style={avatarContainerStyles}
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={`avatarRow-${rowIndex}`}
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
                                    source={icon.source ?? fallbackIconForMultipleAvatars}
                                    size={size}
                                    name={icon.name}
                                    avatarID={icon.id}
                                    type={icon.type}
                                    fallbackIcon={icon.fallbackIcon}
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
            <View style={avatarContainerStyles}>
                <View style={[singleAvatarStyle, icons.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(0)?.type)]}>
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
                                source={icons.at(0)?.source ?? fallbackIconForMultipleAvatars}
                                size={avatarSize}
                                imageStyles={[singleAvatarStyle]}
                                name={icons.at(0)?.name}
                                type={icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                                avatarID={icons.at(0)?.id}
                                fallbackIcon={icons.at(0)?.fallbackIcon}
                            />
                        </View>
                    </UserDetailsTooltip>
                    <View style={[secondAvatarStyles, secondAvatarStyle, icons.at(1)?.type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons.at(1)?.type) : {}]}>
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
                                        source={icons.at(1)?.source ?? fallbackIconForMultipleAvatars}
                                        size={avatarSize}
                                        imageStyles={[singleAvatarStyle]}
                                        name={icons.at(1)?.name}
                                        avatarID={icons.at(1)?.id}
                                        type={icons.at(1)?.type ?? CONST.ICON_TYPE_AVATAR}
                                        fallbackIcon={icons.at(1)?.fallbackIcon}
                                    />
                                </View>
                            </UserDetailsTooltip>
                        ) : (
                            <Tooltip
                                text={tooltipTexts.slice(1).join(', ')}
                                shouldRender={shouldShowTooltip}
                            >
                                <View style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}>
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
            accountID={Number(delegatePersonalDetails && !isWorkspaceActor ? actorAccountID : (primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID))}
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
                    size={singleAvatarSize ?? size}
                    fallbackIcon={fallbackIcon}
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default ReportAvatar;
export {getPrimaryAndSecondaryAvatar};
