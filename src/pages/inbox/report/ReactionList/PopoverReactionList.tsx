import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {getEmojiReactionDetails, mergeReactionsByEmoji} from '@libs/EmojiUtils';

import type {ReactionListAnchor} from '@pages/inbox/ReportScreenContext';

import ONYXKEYS from '@src/ONYXKEYS';
import {multiPersonalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';

import BaseReactionList from './BaseReactionList';

type PopoverReactionListProps = {
    isVisible: boolean;
    emojiName: string;
    reportActionID: string | undefined;
    anchorPosition: {horizontal: number; vertical: number};
    anchorRef: RefObject<ReactionListAnchor>;
    onClose: () => void;
};

function PopoverReactionList({isVisible, emojiName, reportActionID, anchorPosition, anchorRef, onClose}: PopoverReactionListProps) {
    const {accountID} = useCurrentUserPersonalDetails();

    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

    // Merge duplicate name/hex entries for the same emoji before looking up, so the reaction
    // list shows the combined users and count rather than only one format's worth of data.
    const mergedReactions = mergeReactionsByEmoji(emojiReactions ?? {});
    const selectedReaction = mergedReactions[emojiName];
    const isReady = !!selectedReaction;
    const {emojiCodes = [], reactionCount = 0, hasUserReacted = false, userAccountIDs = []} = selectedReaction ? getEmojiReactionDetails(emojiName, selectedReaction, accountID) : {};

    const [users = getEmptyArray<PersonalDetails>()] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetailsList: OnyxEntry<PersonalDetailsList>) => multiPersonalDetailsSelector(isReady ? userAccountIDs : getEmptyArray<number>())(personalDetailsList),
    });

    // Hide the list when all reactions are removed
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const reactionUsers = mergedReactions[emojiName]?.users;
        if (!reactionUsers || Object.keys(reactionUsers).length > 0) {
            return;
        }
        onClose();
    }, [emojiReactions, emojiName, isVisible, onClose, mergedReactions]);

    return (
        <PopoverWithMeasuredContent
            isVisible={isVisible && isReady}
            onClose={onClose}
            anchorPosition={anchorPosition}
            animationIn="fadeIn"
            disableAnimation={false}
            shouldSetModalVisibility={false}
            fullscreen
            anchorRef={anchorRef}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <BaseReactionList
                isVisible
                users={users}
                emojiName={emojiName}
                emojiCodes={emojiCodes}
                emojiCount={reactionCount}
                onClose={onClose}
                hasUserReacted={hasUserReacted}
            />
        </PopoverWithMeasuredContent>
    );
}

export default PopoverReactionList;
