import {useEffect, useRef, useState} from 'react';
import type {SyntheticEvent} from 'react';
import {Dimensions} from 'react-native';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import type {BasePopoverReactionListHookProps, ReactionListAnchor, ShowReactionList} from './types';

export default function useBasePopoverReactionList({emojiName, emojiReactions, accountID, reportActionID, preferredLocale}: BasePopoverReactionListHookProps) {
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [cursorRelativePosition, setCursorRelativePosition] = useState({horizontal: 0, vertical: 0});
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const reactionListRef = useRef<ReactionListAnchor>(null);

    function getReactionInformation() {
        const selectedReaction = emojiReactions?.[emojiName];

        if (!selectedReaction) {
            // If there is no reaction, we return default values
            return {
                emojiName: '',
                reactionCount: 0,
                emojiCodes: [],
                hasUserReacted: false,
                users: [],
                isReady: false,
            };
        }

        const {emojiCodes, reactionCount, hasUserReacted, userAccountIDs} = EmojiUtils.getEmojiReactionDetails(emojiName, selectedReaction, accountID);

        const users = PersonalDetailsUtils.getPersonalDetailsByIDs({accountIDs: userAccountIDs, currentUserAccountID: accountID, shouldChangeUserDisplayName: true});
        return {
            emojiName,
            emojiCodes,
            reactionCount,
            hasUserReacted,
            users,
            isReady: true,
        };
    }

    /**
     * Get the BasePopoverReactionList anchor position
     * We calculate the achor coordinates from measureInWindow async method
     */
    function getReactionListMeasuredLocation(): Promise<{x: number; y: number}> {
        return new Promise((resolve) => {
            const reactionListAnchor = reactionListRef.current;
            if (reactionListAnchor && 'measureInWindow' in reactionListAnchor) {
                reactionListAnchor.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });
    }

    /**
     * Show the ReactionList modal popover.
     *
     * @param event - Object -  A press event.
     * @param reactionListAnchor - Element - reactionListAnchor
     */
    const showReactionList: ShowReactionList = (event, reactionListAnchor) => {
        // We get the cursor coordinates and the reactionListAnchor coordinates to calculate the popover position
        const nativeEvent = (event as SyntheticEvent<ReactionListAnchor, MouseEvent>)?.nativeEvent || {};
        reactionListRef.current = reactionListAnchor;
        getReactionListMeasuredLocation().then(({x, y}) => {
            setCursorRelativePosition({horizontal: nativeEvent.pageX - x, vertical: nativeEvent.pageY - y});
            setPopoverAnchorPosition({
                horizontal: nativeEvent.pageX,
                vertical: nativeEvent.pageY,
            });
            setIsPopoverVisible(true);
        });
    };

    /**
     * Hide the ReactionList modal popover.
     */
    function hideReactionList() {
        setIsPopoverVisible(false);
    }

    useEffect(() => {
        const dimensionsEventListener = Dimensions.addEventListener('change', () => {
            if (!isPopoverVisible) {
                // If the popover is not visible, we don't need to update the component
                return;
            }
            getReactionListMeasuredLocation().then(({x, y}) => {
                if (!x || !y) {
                    return;
                }
                setPopoverAnchorPosition({
                    horizontal: cursorRelativePosition.horizontal + x,
                    vertical: cursorRelativePosition.vertical + y,
                });
            });
        });

        return () => {
            dimensionsEventListener.remove();
        };
    }, [
        isPopoverVisible,
        reportActionID,
        preferredLocale,
        cursorRelativePosition.horizontal,
        cursorRelativePosition.vertical,
        popoverAnchorPosition.horizontal,
        popoverAnchorPosition.vertical,
    ]);

    useEffect(() => {
        if (!isPopoverVisible) {
            // If the popover is not visible, we don't need to update the component
            return;
        }

        // Hide the list when all reactions are removed
        const users = emojiReactions?.[emojiName]?.users;

        if (!users || Object.keys(users).length > 0) {
            return;
        }

        hideReactionList();
    }, [emojiReactions, emojiName, isPopoverVisible, reportActionID, preferredLocale]);

    return {isPopoverVisible, cursorRelativePosition, popoverAnchorPosition, getReactionInformation, hideReactionList, reactionListRef, showReactionList};
}
