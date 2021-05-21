import _ from 'underscore';
import React, {Component} from 'react';
import {Dimensions, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import ReportActionPropTypes from './ReportActionPropTypes';
import {
    getReportActionItemStyle,
    getMiniReportActionContextMenuWrapperStyle,
} from '../../../styles/getReportActionItemStyles';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionContextMenu from './ReportActionContextMenu';
import ReportActionItemIOUAction from '../../../components/ReportActionItemIOUAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';

const propTypes = {
    /** The ID of the report this action is on. */
    reportID: PropTypes.number.isRequired,

    /** All the data of the action item */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: PropTypes.bool,

    /** Should we display the new indicator on top of the comment? */
    shouldDisplayNewIndicator: PropTypes.bool.isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /* Onyx Props */

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /** Runs when the view enclosing the chat message lays out indicating it has rendered */
    onLayout: PropTypes.func.isRequired,
};

const defaultProps = {
    draftMessage: '',
    hasOutstandingIOU: false,
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPopoverVisible: false,
            cursorPosition: {
                horizontal: 0,
                vertical: 0,
            },

            // The horizontal and vertical position (relative to the screen) where the popover will display.
            popoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
        };

        this.popoverAnchor = null;
        this.showPopover = this.showPopover.bind(this);
        this.hidePopover = this.hidePopover.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.selection = '';
        this.measureContextMenuAnchorPosition = this.measureContextMenuAnchorPosition.bind(this);
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.measureContextMenuAnchorPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition
            || this.props.displayAsGroup !== nextProps.displayAsGroup
            || this.props.draftMessage !== nextProps.draftMessage
            || this.props.isMostRecentIOUReportAction !== nextProps.isMostRecentIOUReportAction
            || this.props.hasOutstandingIOU !== nextProps.hasOutstandingIOU
            || this.props.shouldDisplayNewIndicator !== nextProps.shouldDisplayNewIndicator
            || !_.isEqual(this.props.action, nextProps.action);
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
    getMeasureLocation() {
        return new Promise((res) => {
            if (this.popoverAnchor) {
                this.popoverAnchor.measureInWindow((x, y) => res({x, y}));
            } else {
                res({x: 0, y: 0});
            }
        });
    }

    /**
     * Save the location of a native press event & set the Initial Context menu anchor coordinates
     *
     * @param {Object} nativeEvent
     * @returns {Promise}
     */
    capturePressLocation(nativeEvent) {
        return this.getMeasureLocation().then(({x, y}) => {
            this.setState({
                cursorPosition: {
                    horizontal: nativeEvent.pageX - x,
                    vertical: nativeEvent.pageY - y,
                },
                popoverAnchorPosition: {
                    horizontal: nativeEvent.pageX,
                    vertical: nativeEvent.pageY,
                },
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
        this.getMeasureLocation().then(({x, y}) => {
            this.setState(prev => ({
                popoverAnchorPosition: {
                    horizontal: prev.cursorPosition.horizontal + x,
                    vertical: prev.cursorPosition.vertical + y,
                },
            }));
        });
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {string} [selection] - A copy text.
     */
    showPopover(event, selection) {
        const nativeEvent = event.nativeEvent || {};
        this.selection = selection;
        this.capturePressLocation(nativeEvent).then(() => {
            this.setState({isPopoverVisible: true});
        });
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hidePopover() {
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
                selection={this.selection}
                reportID={this.props.reportID}
                reportAction={this.props.action}
                hidePopover={this.hidePopover}
            />
        );
    }

    render() {
        let children;
        if (this.props.action.actionName === 'IOU') {
            children = (
                <ReportActionItemIOUAction
                    chatReportID={this.props.reportID}
                    action={this.props.action}
                    shouldDisplayPreview={this.props.hasOutstandingIOU && this.props.isMostRecentIOUReportAction}
                />
            );
        } else {
            children = !this.props.draftMessage
                ? <ReportActionItemMessage action={this.props.action} />
                : (
                    <ReportActionItemMessageEdit
                            action={this.props.action}
                            draftMessage={this.props.draftMessage}
                            reportID={this.props.reportID}
                            index={this.props.index}
                    />
                );
        }
        return (
            <PressableWithSecondaryInteraction
                ref={ref => this.popoverAnchor = ref}
                onSecondaryInteraction={this.showPopover}
            >
                <Hoverable>
                    {hovered => (
                        <View>
                            {this.props.shouldDisplayNewIndicator && (
                                <UnreadActionIndicator />
                            )}
                            <View
                                style={getReportActionItemStyle(
                                    hovered
                                    || this.state.isPopoverVisible
                                    || this.props.draftMessage,
                                )}
                                onLayout={this.props.onLayout}
                            >
                                {!this.props.displayAsGroup
                                    ? (
                                        <ReportActionItemSingle action={this.props.action}>
                                            {children}
                                        </ReportActionItemSingle>
                                    )
                                    : (
                                        <ReportActionItemGrouped>
                                            {children}
                                        </ReportActionItemGrouped>
                                    )}
                            </View>
                            <View style={getMiniReportActionContextMenuWrapperStyle(this.props.displayAsGroup)}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportAction={this.props.action}
                                    isVisible={
                                        hovered
                                        && !this.state.isPopoverVisible
                                    }
                                    draftMessage={this.props.draftMessage}
                                    hidePopover={this.hidePopover}
                                    isMini
                                />
                            </View>
                        </View>
                    )}
                </Hoverable>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hidePopover}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    animationOutTiming={1}
                    measureContent={this.measureContent}
                >
                    <ReportActionContextMenu
                        isVisible
                        reportID={this.props.reportID}
                        reportAction={this.props.action}
                        draftMessage={this.props.draftMessage}
                        hidePopover={this.hidePopover}
                    />
                </PopoverWithMeasuredContent>
            </PressableWithSecondaryInteraction>
        );
    }
}

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default withOnyx({
    draftMessage: {
        key: ({reportID, action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}_${action.reportActionID}`,
    },
})(ReportActionItem);
