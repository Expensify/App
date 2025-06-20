import React, {forwardRef, useImperativeHandle} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useBasePopoverReactionList from '@hooks/useBasePopoverReactionList';
import type {BasePopoverReactionListProps} from '@hooks/useBasePopoverReactionList/types';
import useLocalize from '@hooks/useLocalize';
import BaseReactionList from '@pages/home/report/ReactionList/BaseReactionList';
import type {ReactionListRef} from '@pages/home/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PopoverReactionListProps = WithCurrentUserPersonalDetailsProps & BasePopoverReactionListProps;

function BasePopoverReactionList({emojiName, reportActionID, currentUserPersonalDetails}: PopoverReactionListProps, ref: ForwardedRef<Partial<ReactionListRef>>) {
    const {preferredLocale} = useLocalize();

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reactionReportActionID = reportActionID || CONST.DEFAULT_NUMBER_ID;
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reactionReportActionID}`, {canBeMissing: true});
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

export default withCurrentUserPersonalDetails(forwardRef(BasePopoverReactionList));
