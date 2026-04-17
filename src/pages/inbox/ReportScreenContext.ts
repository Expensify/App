import type {RefObject, SyntheticEvent} from 'react';
import {createContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text, View} from 'react-native';

type ReactionListAnchor = View | Text | HTMLDivElement | null;

type ReactionListEvent = GestureResponderEvent | MouseEvent | SyntheticEvent<ReactionListAnchor, MouseEvent>;

type ReactionListRef = {
    showReactionList: (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor, emojiName: string, reportActionID: string) => void;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

// Duck-typed imperative interface shared by the two list instances we may host
// (InvertedFlashList's FlashListRef and FlatListWithScrollKey's RN FlatList). Only the methods
// actually invoked by scroll handlers are listed; native-only `getNativeScrollRef` is guarded
// at the call site.
type ListInstanceType = {
    scrollToIndex: (params: {index: number; animated?: boolean}) => void;
    scrollToOffset: (params: {offset: number; animated?: boolean}) => void;
    scrollToEnd: (params?: {animated?: boolean}) => void;
    getNativeScrollRef?: () => unknown;
};
// Ref object types are invariant in React — we widen to `unknown` at the context boundary and
// keep specific leaf types (FlashListRef<ReportAction>, FlatList<ReportAction>) at each list site.
type FlatListRefType = RefObject<unknown> | null;

type ScrollPosition = {offset?: number};

type ActionListContextType = {
    /** Child list components call this on mount to publish their list instance ref. Pass `null` to clear on unmount. */
    registerListRef: (ref: RefObject<unknown> | null) => void;

    /** Handlers (scrollTo*, Safari keyboard hack) call this to read the currently registered list ref. Never use during render. */
    getListRef: () => RefObject<ListInstanceType | null> | null;

    scrollPositionRef: RefObject<ScrollPosition>;
    scrollOffsetRef: RefObject<number>;
};
type ReactionListContextType = RefObject<ReactionListRef | null> | null;

const ActionListContext = createContext<ActionListContextType>({
    registerListRef: () => {},
    getListRef: () => null,
    scrollPositionRef: {current: {}},
    scrollOffsetRef: {current: 0},
});
const ReactionListContext = createContext<ReactionListContextType>(null);

export {ActionListContext, ReactionListContext};
export type {ReactionListRef, ActionListContextType, FlatListRefType, ReactionListAnchor, ReactionListEvent, ScrollPosition};
