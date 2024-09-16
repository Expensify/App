import React, {forwardRef, useImperativeHandle} from 'react';
import type {ForwardedRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useBasePopoverReactionList from '@hooks/useBasePopoverReactionList';
import type {BasePopoverReactionListOnyxProps, BasePopoverReactionListPropsWithLocalWithOnyx} from '@hooks/useBasePopoverReactionList/types';
import useLocalize from '@hooks/useLocalize';
import BaseReactionList from '@pages/home/report/ReactionList/BaseReactionList';
import type {ReactionListRef} from '@pages/home/ReportScreenContext';
import ONYXKEYS from '@src/ONYXKEYS';

function BasePopoverReactionList(props: BasePopoverReactionListPropsWithLocalWithOnyx, ref: ForwardedRef<Partial<ReactionListRef>>) {
    const {emojiReactions, emojiName, reportActionID, currentUserPersonalDetails} = props;
    const {preferredLocale} = useLocalize();
    const {isPopoverVisible, hideReactionList, showReactionList, popoverAnchorPosition, reactionListRef, getReactionInformation} = useBasePopoverReactionList({
        emojiName,
        emojiReactions,
        accountID: currentUserPersonalDetails.accountID,
        reportActionID,
        preferredLocale,
    });
    // Get the reaction information
    const {emojiCodes, reactionCount, hasUserReacted, users, isReady} = getReactionInformation();
    useImperativeHandle(ref, () => ({hideReactionList, showReactionList}));

    return (
        <PopoverWithMeasuredContent
            isVisible={isPopoverVisible && isReady}
            onClose={hideReactionList}
            anchorPosition={popoverAnchorPosition}
            animationIn="fadeIn"
            disableAnimation={false}
            animationOutTiming={1}
            shouldSetModalVisibility={false}
            fullscreen
            withoutOverlay
            anchorRef={reactionListRef}
        >
            <BaseReactionList
                isVisible
                users={users}
                emojiName={emojiName}
                emojiCodes={emojiCodes}
                emojiCount={reactionCount}
                onClose={hideReactionList}
                hasUserReacted={hasUserReacted}
            />
        </PopoverWithMeasuredContent>
    );
}

export default withCurrentUserPersonalDetails(
    withOnyx<BasePopoverReactionListPropsWithLocalWithOnyx, BasePopoverReactionListOnyxProps>({
        emojiReactions: {
            key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
        },
    })(forwardRef(BasePopoverReactionList)),
);
