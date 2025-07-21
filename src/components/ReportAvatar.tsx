import React from 'react';
import type {ColorValue, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPreviewSenderID from '@hooks/useReportPreviewSenderID';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import {
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getIcons,
    getPolicyName,
    getReportActionActorAccountID,
    getWorkspaceIcon,
    isChatReport,
    isIndividualInvoiceRoom,
    isInvoiceReport,
    isInvoiceRoom,
    isPolicyExpenseChat,
    isTripRoom,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import Avatar from './Avatar';
import Icon from './Icon';
import {FallbackAvatar} from './Icon/Expensicons';
import type {MultipleAvatarsProps} from './MultipleAvatars';
import MultipleAvatars from './MultipleAvatars';
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

type ReportAvatarProps = MultipleAvatarsProps & {
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
};

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
    const accountID = reportPreviewSenderID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const usePersonalDetailsAvatars = !iouReport && chatReport && (!action || action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);

    const ownerAccountID = iouReport?.ownerAccountID ?? action?.childOwnerAccountID;
    const isReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    const policyID = chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID ? iouReport?.policyID : chatReport?.policyID;
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
    ...multipleAvatarsProps
}: Omit<ReportAvatarProps, 'icons'>) {
    const {size = CONST.AVATAR_SIZE.DEFAULT, shouldShowTooltip = true} = multipleAvatarsProps;
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
    const accountID = reportPreviewSenderID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID;

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

    if (shouldShowSubscriptAvatar) {
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
    if (passedAccountIDs || (shouldDisplayAllActors && !reportPreviewSenderID)) {
        const icons = getAvatarsForAccountIDs(passedAccountIDs ?? [], personalDetails);

        return (
            <MultipleAvatars
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...multipleAvatarsProps}
                icons={icons.length > 0 ? icons : [primaryAvatar, secondaryAvatar]}
            />
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
