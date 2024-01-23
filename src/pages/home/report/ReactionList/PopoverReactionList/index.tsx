import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import type {InnerReactionListRefType} from '@hooks/useBasePopoverReactionList/types';
import type {ReactionListRef} from '@pages/home/ReportScreenContext';
import BasePopoverReactionList from './BasePopoverReactionList';

type PopoverReactionListProps = {
    ref: ForwardedRef<ReactionListRef>;
};

function PopoverReactionList(props: PopoverReactionListProps) {
    const innerReactionListRef = useRef<InnerReactionListRefType>(null);
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

    const isActiveReportAction = (actionID: number | string) => Boolean(actionID) && reactionListReportActionID === actionID;

    useImperativeHandle(props.ref, () => ({showReactionList, hideReactionList, isActiveReportAction}));

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
            emojiName={reactionListEmojiName}
        />
    );
}

PopoverReactionList.displayName = 'PopoverReactionList';

export default React.memo(
    forwardRef<ReactionListRef>((props, ref) => (
        <PopoverReactionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    )),
);
