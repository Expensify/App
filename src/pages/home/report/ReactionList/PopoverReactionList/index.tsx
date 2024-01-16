import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import BasePopoverReactionList from './BasePopoverReactionList';

type PopoverReactionListProps = {
    ref: ForwardedRef<InnerReactionListRefType>;
};

type ShowReactionList = (event: React.MouseEvent, reactionListAnchor: HTMLElement, emojiName: string, reportActionID: string) => void;

type InnerReactionListRefType = {
    showReactionList: ShowReactionList;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

function PopoverReactionList(props: PopoverReactionListProps) {
    const innerReactionListRef = useRef<InnerReactionListRefType>(null);
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');
    const [reactionListEmojiName, setReactionListEmojiName] = useState('');

    const showReactionList: ShowReactionList = (event, reactionListAnchor, emojiName, reportActionID) => {
        setReactionListReportActionID(reportActionID);
        setReactionListEmojiName(emojiName);
        innerReactionListRef.current?.showReactionList(event, reactionListAnchor, emojiName, reportActionID);
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
    forwardRef<InnerReactionListRefType>((props, ref) => (
        <PopoverReactionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    )),
);
