import type {RefObject, SyntheticEvent} from 'react';
import {createContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {FlatList, GestureResponderEvent, Text, View} from 'react-native';

type ReactionListAnchor = View | Text | HTMLDivElement | null;

type ReactionListEvent = GestureResponderEvent | MouseEvent | SyntheticEvent<ReactionListAnchor, MouseEvent>;

type ReactionListRef = {
    showReactionList: (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor, emojiName: string, reportActionID: string) => void;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

type FlatListRefType = RefObject<FlatList<unknown> | null> | null;

type ScrollPosition = {offset?: number};

type ActionListContextType = {
    flatListRef: FlatListRefType;
    scrollPosition: ScrollPosition | null;
    setScrollPosition: (position: {offset: number}) => void;
};
type ReactionListContextType = RefObject<ReactionListRef | null> | null;

const ActionListContext = createContext<ActionListContextType>({flatListRef: null, scrollPosition: null, setScrollPosition: () => {}});
const ReactionListContext = createContext<ReactionListContextType>(null);

export {ActionListContext, ReactionListContext};
export type {ReactionListRef, ActionListContextType, FlatListRefType, ReactionListAnchor, ReactionListEvent, ScrollPosition};
