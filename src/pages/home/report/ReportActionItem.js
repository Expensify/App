import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useRef, useEffect, memo, useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import MoneyRequestAction from '../../../components/ReportActionItem/MoneyRequestAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemThread from './ReportActionItemThread';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from './ContextMenu/ContextMenuActions';
import {withBlockedFromConcierge, withNetwork, withPersonalDetails, withReportActionsDrafts} from '../../../components/OnyxProvider';
import RenameAction from '../../../components/ReportActionItem/RenameAction';
import InlineSystemMessage from '../../../components/InlineSystemMessage';
import styles from '../../../styles/styles';
import SelectionScraper from '../../../libs/SelectionScraper';
import focusTextInputAfterAnimation from '../../../libs/focusTextInputAfterAnimation';
import * as User from '../../../libs/actions/User';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReportActions from '../../../libs/actions/ReportActions';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportPropTypes from '../../reportPropTypes';
import {ShowContextMenuContext} from '../../../components/ShowContextMenuContext';
import ChronosOOOListActions from '../../../components/ReportActionItem/ChronosOOOListActions';
import ReportActionItemReactions from '../../../components/Reactions/ReportActionItemReactions';
import * as Report from '../../../libs/actions/Report';
import withLocalize from '../../../components/withLocalize';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Text from '../../../components/Text';
import DisplayNames from '../../../components/DisplayNames';
import personalDetailsPropType from '../../personalDetailsPropType';
import ReportPreview from '../../../components/ReportActionItem/ReportPreview';
import ReportActionItemDraft from './ReportActionItemDraft';
import TaskPreview from '../../../components/ReportActionItem/TaskPreview';
import TaskAction from '../../../components/ReportActionItem/TaskAction';
import Permissions from '../../../libs/Permissions';

const propTypes = {
    /** Report for this action */
    report: reportPropTypes.isRequired,

    /** All the data of the action item */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: PropTypes.bool.isRequired,

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar: PropTypes.bool,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /* Whether the option has an outstanding IOU */
    // eslint-disable-next-line react/no-unused-prop-types
    hasOutstandingIOU: PropTypes.bool,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    draftMessage: '',
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    personalDetails: {},
    shouldShowSubscriptAvatar: false,
    hasOutstandingIOU: false,
    betas: [],
};

