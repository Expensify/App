import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPreviewSenderID from '@hooks/useReportPreviewSenderID';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getReportActionAvatars, isChatReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, ReportAction} from '@src/types/onyx';
import type {HorizontalStacking} from './ReportActionAvatar';
import ReportActionAvatar from './ReportActionAvatar';

type ReportActionAvatarsProps = {
    horizontalStacking?: HorizontalStacking | boolean;

    /** IOU Report ID for single avatar */
    reportID?: string;

    /** IOU Report ID for single avatar */
    action?: OnyxEntry<ReportAction>;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: ViewStyle[];

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

    /** Whether to show the subscript avatar without margin */
    noRightMarginOnSubscriptContainer?: boolean;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Subscript card feed to display instead of the second avatar */
    subscriptCardFeed?: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK;
};

function ReportActionAvatars({
    reportID: potentialReportID,
    action: passedAction,
    accountIDs: passedAccountIDs = [],
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
    const accountIDs = passedAccountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);

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

    const action = passedAction ?? (iouReport?.parentReportActionID ? getReportAction(chatReport?.reportID ?? iouReport?.chatReportID, iouReport?.parentReportActionID) : undefined);

    const reportPreviewSenderID = useReportPreviewSenderID({action, iouReport, chatReport});

    const shouldStackHorizontally = !!horizontalStacking;
    const isHorizontalStackingAnObject = shouldStackHorizontally && typeof horizontalStacking !== 'boolean';
    const {isHovered = false} = isHorizontalStackingAnObject ? horizontalStacking : {};

    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const isReportArchived = useReportIsArchived(reportID);

    const {
        avatarType: notPreciseAvatarType,
        icons,
        delegateAccountID,
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
        accountIDs,
    });

    let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> = notPreciseAvatarType;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE && !icons.length) {
        return null;
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE) {
        avatarType = shouldStackHorizontally ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL : CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    }

    const [primaryAvatar, secondaryAvatar] = icons;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT) {
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                noRightMarginOnContainer={noRightMarginOnSubscriptContainer}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                subscriptCardFeed={subscriptCardFeed}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        return (
            <ReportActionAvatar.Multiple.Horizontal
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...(isHorizontalStackingAnObject ? horizontalStacking : {})}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                shouldShowTooltip={shouldShowTooltip}
                personalDetails={personalDetails}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && icons.length !== 1) {
        return (
            <ReportActionAvatar.Multiple.Diagonal
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                useMidSubscriptSize={useMidSubscriptSizeForMultipleAvatars}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                isHovered={isHovered}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            avatar={primaryAvatar}
            size={size}
            containerStyles={singleAvatarContainerStyle}
            shouldShowTooltip={shouldShowTooltip}
            accountID={Number(delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={action?.delegateAccountID}
            fallbackIcon={primaryAvatar.fallbackIcon}
        />
    );
}

export default ReportActionAvatars;
