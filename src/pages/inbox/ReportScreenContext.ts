import type {RefObject, SyntheticEvent} from 'react';
import {createContext} from 'react';
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
    flatListRef: FlatListRefType;
    scrollPositionRef: RefObject<ScrollPosition>;
    scrollOffsetRef: RefObject<number>;
};

const ActionListContext = createContext<ActionListContextType>({flatListRef: null, scrollPositionRef: {current: {}}, scrollOffsetRef: {current: 0}});
const ReactionListContext = createContext<ReactionListContextType>({
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
});

export {ActionListContext, ReactionListContext};
export type {ReactionListContextType, ActionListContextType, FlatListRefType, ReactionListAnchor, ReactionListEvent, ScrollPosition};
