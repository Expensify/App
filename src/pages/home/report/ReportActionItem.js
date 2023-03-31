import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {
    useState, useRef, useEffect, memo, useCallback,
} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import IOUAction from '../../../components/ReportActionItem/IOUAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemCreated from './ReportActionItemCreated';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from './ContextMenu/ContextMenuActions';
import {withBlockedFromConcierge, withNetwork, withReportActionsDrafts} from '../../../components/OnyxProvider';
import RenameAction from '../../../components/ReportActionItem/RenameAction';
import InlineSystemMessage from '../../../components/InlineSystemMessage';
import styles from '../../../styles/styles';
import SelectionScraper from '../../../libs/SelectionScraper';
import * as User from '../../../libs/actions/User';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReportActions from '../../../libs/actions/ReportActions';
import reportPropTypes from '../../reportPropTypes';
import {ShowContextMenuContext} from '../../../components/ShowContextMenuContext';
import focusTextInputAfterAnimation from '../../../libs/focusTextInputAfterAnimation';
import ChronosOOOListActions from '../../../components/ReportActionItem/ChronosOOOListActions';
import ReportActionItemReactions from '../../../components/Reactions/ReportActionItemReactions';
import * as Report from '../../../libs/actions/Report';
import withLocalize from '../../../components/withLocalize';

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

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    draftMessage: '',
};

