import type {ReportAction} from '@src/types/onyx';

import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import {createContext} from 'react';

/** What a message hands to the chat when it is touched, so the chat-wide swipe knows which message to move */
type SwipeToReplyRow = {
    action: ReportAction;

    /** Shows the reply icon and attaches the swipe offset to this message */
    activate: () => void;

    /** Detaches the swipe offset once the message is back in place */
    deactivate: () => void;
};

type ReplyInThreadContextValue = {
    /** Whether this chat is archived; archived chats only open threads that already have replies */
    isReportArchived: boolean;

    /** Called on touch start by a message that can be swiped */
    registerTouch: (row: SwipeToReplyRow) => void;

    /**
     * Ref callback the message being swiped attaches to its container, so the chat moves that one view natively.
     * Messages stay plain Views; only the swiped one is ever animated.
     */
    attachActiveRow: (view: View | null) => void;

    translateX: SharedValue<number>;
    armedProgress: SharedValue<number>;
    popScale: SharedValue<number>;
};

/**
 * One swipe gesture for the whole chat. Messages don't own a gesture, shared values or animated styles; they only say
 * "I was touched", and the message being swiped borrows the chat's offset for the length of the swipe.
 */
const ReplyInThreadContext = createContext<ReplyInThreadContextValue | undefined>(undefined);

export default ReplyInThreadContext;
export type {ReplyInThreadContextValue, SwipeToReplyRow};
