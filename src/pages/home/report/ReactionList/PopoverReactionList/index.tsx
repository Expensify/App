import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import type {InnerReactionListRef} from '@hooks/useBasePopoverReactionList/types';
import type {ReactionListRef} from '@pages/home/ReportScreenContext';
import BasePopoverReactionList from './BasePopoverReactionList';

function PopoverReactionList(props: unknown, ref: ForwardedRef<ReactionListRef>) {
    const innerReactionListRef = useRef<InnerReactionListRef>(null);
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');
    const [reactionListEmojiName, setReactionListEmojiName] = useState('');

    const showReactionList: ReactionListRef['showReactionList'] = (event, reactionListAnchor, emojiName, reportActionID) => {
        setReactionListReportActionID(reportActionID);
        setReactionListEmojiName(emojiName);
        innerReactionListRef.current?.showReactionList(event, reactionListAnchor);
    };

    const hideReactionList = () => {
        innerReactionListRef.current?.hideReactionList();
    };

    const isActiveReportAction = (actionID: number | string) => !!actionID && reactionListReportActionID === actionID;

    useImperativeHandle(ref, () => ({showReactionList, hideReactionList, isActiveReportAction}));

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
            emojiName={reactionListEmojiName}
        />
    );
}

PopoverReactionList.displayName = 'PopoverReactionList';

export default React.memo(forwardRef(PopoverReactionList));
