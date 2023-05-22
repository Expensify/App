import React from 'react';
import {Dimensions} from 'react-native';

import lodashGet from 'lodash/get';
import lodashMap from 'lodash/map';
import lodashFilter from 'lodash/filter';
import lodashFind from 'lodash/find';
import lodashEach from 'lodash/each';
import lodashIsEqual from 'lodash/isEqual';

import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';

import BaseReactionList from './BaseReactionList';
import compose from '../../../../libs/compose';
import reportActionPropTypes from '../reportActionPropTypes';
import ONYXKEYS from '../../../../ONYXKEYS';
import getPreferredEmojiCode from '../../../../components/Reactions/getPreferredEmojiCode';
import withCurrentUserPersonalDetails from '../../../../components/withCurrentUserPersonalDetails';
import * as PersonalDetailsUtils from '../../../../libs/PersonalDetailsUtils';
import emojis from '../../../../../assets/emojis';

const propTypes = {
    /** Actions from the ChatReport */
    reportActions: PropTypes.shape(reportActionPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: {},
};

/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji.
 * @param {{ name: string, code: string, types: string[] }} emoji
 * @param {Array} users
 * @return {string[]}
 * */
const getUniqueEmojiCodes = (emoji, users) => {
    const emojiCodes = [];
    lodashEach(users, (user) => {
        const emojiCode = getPreferredEmojiCode(emoji, user.skinTone);

        if (emojiCode && !emojiCodes.includes(emojiCode)) {
            emojiCodes.push(emojiCode);
        }
    });
    return emojiCodes;
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
            reportActionID: '',
        };

        this.onPopoverHideActionCallback = () => {};
        this.reactionListAnchor = undefined;
        this.showReactionList = this.showReactionList.bind(this);
        this.hideReactionList = this.hideReactionList.bind(this);
        this.measureReactionListPosition = this.measureReactionListPosition.bind(this);
        this.getReactionListMeasuredLocation = this.getReactionListMeasuredLocation.bind(this);
        this.getSelectedReaction = this.getSelectedReaction.bind(this);
        this.getReactionInformation = this.getReactionInformation.bind(this);
        this.dimensionsEventListener = null;
        this.contentRef = React.createRef();
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureReactionListPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const prevSelectedReaction = this.getSelectedReaction(this.props.reportActions, this.state.reportActionID, this.state.emojiName);
        const selectedReaction = this.getSelectedReaction(nextProps.reportActions, nextState.reportActionID, nextState.emojiName);
        const previousLocale = lodashGet(this.props, 'preferredLocale', 'en');
        const nextLocale = lodashGet(nextProps, 'preferredLocale', 'en');

        return (
            this.state.isPopoverVisible !== nextState.isPopoverVisible ||
            this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition ||
            previousLocale !== nextLocale ||
            (this.state.isPopoverVisible &&
                (!lodashIsEqual(prevSelectedReaction, selectedReaction) ||
                    this.state.emojiName !== nextState.emojiName ||
                    this.state.emojiCount !== nextState.emojiCount ||
                    this.state.hasUserReacted !== nextState.hasUserReacted ||
                    this.state.reportActionID !== nextState.reportActionID ||
                    !lodashIsEqual(this.state.emojiCodes, nextState.emojiCodes) ||
                    !lodashIsEqual(this.state.users, nextState.users)))
        );
    }

    componentDidUpdate() {
        if (!this.state.emojiName) {
            return;
        }
        const selectedReaction = this.getSelectedReaction(this.props.reportActions, this.state.reportActionID, this.state.emojiName);
        if (!selectedReaction) {
            this.setState({
                isPopoverVisible: false,
            });
        } else {
            const {emojiCount, emojiCodes, hasUserReacted, users} = this.getReactionInformation(selectedReaction);
            this.setState({
                users,
                emojiCodes,
                emojiCount,
                hasUserReacted,
            });
        }
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
     * Get the selected reaction.
     *
     * @param {Array<Object>} reportActions
     * @param {String} reportActionID
     * @param {String} emojiName - Name of emoji
     * @returns {Object}
     */
    getSelectedReaction(reportActions, reportActionID, emojiName) {
        const reportAction = lodashFind(reportActions, (action) => action.reportActionID === reportActionID);
        const reactions = lodashGet(reportAction, ['message', 0, 'reactions'], []);
        const reactionsWithCount = lodashFilter(reactions, (reaction) => reaction.users.length > 0);
        return lodashFind(reactionsWithCount, (reaction) => reaction.emoji === emojiName);
    }

    /**
     * Get the reaction information.
     *
     * @param {Object} selectedReaction
     * @returns {Object}
     */
    getReactionInformation(selectedReaction) {
        if (!selectedReaction) {
            return {
                users: [],
                emojiCodes: [],
                emojiName: '',
                emojiCount: 0,
            };
        }
        const emojiCount = selectedReaction.users.length;
        const reactionUsers = lodashMap(selectedReaction.users, (sender) => sender.accountID.toString());
        const emoji = lodashFind(emojis, (e) => e.name === selectedReaction.emoji);
        const emojiCodes = getUniqueEmojiCodes(emoji, selectedReaction.users);
        const hasUserReacted = Report.hasAccountIDReacted(this.props.currentUserPersonalDetails.accountID, reactionUsers);
        const users = PersonalDetailsUtils.getPersonalDetailsByIDs(reactionUsers);
        return {
            emojiCount,
            emojiCodes,
            hasUserReacted,
            users,
        };
    }

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     * @param {String} emojiName - Name of emoji
     * @param {String} reportActionID
     */
    showReactionList(event, reactionListAnchor, emojiName, reportActionID) {
        const nativeEvent = event.nativeEvent || {};
        this.reactionListAnchor = reactionListAnchor;
        const selectedReaction = this.getSelectedReaction(this.props.reportActions, reportActionID, emojiName);
        const {emojiCount, emojiCodes, hasUserReacted, users} = this.getReactionInformation(selectedReaction);
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
                reportActionID,
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

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideReactionList}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    disableAnimation={false}
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
PopoverReactionList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
    }),
    withCurrentUserPersonalDetails,
)(PopoverReactionList);