function ReportActionItem(props) {
    const [isContextMenuActive, setIsContextMenuActive] = useState(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    const previousDraftMessageRef = useRef('');
    const textInputRef = useRef();
    const popoverAnchorRef = useRef();

    useEffect(() => {
        if (previousDraftMessageRef.current || !props.draftMessage) {
            return;
        }

        // Only focus the input when user edits a message, skip it for existing drafts being edited of the report.
        // There is an animation when the comment is hidden and the edit form is shown, and there can be bugs on different mobile platforms
        // if the input is given focus in the middle of that animation which can prevent the keyboard from opening.
        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [props.draftMessage]);

    // We need to store the previous value of draftMessage because we use it in the above useEffect hook
    // to decide whether we should focus the text input
    useEffect(() => {
        previousDraftMessageRef.current = props.draftMessage;
    }, [props.draftMessage]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    }, [props.action.reportActionID]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = useCallback((event) => {
        // Block menu on the message being Edited
        if (props.draftMessage) {
            return;
        }

        setIsContextMenuActive(true);

        // Newline characters need to be removed here because getCurrentSelection() returns html mixed with newlines, and when
        // <br> tags are converted later to markdown, it creates duplicate newline characters. This means that when the content
        // is pasted, there are extra newlines in the content that we want to avoid.
        const selection = SelectionScraper.getCurrentSelection().replace(/<br>\n/g, '<br>');
        ReportActionContextMenu.showContextMenu(
            ContextMenuActions.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            popoverAnchorRef.current,
            props.report.reportID,
            props.action,
            props.draftMessage,
            undefined,
            toggleContextMenuFromActiveReportAction,
            ReportUtils.isArchivedRoom(props.report),
            ReportUtils.chatIncludesChronos(props.report),
        );
    }, [props.draftMessage, props.report, props.action, toggleContextMenuFromActiveReportAction]);

    const toggleReaction = useCallback((emoji) => {
        Report.toggleEmojiReaction(props.report.reportID, props.action, emoji);
    }, [props.report, props.action]);

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @returns {Object} child component(s)
     */
    function renderItemContent(hovered = false) {
        let children;
        if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
            children = (
                <IOUAction
                    chatReportID={props.report.reportID}
                    action={props.action}
                    isMostRecentIOUReportAction={props.isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                />
            );
        } else {
            const message = _.last(lodashGet(props.action, 'message', [{}]));
            const isAttachment = _.has(props.action, 'isAttachment')
                ? props.action.isAttachment
                : ReportUtils.isReportMessageAttachment(message);
            children = (
                <ShowContextMenuContext.Provider
                    value={{
                        anchor: popoverAnchorRef.current,
                        reportID: props.report.reportID,
                        action: props.action,
                        toggleContextMenuFromActiveReportAction,
                    }}
                >
                    {!props.draftMessage
                        ? (
                            <ReportActionItemMessage
                                action={props.action}
                                style={[
                                    (!props.displayAsGroup && isAttachment) ? styles.mt2 : undefined,
                                    _.contains(_.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), props.action.actionName) ? styles.colorMuted : undefined,
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
                                shouldDisableEmojiPicker={
                                    (ReportUtils.chatIncludesConcierge(props.report) && User.isBlockedFromConcierge(props.blockedFromConcierge))
                                    || ReportUtils.isArchivedRoom(props.report)
                                }
                            />
                        )}
                </ShowContextMenuContext.Provider>
            );
        }

        const reactions = _.get(props, ['action', 'message', 0, 'reactions'], []);
        const hasReactions = reactions.length > 0;

        return (
            <>
                {children}
                {hasReactions && (
                    <ReportActionItemReactions
                        reactions={reactions}
                        toggleReaction={toggleReaction}
                    />
                )}
            </>
        );
    }

    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return <ReportActionItemCreated reportID={props.report.reportID} />;
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return <RenameAction action={props.action} />;
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST) {
        return <ChronosOOOListActions action={props.action} reportID={props.report.reportID} />;
    }
    return (
        <PressableWithSecondaryInteraction
            pointerEvents={props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? 'none' : 'auto'}
            ref={popoverAnchorRef}
            onPressIn={() => props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContentMenu={!props.draftMessage}
            withoutFocusOnSecondaryInteraction
        >
            <Hoverable>
                {hovered => (
                    <View accessibilityLabel={props.translate('accessibilityHints.chatMessage')}>
                        {props.shouldDisplayNewMarker && (
                            <UnreadActionIndicator reportActionID={props.action.reportActionID} />
                        )}
                        <View
                            style={StyleUtils.getReportActionItemStyle(
                                hovered
                                || isContextMenuActive
                                || props.draftMessage,
                                (props.network.isOffline && props.action.isLoading) || props.action.error,
                            )}
                        >
                            <OfflineWithFeedback
                                onClose={() => {
                                    if (props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                                        ReportActions.deleteOptimisticReportAction(props.report.reportID, props.action.reportActionID);
                                    } else {
                                        ReportActions.clearReportActionErrors(props.report.reportID, props.action.reportActionID);
                                    }
                                }}
                                pendingAction={props.draftMessage ? null : props.action.pendingAction}
                                errors={props.action.errors}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU}
                            >
                                {!props.displayAsGroup
                                    ? (
                                        <ReportActionItemSingle action={props.action} showHeader={!props.draftMessage}>
                                            {renderItemContent(hovered || isContextMenuActive)}
                                        </ReportActionItemSingle>
                                    )
                                    : (
                                        <ReportActionItemGrouped>
                                            {renderItemContent(hovered || isContextMenuActive)}
                                        </ReportActionItemGrouped>
                                    )}
                            </OfflineWithFeedback>
                        </View>
                        <MiniReportActionContextMenu
                            reportID={props.report.reportID}
                            reportAction={props.action}
                            isArchivedRoom={ReportUtils.isArchivedRoom(props.report)}
                            displayAsGroup={props.displayAsGroup}
                            isVisible={
                                hovered
                                && !props.draftMessage
                            }
                            draftMessage={props.draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(props.report)}
                        />
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
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${props.report.reportID}_${props.action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
)(memo(ReportActionItem, (prevProps, nextProps) => (
    prevProps.displayAsGroup === nextProps.displayAsGroup
        && prevProps.draftMessage === nextProps.draftMessage
        && prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction
        && prevProps.hasOutstandingIOU === nextProps.hasOutstandingIOU
        && prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker
        && _.isEqual(prevProps.action, nextProps.action)
)));
