import React, {useEffect} from 'react';
import type {RefObject} from 'react';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {getEmojiReactionDetails} from '@libs/EmojiUtils';
import {getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import type {ReactionListAnchor} from '@pages/inbox/ReportScreenContext';
import ONYXKEYS from '@src/ONYXKEYS';
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

    const selectedReaction = emojiReactions?.[emojiName];
    const isReady = !!selectedReaction;
    const {emojiCodes = [], reactionCount = 0, hasUserReacted = false, userAccountIDs = []} = selectedReaction ? getEmojiReactionDetails(emojiName, selectedReaction, accountID) : {};
    const users = isReady ? getPersonalDetailsByIDs({accountIDs: userAccountIDs, currentUserAccountID: accountID, shouldChangeUserDisplayName: true}) : [];

    // Hide the list when all reactions are removed
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const reactionUsers = emojiReactions?.[emojiName]?.users;
        if (!reactionUsers || Object.keys(reactionUsers).length > 0) {
            return;
        }
        onClose();
    }, [emojiReactions, emojiName, isVisible, onClose]);

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
