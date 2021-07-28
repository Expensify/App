import React from 'react';
import {
    Dimensions,
} from 'react-native';
import _ from 'underscore';
import {
    deleteReportComment,
} from '../../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import ConfirmModal from '../../../../components/ConfirmModal';

const propTypes = {
    ...withLocalizePropTypes,
};

class PopoverReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reportID: 0,
            reportAction: {},
            selection: '',
            reportActionDraftMessage: '',
            isPopoverVisible: false,
            isDeleteCommentConfirmModalVisible: false,
            cursorRelativePosition: {
                horizontal: 0,
                vertical: 0,
            },

            // The horizontal and vertical position (relative to the screen) where the popover will display.
            popoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
        };
        this.onPopoverHide = () => {};
        this.contextMenuAnchor = undefined;
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureContextMenuAnchorPosition = this.measureContextMenuAnchorPosition.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hideDeleteModal = this.hideDeleteModal.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.runAfterContextMenuHide = this.runAfterContextMenuHide.bind(this);
        this.getContextMenuMeasuredLocation = this.getContextMenuMeasuredLocation.bind(this);
        this.isActiveReportAction = this.isActiveReportAction.bind(this);
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.measureContextMenuAnchorPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition
            || this.state.isDeleteCommentConfirmModalVisible !== nextState.isDeleteCommentConfirmModalVisible;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.measureContextMenuAnchorPosition);
    }

    /**
     * Get the Context menu anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    getContextMenuMeasuredLocation() {
        return new Promise((resolve) => {
            if (this.contextMenuAnchor) {
                this.contextMenuAnchor.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });
    }

    /**
     * Whether Context Menu is active for the Report Action.
     *
     * @param {Number|String} actionID
     * @return {Boolean}
     */
    isActiveReportAction(actionID) {
        return this.state.reportAction.reportActionID === actionID;
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {string} [selection] - A copy text.
     * @param {Element} contextMenuAnchor - popoverAnchor
     * @param {Number} reportID - Active Report Id
     * @param {Object} reportAction - ReportAction for ContextMenu
     * @param {String} draftMessage - ReportAction Draftmessage
     * @param {Function} [onShow] - Run a callback when Menu is shown
     * @param {Function} [onHide] - Run a callback when Menu is hidden
     */
    showContextMenu(
        event,
        selection,
        contextMenuAnchor,
        reportID,
        reportAction,
        draftMessage,
        onShow = () => {},
        onHide = () => {},
    ) {
        const nativeEvent = event.nativeEvent || {};
        this.contextMenuAnchor = contextMenuAnchor;
        this.onPopoverHide = onHide;
        this.getContextMenuMeasuredLocation().then(({x, y}) => {
            this.setState({
                cursorRelativePosition: {
                    horizontal: nativeEvent.pageX - x,
                    vertical: nativeEvent.pageY - y,
                },
                popoverAnchorPosition: {
                    horizontal: nativeEvent.pageX,
                    vertical: nativeEvent.pageY,
                },
                reportID,
                reportAction,
                selection,
                isPopoverVisible: true,
                reportActionDraftMessage: draftMessage,
            }, onShow);
        });
    }

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action context menu.
     */
    measureContextMenuAnchorPosition() {
        if (!this.state.isPopoverVisible) {
            return;
        }
        this.getContextMenuMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }
            this.setState(prev => ({
                popoverAnchorPosition: {
                    horizontal: prev.cursorRelativePosition.horizontal + x,
                    vertical: prev.cursorRelativePosition.vertical + y,
                },
            }));
        });
    }

    /**
     * After Popover hides, call the registered onPopoverHide callback and reset it
     */
    runAndResetOnPopoverHide() {
        this.onPopoverHide();

        // After we have called the action, reset it.
        this.onPopoverHide = () => {};
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param {Function} onHideCallback Callback to be called after popover is completely hidden
     */
    hideContextMenu(onHideCallback) {
        if (_.isFunction(onHideCallback)) {
            this.onPopoverHide = onHideCallback;
        }
        this.setState({
            reportID: 0,
            reportAction: {},
            selection: '',
            reportActionDraftMessage: '',
            isPopoverVisible: false,
        });
    }

    /**
     * Used to calculate the Context Menu Dimensions
     *
     * @returns {JSX}
     */
    measureContent() {
        return (
            <BaseReportActionContextMenu
                isVisible
                selection={this.state.selection}
                reportID={this.state.reportID}
                reportAction={this.state.reportAction}
            />
        );
    }

    confirmDeleteAndHideModal() {
        deleteReportComment(this.state.reportID, this.state.reportAction);
        this.setState({isDeleteCommentConfirmModalVisible: false});
    }

    hideDeleteModal() {
        this.setState({
            reportID: 0,
            reportAction: {},
            isDeleteCommentConfirmModalVisible: false,
        });
    }

    /**
     * Opens the Confirm delete action modal
     * @param {Number} reportID
     * @param {Object} reportAction
     */
    showDeleteModal(reportID, reportAction) {
        this.setState({reportID, reportAction, isDeleteCommentConfirmModalVisible: true});
    }

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideContextMenu}
                    onModalHide={this.runAfterContextMenuHide}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    animationOutTiming={1}
                    measureContent={this.measureContent}
                    shouldSetModalVisibility={false}
                    fullscreen={false}
                >
                    <BaseReportActionContextMenu
                        isVisible
                        reportID={this.state.reportID}
                        reportAction={this.state.reportAction}
                        draftMessage={this.state.reportActionDraftMessage}
                    />
                </PopoverWithMeasuredContent>
                <ConfirmModal
                    title={this.props.translate('reportActionContextMenu.deleteComment')}
                    isVisible={this.state.isDeleteCommentConfirmModalVisible}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={this.hideDeleteModal}
                    prompt={this.props.translate('reportActionContextMenu.deleteConfirmation')}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                />
            </>
        );
    }
}

PopoverReportActionContextMenu.propTypes = propTypes;
PopoverReportActionContextMenu.displayName = 'PopoverReportActionContextMenu';

export default withLocalize(PopoverReportActionContextMenu);
