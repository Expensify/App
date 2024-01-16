import lodashGet from 'lodash/get';
import React from 'react';
import {Dimensions} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import _ from 'underscore';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import withCurrentUserPersonalDetails, {type WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {type WithLocalizeProps} from '@components/withLocalize';
import compose from '@libs/compose';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import BaseReactionList from '@pages/home/report/ReactionList/BaseReactionList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActionReactions} from '@src/types/onyx';
import {ReportActionReaction} from '@src/types/onyx/ReportActionReactions';

type BasePopoverReactionListOnyxProps = {
    /** The reactions for the report action */
    emojiReactions: OnyxEntry<ReportActionReactions>;
};

type BasePopoverReactionListProps = {
    /** The ID of the report action */
    reportActionID: string;

    /** The emoji name */
    emojiName: string;

    /** The ref of the action */
    ref: React.Ref<any>;
};

type BasePopoverReactionListWithLocalizeProps = WithLocalizeProps & WithCurrentUserPersonalDetailsProps;

type BasePopoverReactionListPropsWithLocalWithOnyx = BasePopoverReactionListWithLocalizeProps & BasePopoverReactionListOnyxProps & BasePopoverReactionListProps;
type BasePopoverReactionListState = {
    /** Whether the popover is visible */
    isPopoverVisible: boolean;

    /** The horizontal and vertical position (relative to the screen) where the popover will display. */
    popoverAnchorPosition: {
        horizontal: number;
        vertical: number;
    };

    /** The horizontal and vertical position (relative to the screen) where the cursor is. */
    cursorRelativePosition: {
        horizontal: number;
        vertical: number;
    };
};

class BasePopoverReactionList extends React.Component<BasePopoverReactionListPropsWithLocalWithOnyx, BasePopoverReactionListState> {
    reactionListAnchor: React.RefObject<HTMLElement>;

    dimensionsEventListener: {
        remove: () => void;
    } | null;

    constructor(props: BasePopoverReactionListPropsWithLocalWithOnyx) {
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
        };

        this.reactionListAnchor = React.createRef();
        this.showReactionList = this.showReactionList.bind(this);
        this.hideReactionList = this.hideReactionList.bind(this);
        this.measureReactionListPosition = this.measureReactionListPosition.bind(this);
        this.getReactionListMeasuredLocation = this.getReactionListMeasuredLocation.bind(this);
        this.getReactionInformation = this.getReactionInformation.bind(this);
        this.dimensionsEventListener = null;
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureReactionListPosition);
    }

    shouldComponentUpdate(nextProps: BasePopoverReactionListPropsWithLocalWithOnyx, nextState: BasePopoverReactionListState) {
        if (!this.state.isPopoverVisible && !nextState.isPopoverVisible) {
            // If the popover is not visible, we don't need to update the component
            return false;
        }

        const previousLocale = lodashGet(this.props, 'preferredLocale', CONST.LOCALES.DEFAULT);
        const nextLocale = lodashGet(nextProps, 'preferredLocale', CONST.LOCALES.DEFAULT);
        const prevReaction = lodashGet(this.props.emojiReactions, this.props.emojiName);
        const nextReaction = lodashGet(nextProps.emojiReactions, nextProps.emojiName);

        return (
            this.props.reportActionID !== nextProps.reportActionID ||
            this.props.emojiName !== nextProps.emojiName ||
            !_.isEqual(prevReaction, nextReaction) ||
            !_.isEqual(this.state, nextState) ||
            previousLocale !== nextLocale
        );
    }

    componentDidUpdate() {
        if (!this.state.isPopoverVisible) {
            // If the popover is not visible, we don't need to update the component
            return;
        }

        // Hide the list when all reactions are removed
        const emojiReactions = lodashGet(this.props.emojiReactions, [this.props.emojiName, 'users']);
        const isEmptyList = !emojiReactions || !_.some(emojiReactions);
        if (!isEmptyList) {
            return;
        }

        this.hideReactionList();
    }

    componentWillUnmount() {
        // Remove the event listener
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
    }

    /**
     * Get the BasePopoverReactionList anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    getReactionListMeasuredLocation(): Promise<{x: number; y: number}> {
        return new Promise((resolve) => {
            const reactionListAnchor = this.reactionListAnchor.current as HTMLElement & {measureInWindow: (callback: (x: number, y: number) => void) => void};
            if (reactionListAnchor) {
                reactionListAnchor.measureInWindow((x, y) => resolve({x, y}));
            } else {
                // If the anchor is not available, we return 0, 0
                resolve({x: 0, y: 0});
            }
        });
    }

    /**
     * Get the reaction information.
     *
     * @param {Object} selectedReaction
     * @param {String} emojiName
     * @returns {Object}
     */
    getReactionInformation(selectedReaction: ReportActionReaction | null | undefined, emojiName: string) {
        if (!selectedReaction) {
            // If there is no reaction, we return default values
            return {
                emojiName: '',
                reactionCount: 0,
                emojiCodes: [],
                hasUserReacted: false,
                users: [],
            };
        }

        const {emojiCodes, reactionCount, hasUserReacted, userAccountIDs} = EmojiUtils.getEmojiReactionDetails(emojiName, selectedReaction, this.props.currentUserPersonalDetails.accountID);

        const users = PersonalDetailsUtils.getPersonalDetailsByIDs(userAccountIDs, this.props.currentUserPersonalDetails.accountID, true);
        return {
            emojiName,
            emojiCodes,
            reactionCount,
            hasUserReacted,
            users,
        };
    }

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     */
    showReactionList(
        event: {
            nativeEvent: {
                pageX: number;
                pageY: number;
            };
        },
        reactionListAnchor: HTMLElement,
    ) {
        // We get the cursor coordinates and the reactionListAnchor coordinates to calculate the popover position
        const nativeEvent = event.nativeEvent || {};
        this.reactionListAnchor = {current: reactionListAnchor};
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
                isPopoverVisible: true,
            });
        });
    }

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action BasePopoverReactionList.
     */
    measureReactionListPosition() {
        if (!this.state.isPopoverVisible) {
            // If the popover is not visible, we don't need to update the component
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
        // Get the selected reaction
        const selectedReaction = this.state.isPopoverVisible ? lodashGet(this.props.emojiReactions, [this.props.emojiName]) : null;

        // Get the reaction information
        const {emojiName, emojiCodes, reactionCount, hasUserReacted, users} = this.getReactionInformation(selectedReaction, this.props.emojiName);

        return (
            <PopoverWithMeasuredContent
                isVisible={this.state.isPopoverVisible}
                onClose={this.hideReactionList}
                anchorPosition={this.state.popoverAnchorPosition}
                animationIn="fadeIn"
                disableAnimation={false}
                animationOutTiming={1}
                shouldSetModalVisibility={false}
                fullscreen
                withoutOverlay
                anchorRef={this.reactionListAnchor}
                anchorAlignment={{
                    horizontal: 'left',
                    vertical: 'top',
                }}
            >
                <BaseReactionList
                    isVisible
                    users={users}
                    emojiName={emojiName}
                    emojiCodes={emojiCodes}
                    emojiCount={reactionCount}
                    onClose={this.hideReactionList}
                    hasUserReacted={hasUserReacted}
                />
            </PopoverWithMeasuredContent>
        );
    }
}

export default compose(
    // @ts-ignore TODO: Fix this when the type is fixed
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx<BasePopoverReactionListProps, BasePopoverReactionListOnyxProps>({
        emojiReactions: {
            key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
        },
    }),
)(BasePopoverReactionList);
