import React from 'react';
import {
    Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {
    deleteReportComment,
} from '../../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';
import ReportActionContextMenu from './ReportActionContextMenu';
import ConfirmModal from '../../../../components/ConfirmModal';

const propTypes = {
    /** The report currently being looked at */
    setValue: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class PopoverReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reportID: 0,
            reportAction: {},
            isPopoverVisible: false,
            reportActionDraftMessage: '',
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
            selection: '',
        };
        this.onPopoverHide = () => {};
        this.contextMenuAchor = undefined;
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureContextMenuAnchorPosition = this.measureContextMenuAnchorPosition.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hideDeleteConfirmModal = this.hideDeleteConfirmModal.bind(this);
        this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
        this.contextMenuHidden = this.contextMenuHidden.bind(this);
        this.getContextMenuMeasuredLocation = this.getContextMenuMeasuredLocation.bind(this);
        this.isActionReportAction = this.isActionReportAction.bind(this);
    }

    componentDidMount() {
        this.props.setValue({
            showContextMenu: this.showContextMenu,
            hideContextMenu: this.hideContextMenu,
            isActionReportAction: this.isActionReportAction,
            showDeleteConfirmModal: this.showDeleteConfirmModal,
        });
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
     * @memberof ReportActionItem
     */
    getContextMenuMeasuredLocation() {
        return new Promise((res) => {
            if (this.contextMenuAchor) {
                this.contextMenuAchor.measureInWindow((x, y) => res({x, y}));
            } else {
                res({x: 0, y: 0});
            }
        });
    }

    isActionReportAction(actionId) {
        return this.state.reportAction.reportActionID === actionId;
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
     * @memberof ReportActionsView
     */
    showContextMenu(event, selection, contextMenuAnchor, reportID, reportAction, draftMessage) {
        const nativeEvent = event.nativeEvent || {};
        this.contextMenuAchor = contextMenuAnchor;
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
            });
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
                console.debug('render skipped');
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

    contextMenuHidden() {
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
        this.setState({isPopoverVisible: false});
    }

    /**
     * Used to calculate the Context Menu Dimensions
     *
     * @returns {JSX}
     * @memberof ReportActionItem
     */
    measureContent() {
        return (
            <ReportActionContextMenu
                isVisible
                selection={this.state.selection}
                reportID={this.state.reportID}
                reportAction={this.state.reportAction}
                hidePopover={this.hideContextMenu}
                showDeleteConfirmModal={this.showDeleteConfirmModal}
            />
        );
    }

    confirmDeleteAndHideModal() {
        deleteReportComment(this.state.reportID, this.state.reportAction);
        this.setState({isDeleteCommentConfirmModalVisible: false});
    }

    hideDeleteConfirmModal() {
        this.setState({isDeleteCommentConfirmModalVisible: false});
    }

    /**
     * Opens the Confirm delete action modal
     * @param {Number} reportID
     * @param {Object} reportAction
     * @memberof ReportActionsView
     */
    showDeleteConfirmModal(reportID, reportAction) {
        this.setState({reportID, reportAction, isDeleteCommentConfirmModalVisible: true});
    }

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideContextMenu}
                    onModalHide={this.contextMenuHidden}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    animationOutTiming={1}
                    measureContent={this.measureContent}
                    shouldSetModalVisibility={false}
                    fullscreen={false}
                >
                    <ReportActionContextMenu
                        isVisible
                        reportID={this.state.reportID}
                        reportAction={this.state.reportAction}
                        draftMessage={this.state.reportActionDraftMessage}
                        hidePopover={this.hideContextMenu}
                        showDeleteConfirmModal={this.showDeleteConfirmModal}
                    />
                </PopoverWithMeasuredContent>
                <ConfirmModal
                    title={this.props.translate('reportActionContextMenu.deleteComment')}
                    isVisible={this.state.isDeleteCommentConfirmModalVisible}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={this.hideDeleteConfirmModal}
                    prompt={this.props.translate('reportActionContextMenu.deleteConfirmation')}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                />
            </>
        );
    }
}

PopoverReportActionContextMenu.propTypes = propTypes;
PopoverReportActionContextMenu.defaultProps = defaultProps;

export default withLocalize(PopoverReportActionContextMenu);
