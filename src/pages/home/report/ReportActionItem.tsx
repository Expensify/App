import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import {AttachmentContext} from '@components/AttachmentContext';
import Button from '@components/Button';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import InlineSystemMessage from '@components/InlineSystemMessage';
import KYCWall from '@components/KYCWall';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useBlockedFromConcierge, usePersonalDetails} from '@components/OnyxProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import ChronosOOOListActions from '@components/ReportActionItem/ChronosOOOListActions';
import ExportIntegration from '@components/ReportActionItem/ExportIntegration';
import IssueCardMessage from '@components/ReportActionItem/IssueCardMessage';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import ReportPreview from '@components/ReportActionItem/ReportPreview';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import * as BankAccounts from '@userActions/BankAccounts';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as Member from '@userActions/Policy/Member';
import * as Report from '@userActions/Report';
import * as ReportActions from '@userActions/ReportActions';
import * as Session from '@userActions/Session';
import * as Transaction from '@userActions/Transaction';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {RestrictedReadOnlyContextMenuActions} from './ContextMenu/ContextMenuActions';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import {hideContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import ReportActionItemContentCreated from './ReportActionItemContentCreated';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemThread from './ReportActionItemThread';
import ReportAttachmentsContext from './ReportAttachmentsContext';
import type { PureReportActionItemProps } from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';
// type ReportActionItemProps = {
//     /** Report for this action */
//     report: OnyxEntry<OnyxTypes.Report>;

//     /** The transaction thread report associated with the report for this action, if any */
//     transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;

//     /** Array of report actions for the report for this action */
//     // eslint-disable-next-line react/no-unused-prop-types
//     reportActions: OnyxTypes.ReportAction[];

//     /** Report action belonging to the report's parent */
//     parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

//     /** The transaction thread report's parentReportAction */
//     /** It's used by withOnyx HOC */
//     // eslint-disable-next-line react/no-unused-prop-types
//     parentReportActionForTransactionThread?: OnyxEntry<OnyxTypes.ReportAction>;

//     /** All the data of the action item */
//     action: OnyxTypes.ReportAction;

//     /** Should the comment have the appearance of being grouped with the previous comment? */
//     displayAsGroup: boolean;

//     /** Is this the most recent IOU Action? */
//     isMostRecentIOUReportAction: boolean;

//     /** Should we display the new marker on top of the comment? */
//     shouldDisplayNewMarker: boolean;

//     /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
//     shouldShowSubscriptAvatar?: boolean;

//     /** Position index of the report action in the overall report FlatList view */
//     index: number;

//     /** Flag to show, hide the thread divider line */
//     shouldHideThreadDividerLine?: boolean;

//     linkedReportActionID?: string;

//     /** Callback to be called on onPress */
//     onPress?: () => void;

//     /** If this is the first visible report action */
//     isFirstVisibleReportAction: boolean;

//     /** IF the thread divider line will be used */
//     shouldUseThreadDividerLine?: boolean;

//     hideThreadReplies?: boolean;

//     /** Whether context menu should be displayed */
//     shouldDisplayContextMenu?: boolean;
// };

function ReportActionItem({
    action,
    report,
    ...props
    // transactionThreadReport,
    // linkedReportActionID,
    // displayAsGroup,
    // index,
    // isMostRecentIOUReportAction,
    // parentReportAction,
    // shouldDisplayNewMarker,
    // shouldHideThreadDividerLine = false,
    // shouldShowSubscriptAvatar = false,
    // onPress = undefined,
    // isFirstVisibleReportAction = false,
    // shouldUseThreadDividerLine = false,
    // hideThreadReplies = false,
    // shouldDisplayContextMenu = true,
    // parentReportActionForTransactionThread,
    // reportActions,
}: PureReportActionItemProps) {
    const reportID = report?.reportID ?? '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const originalReportID = useMemo(() => ReportUtils.getOriginalReportID(reportID, action) || '-1', [reportID, action]);
    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {
        selector: (draftMessagesForReport) => {
            const matchingDraftMessage = draftMessagesForReport?.[action.reportActionID];
            return typeof matchingDraftMessage === 'string' ? matchingDraftMessage : matchingDraftMessage?.message;
        },
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${ReportActionsUtils.getIOUReportIDFromReportActionPreview(action) ?? -1}`);
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [linkedTransactionRouteError] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${ReportActionsUtils.isMoneyRequestAction(action) ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID ?? -1 : -1}`,
        { selector: (transaction) => transaction?.errorFields?.route ?? null },
    );

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- This is needed to prevent the app from crashing when the app is using imported state.
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID || '-1'}`);

    const [isUserValidated] = useOnyx(ONYXKEYS.USER, { selector: (user) => !!user?.validated });
    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID || -1}`);
    

    return <PureReportActionItem
        {...props}
        action={action}
        report={report}

        draftMessage={draftMessage}
        iouReport={iouReport}
        emojiReactions={emojiReactions}
        userWallet={userWallet}
        linkedTransactionRouteError={linkedTransactionRouteError}
        reportNameValuePairs={reportNameValuePairs}
        isUserValidated={isUserValidated}
        parentReport={parentReport}


    />

}

export default ReportActionItem;
