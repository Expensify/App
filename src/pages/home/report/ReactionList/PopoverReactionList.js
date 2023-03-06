import React from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';

import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';

import BaseReactionList from './BaseReactionList';

const propTypes = {
    ...withLocalizePropTypes,
};

class PopoverReactionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reportID: '0',
            reportAction: {},
            isPopoverVisible: false,
            cursorRelativePosition: {
                horizontal: 0,
                vertical: 0,
            },

            // The horizontal and vertical position (relative to the screen) where the popover will display.
            popoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
            users: [],
            emojiName: '',
        };

        this.onPopoverShow = () => {};
        this.onPopoverHide = () => {};
        this.onPopoverHideActionCallback = () => {};
        this.contextMenuAnchor = undefined;
        this.showReactionList = this.showReactionList.bind(this);

        this.hideReactionList = this.hideReactionList.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureReactionListPosition = this.measureReactionListPosition.bind(this);
        this.runAndResetOnPopoverShow = this.runAndResetOnPopoverShow.bind(this);
        this.runAndResetOnPopoverHide = this.runAndResetOnPopoverHide.bind(this);
        this.getContextMenuMeasuredLocation = this.getContextMenuMeasuredLocation.bind(this);

        this.dimensionsEventListener = null;

        this.contentRef = React.createRef();
        this.setContentRef = (ref) => {
            this.contentRef.current = ref;
        };
        this.setContentRef = this.setContentRef.bind(this);
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureReactionListPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const previousLocale = lodashGet(this.props, 'preferredLocale', 'en');
        const nextLocale = lodashGet(nextProps, 'preferredLocale', 'en');
        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition
            || previousLocale !== nextLocale;
    }

    componentWillUnmount() {
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
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
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} contextMenuAnchor - popoverAnchor
     * @param {Array} users - array of users id
     * @param {String} emojiName - name of emoji
     * @param {Function} [onShow] - Run a callback when Menu is shown
     * @param {Function} [onHide] - Run a callback when Menu is hidden
     */
    showReactionList(
        event,
        contextMenuAnchor,
        users,
        emojiName,
        onShow,
        onHide,
    ) {
        const nativeEvent = event.nativeEvent || {};

        this.contextMenuAnchor = contextMenuAnchor;
        this.contextMenuTargetNode = nativeEvent.target;

        // Singleton behaviour of ContextMenu creates race conditions when user requests multiple contextMenus.
        // But it is possible that every new request registers new callbacks thus instanceID is used to corelate those callbacks
        this.instanceID = Math.random().toString(36).substr(2, 5);

        // Register the onHide callback only when Popover is shown to remove the race conditions when there are mutltiple popover open requests
        this.onPopoverShow = () => {
            onShow();
            this.onPopoverHide = onHide;
        };
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
                users,
                emojiName,
                isPopoverVisible: true,
            });
        });
    }

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action context menu.
     */
    measureReactionListPosition() {
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
     * After Popover shows, call the registered onPopoverShow callback and reset it
     */
    runAndResetOnPopoverShow() {
        this.onPopoverShow();

        // After we have called the action, reset it.
        this.onPopoverShow = () => {};
    }

    /**
     * After Popover hides, call the registered onPopoverHide & onPopoverHideActionCallback callback and reset it
     */
    runAndResetOnPopoverHide() {
        this.setState({reportID: '0', reportAction: {}}, () => {
            this.onPopoverHide = this.runAndResetCallback(this.onPopoverHide);
            this.onPopoverHideActionCallback = this.runAndResetCallback(this.onPopoverHideActionCallback);
        });
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param {Function} onHideActionCallback Callback to be called after popover is completely hidden
     */
    hideReactionList(onHideActionCallback) {
        if (_.isFunction(onHideActionCallback)) {
            this.onPopoverHideActionCallback = onHideActionCallback;
        }
        this.setState({
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
            <BaseReactionList
                type={this.state.type}
                isVisible
                users={this.state.users}
                emojiName={this.state.emojiName}
                reportID={this.state.reportID}
                reportAction={this.state.reportAction}
                anchor={this.contextMenuTargetNode}
                contentRef={this.setContentRef}
                onClose={this.hideReactionList}
            />
        );
    }

    /**
     * Run the callback and return a noop function to reset it
     * @param {Function} callback
     * @returns {Function}
     */
    runAndResetCallback(callback) {
        callback();
        return () => {};
    }

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideReactionList}
                    onModalShow={this.runAndResetOnPopoverShow}
                    onModalHide={this.runAndResetOnPopoverHide}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    disableAnimation={false}
                    animationOutTiming={1}
                    measureContent={this.measureContent}
                    shouldSetModalVisibility={false}
                    fullscreen
                >
                    <BaseReactionList
                        type={this.state.type}
                        isVisible
                        users={this.state.users}
                        emojiName={this.state.emojiName}
                        reportID={this.state.reportID}
                        reportAction={this.state.reportAction}
                        anchor={this.contextMenuTargetNode}
                        contentRef={this.setContentRef}
                        onClose={this.hideReactionList}
                    />
                </PopoverWithMeasuredContent>
            </>
        );
    }
}

PopoverReactionList.propTypes = propTypes;

export default withLocalize(PopoverReactionList);
