import type {RefObject, SyntheticEvent} from 'react';
import {createContext, useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {FlatList, GestureResponderEvent, Text, View} from 'react-native';

type ReactionListAnchor = View | Text | HTMLDivElement | null;

type ReactionListEvent = GestureResponderEvent | MouseEvent | SyntheticEvent<ReactionListAnchor, MouseEvent>;

type ReactionListContextType = {
    showReactionList: (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor, emojiName: string, reportActionID: string) => void;
    hideReactionList: () => void;
    isActiveReportAction: (reportActionID: number | string) => boolean;
};

type FlatListRefType = RefObject<FlatList<unknown> | null> | null;

type ScrollPosition = {offset?: number};

type ActionListContextType = {
    scrollPositionRef: RefObject<ScrollPosition>;
    scrollOffsetRef: RefObject<number>;

    /** Each list publishes its locally-owned ref on mount; pass `null` to clear on unmount. */
    registerListRef: (ref: FlatListRefType) => void;

    /** Reads the currently registered list ref. Call from handlers only, never during render. */
    getListRef: () => FlatListRefType;
};

const ActionListContext = createContext<ActionListContextType>({
    scrollPositionRef: {current: {}},
    scrollOffsetRef: {current: 0},
    registerListRef: () => {},
    getListRef: () => null,
});
const ReactionListContext = createContext<ReactionListContextType>({
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
});

function useActionListContext() {
    return useContext(ActionListContext);
}

export {ActionListContext, ReactionListContext, useActionListContext};
export type {ReactionListContextType, ActionListContextType, FlatListRefType, ReactionListAnchor, ReactionListEvent, ScrollPosition};
