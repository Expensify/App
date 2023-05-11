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
            emojiCount: 0,
            hasUserReacted: false,
        };

        this.onPopoverHideActionCallback = () => {};
        this.reactionListAnchor = undefined;
        this.showReactionList = this.showReactionList.bind(this);

        this.hideReactionList = this.hideReactionList.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureReactionListPosition = this.measureReactionListPosition.bind(this);
        this.getReactionListMeasuredLocation = this.getReactionListMeasuredLocation.bind(this);

        this.dimensionsEventListener = null;

        this.contentRef = React.createRef();
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureReactionListPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const previousLocale = lodashGet(this.props, 'preferredLocale', 'en');
        const nextLocale = lodashGet(nextProps, 'preferredLocale', 'en');
        return this.state.isPopoverVisible !== nextState.isPopoverVisible || this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition || previousLocale !== nextLocale;
    }

    componentWillUnmount() {
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
    }

    /**
     * Get the PopoverReactionList anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    getReactionListMeasuredLocation() {
        return new Promise((resolve) => {
            if (this.reactionListAnchor) {
                this.reactionListAnchor.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });
    }

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     * @param {Array} users - Array of personal detail objects
     * @param {String} emojiName - Name of emoji
     * @param {Array} emojiCodes - The emoji codes to display in the bubble.
     * @param {Number} emojiCount - Count of emoji
     * @param {Boolean} hasUserReacted - whether the current user has reacted to this emoji

     */
    showReactionList(event, reactionListAnchor, users, emojiName, emojiCodes, emojiCount, hasUserReacted) {
        const nativeEvent = event.nativeEvent || {};

        this.reactionListAnchor = reactionListAnchor;

        this.getReactionListMeasuredLocation().then(({x, y}) => {
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
     * This gets called on Dimensions change to find the anchor coordinates for the action PopoverReactionList.
     */
    measureReactionListPosition() {
        if (!this.state.isPopoverVisible) {
            return;
        }
        this.getReactionListMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }
            this.setState((prev) => ({
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
     * Used to calculate the PopoverReactionList Dimensions
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
                        hasUserReacted={this.state.hasUserReacted}
                    />
                </PopoverWithMeasuredContent>
            </>
        );
    }
}

PopoverReactionList.propTypes = propTypes;

export default withLocalize(PopoverReactionList);
