import React, {forwardRef, Ref, useImperativeHandle, useRef, useState} from 'react';
import BasePopoverReactionList from './BasePopoverReactionList';

type PopoverReactionListProps = {
    innerRef: Ref<any>;
};

type InnerReactionListRefType = {
    showReactionList: (
        event: {
            nativeEvent: {
                pageX: number;
                pageY: number;
            };
        },
        reactionListAnchor: HTMLElement,
    ) => void;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

const PopoverReactionList = (props: PopoverReactionListProps) => {
    const innerReactionListRef = useRef<InnerReactionListRefType>(null);
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');
    const [reactionListEmojiName, setReactionListEmojiName] = useState('');

    const showReactionList = (event: React.MouseEvent, reactionListAnchor: HTMLElement, emojiName: string, reportActionID: string) => {
        setReactionListReportActionID(reportActionID);
        setReactionListEmojiName(emojiName);
        innerReactionListRef.current?.showReactionList(event, reactionListAnchor);
    };

    const hideReactionList = () => {
        innerReactionListRef.current?.hideReactionList();
    };

    const isActiveReportAction = (actionID: number | string) => Boolean(actionID) && reactionListReportActionID === actionID;

    useImperativeHandle(props.innerRef, () => ({showReactionList, hideReactionList, isActiveReportAction}));

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
            emojiName={reactionListEmojiName}
        />
    );
};

PopoverReactionList.displayName = 'PopoverReactionList';

export default React.memo(
    forwardRef((props, ref) => (
        <PopoverReactionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
