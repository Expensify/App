import React from 'react';
import {Dimensions} from 'react-native';

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
            emojiCodes: [],
            emojiName: '',
            sizeScale: 1,
            emojiCount: 0,
            hasUserReacted: false,
        };

        this.onPopoverHideActionCallback = () => {};
        this.contextMenuAnchor = undefined;
        this.showReactionList = this.showReactionList.bind(this);

        this.hideReactionList = this.hideReactionList.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureReactionListPosition = this.measureReactionListPosition.bind(this);
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
     * @param {Element} contextMenuAnchor - contextMenuAnchor
     * @param {Array} users - Array of users id
     * @param {String} emojiName - Name of emoji
     * @param {Array} emojiCodes - The emoji codes to display in the bubble.
     * @param {Number} emojiCount - Count of emoji
     * @param {Boolean} hasUserReacted - whether the current user has reacted to this emoji

     */
    showReactionList(
        event,
        contextMenuAnchor,
        users,
        emojiName,
        emojiCodes,
        emojiCount,
        hasUserReacted,
    ) {
        const nativeEvent = event.nativeEvent || {};

        this.contextMenuAnchor = contextMenuAnchor;

        // Singleton behaviour of ContextMenu creates race conditions when user requests multiple contextMenus.
        // But it is possible that every new request registers new callbacks thus instanceID is used to corelate those callbacks
        this.instanceID = Math.random().toString(36).substr(2, 5);
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
                emojiCodes,
                emojiCount,
                isPopoverVisible: true,
                hasUserReacted,
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
     * Hide the ReactionList modal popover.
     */
    hideReactionList() {
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
                emojiCodes={this.state.emojiCodes}
                emojiCount={this.state.emojiCount}
                onClose={this.hideReactionList}
                sizeScale={this.state.sizeScale}
                hasUserReacted={this.state.hasUserReacted}
            />
        );
    }

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideReactionList}
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
                        emojiCodes={this.state.emojiCodes}
                        emojiCount={this.state.emojiCount}
                        onClose={this.hideReactionList}
                        sizeScale={this.state.sizeScale}
                        hasUserReacted={this.state.hasUserReacted}
                    />
                </PopoverWithMeasuredContent>
            </>
        );
    }
}

PopoverReactionList.propTypes = propTypes;

export default withLocalize(PopoverReactionList);