function ReportActionItem(props) {
    const [isContextMenuActive, setIsContextMenuActive] = useState(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    const textInputRef = useRef();
    const popoverAnchorRef = useRef();

    const isDraftEmpty = !props.draftMessage;
    useEffect(() => {
        if (isDraftEmpty) {
            return;
        }

        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [isDraftEmpty]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    }, [props.action.reportActionID]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = useCallback(
        (event) => {
            // Block menu on the message being Edited or if the report action item has errors
            if (props.draftMessage || !_.isEmpty(props.action.errors)) {
                return;
            }

            setIsContextMenuActive(true);

            const selection = SelectionScraper.getCurrentSelection();
            ReportActionContextMenu.showContextMenu(
                ContextMenuActions.CONTEXT_MENU_TYPES.REPORT_ACTION,
                event,
                selection,
                popoverAnchorRef,
                props.report.reportID,
                props.action,
                props.draftMessage,
                () => {},
                toggleContextMenuFromActiveReportAction,
                ReportUtils.isArchivedRoom(props.report),
                ReportUtils.chatIncludesChronos(props.report),
                props.action.childReportID,
            );
        },
        [props.draftMessage, props.action, props.report, toggleContextMenuFromActiveReportAction],
    );

    const toggleReaction = useCallback(
        (emoji) => {
            Report.toggleEmojiReaction(props.report.reportID, props.action, emoji);
        },
        [props.report, props.action],
    );

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @returns {Object} child component(s)
     */
    const renderItemContent = (hovered = false) => {
        let children;
        const originalMessage = lodashGet(props.action, 'originalMessage', {});

        // IOUDetails only exists when we are sending money
        const isSendingMoney = originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails');

        // Show the IOUPreview for when request was created, bill was split or money was sent
        if (
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
            originalMessage &&
            // For the pay flow, we only want to show MoneyRequestAction when sending money. When paying, we display a regular system message
            (originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT || isSendingMoney)
        ) {
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = originalMessage.IOUReportID ? originalMessage.IOUReportID.toString() : '0';
            children = (
                <MoneyRequestAction
                    chatReportID={props.report.reportID}
                    requestReportID={iouReportID}
                    action={props.action}
                    isMostRecentIOUReportAction={props.isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={props.displayAsGroup ? [] : [styles.mt2]}
                />
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = (
                <ReportPreview
                    iouReportID={props.action.originalMessage.linkedReportID}
                    chatReportID={props.report.reportID}
                    action={props.action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                />
            );
        } else if (
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        ) {
            children = (
                <TaskAction
                    taskReportID={props.action.originalMessage.taskReportID.toString()}
                    actionName={props.action.actionName}
                    isHovered={hovered}
                />
            );
        } else if (ReportActionsUtils.isCreatedTaskReportAction(props.action)) {
            children = (
                <TaskPreview
                    taskReportID={props.action.originalMessage.taskReportID.toString()}
                    action={props.action}
                    isHovered={hovered}
                />
            );
        } else {
            const message = _.last(lodashGet(props.action, 'message', [{}]));
            const isAttachment = _.has(props.action, 'isAttachment') ? props.action.isAttachment : ReportUtils.isReportMessageAttachment(message);
            children = (
                <ShowContextMenuContext.Provider
                    value={{
                        anchor: popoverAnchorRef,
                        report: props.report,
                        action: props.action,
                        checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
                    }}
                >
                    {!props.draftMessage ? (
                        <ReportActionItemMessage
                            action={props.action}
                            style={[
                                !props.displayAsGroup && isAttachment ? styles.mt2 : undefined,
                                _.contains([..._.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), CONST.REPORT.ACTIONS.TYPE.IOU], props.action.actionName) ? styles.colorMuted : undefined,
                            ]}
                        />
                    ) : (
                        <ReportActionItemMessageEdit
                            action={props.action}
                            draftMessage={props.draftMessage}
                            reportID={props.report.reportID}
                            index={props.index}
                            ref={textInputRef}
                            report={props.report}
                            // Avoid defining within component due to an existing Onyx bug
                            preferredSkinTone={props.preferredSkinTone}
                            shouldDisableEmojiPicker={
                                (ReportUtils.chatIncludesConcierge(props.report) && User.isBlockedFromConcierge(props.blockedFromConcierge)) || ReportUtils.isArchivedRoom(props.report)
                            }
                        />
                    )}
                </ShowContextMenuContext.Provider>
            );
        }

        const reactions = _.get(props, ['action', 'message', 0, 'reactions'], []);
        const hasReactions = reactions.length > 0;
        const numberOfThreadReplies = _.get(props, ['action', 'childVisibleActionCount'], 0);
        const hasReplies = numberOfThreadReplies > 0;

        const shouldDisplayThreadReplies =
            hasReplies && props.action.childCommenterCount && Permissions.canUseThreads(props.betas) && !ReportUtils.isThreadFirstChat(props.action, props.report.reportID);
        const oldestFourEmails = lodashGet(props.action, 'childOldestFourEmails', '').split(',');

        return (
            <>
                {children}
                {hasReactions && (
                    <View style={props.draftMessage ? styles.chatItemReactionsDraftRight : {}}>
                        <ReportActionItemReactions
                            reportActionID={props.action.reportActionID}
                            reactions={reactions}
                            toggleReaction={toggleReaction}
                        />
                    </View>
                )}
                {shouldDisplayThreadReplies && (
                    <ReportActionItemThread
                        childReportID={`${props.action.childReportID}`}
                        numberOfReplies={numberOfThreadReplies}
                        mostRecentReply={`${props.action.childLastVisibleActionCreated}`}
                        isHovered={hovered}
                        icons={ReportUtils.getIconsForParticipants(oldestFourEmails, props.personalDetails)}
                    />
                )}
            </>
        );
    };

    /**
     * Get ReportActionItem with a proper wrapper
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @param {Boolean} isWhisper whether the ReportActionItem is a whisper
     * @returns {Object} report action item
     */
    const renderReportActionItem = (hovered, isWhisper) => {
        const content = renderItemContent(hovered || isContextMenuActive);

        if (props.draftMessage) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!props.displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={props.action}
                    showHeader={!props.draftMessage}
                    wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}
                    shouldShowSubscriptAvatar={props.shouldShowSubscriptAvatar}
                    report={props.report}
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}>{content}</ReportActionItemGrouped>;
    };

    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return <ReportActionItemCreated reportID={props.report.reportID} />;
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return <RenameAction action={props.action} />;
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST) {
        return (
            <ChronosOOOListActions
                action={props.action}
                reportID={props.report.reportID}
            />
        );
    }

    const hasErrors = !_.isEmpty(props.action.errors);
    const whisperedTo = lodashGet(props.action, 'whisperedTo', []);
    const isWhisper = whisperedTo.length > 0;
    const isMultipleParticipant = whisperedTo.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedTo);
    const whisperedToPersonalDetails = isWhisper ? _.filter(props.personalDetails, (details) => _.includes(whisperedTo, details.login)) : [];
    const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];
    return (
        <PressableWithSecondaryInteraction
            pointerEvents={props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? 'none' : 'auto'}
            ref={popoverAnchorRef}
            onPressIn={() => props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContextMenu={!props.draftMessage && !hasErrors}
            withoutFocusOnSecondaryInteraction
        >
            <Hoverable disabled={Boolean(props.draftMessage)}>
                {(hovered) => (
                    <View accessibilityLabel={props.translate('accessibilityHints.chatMessage')}>
                        {props.shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={props.action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={props.report.reportID}
                            reportAction={props.action}
                            isArchivedRoom={ReportUtils.isArchivedRoom(props.report)}
                            displayAsGroup={props.displayAsGroup}
                            isVisible={hovered && !props.draftMessage && !hasErrors}
                            draftMessage={props.draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(props.report)}
                        />
                        <View
                            style={StyleUtils.getReportActionItemStyle(
                                hovered || isWhisper || isContextMenuActive || props.draftMessage,
                                (props.network.isOffline && props.action.isLoading) || props.action.error,
                            )}
                        >
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearReportActionErrors(props.report.reportID, props.action)}
                                pendingAction={props.draftMessage ? null : props.action.pendingAction}
                                errors={props.action.errors}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(props.action)}
                            >
                                {isWhisper && (
                                    <View style={[styles.flexRow, styles.pl5, styles.pt2]}>
                                        <View style={[styles.pl6, styles.mr3]}>
                                            <Icon
                                                src={Expensicons.Eye}
                                                small
                                            />
                                        </View>
                                        <Text style={[styles.chatItemMessageHeaderTimestamp]}>
                                            {props.translate('reportActionContextMenu.onlyVisible')}
                                            &nbsp;
                                        </Text>
                                        <DisplayNames
                                            fullTitle={ReportUtils.getWhisperDisplayNames(whisperedTo)}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={[styles.chatItemMessageHeaderTimestamp]}
                                            shouldUseFullTitle={isWhisperOnlyVisibleByUser}
                                        />
                                    </View>
                                )}
                                {renderReportActionItem(hovered, isWhisper)}
                            </OfflineWithFeedback>
                        </View>
                    </View>
                )}
            </Hoverable>
            <View style={styles.reportActionSystemMessageContainer}>
                <InlineSystemMessage message={props.action.error} />
            </View>
        </PressableWithSecondaryInteraction>
    );
}

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withNetwork(),
    withPersonalDetails(),
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${props.report.reportID}_${props.action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(
    memo(
        ReportActionItem,
        (prevProps, nextProps) =>
            prevProps.displayAsGroup === nextProps.displayAsGroup &&
            prevProps.draftMessage === nextProps.draftMessage &&
            prevProps.isMostRecentIOUReportAction !== nextProps.isMostRecentIOUReportAction &&
            prevProps.hasOutstandingIOU === nextProps.hasOutstandingIOU &&
            prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
            !_.isEqual(prevProps.action, nextProps.action) &&
            lodashGet(prevProps.report, 'statusNum') === lodashGet(nextProps.report, 'statusNum') &&
            lodashGet(prevProps.report, 'stateNum') === lodashGet(nextProps.report, 'stateNum') &&
            prevProps.translate === nextProps.translate,
    ),
);
