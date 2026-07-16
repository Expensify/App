import type CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';
import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type ListBehavior = ValueOf<typeof CONST.LIST_BEHAVIOR>;

type KeyboardDismissibleFlatListStateContextValue = {
    composerHeight: number;
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    scrollY: SharedValue<number>;
};

type KeyboardDismissibleFlatListActionsContextValue = {
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    setListBehavior: React.Dispatch<React.SetStateAction<ListBehavior>>;
    onComposerLayout: (e: LayoutChangeEvent) => void;
};

type KeyboardDismissibleFlatListContextValue = KeyboardDismissibleFlatListStateContextValue & KeyboardDismissibleFlatListActionsContextValue;

export type {KeyboardDismissibleFlatListContextValue, KeyboardDismissibleFlatListStateContextValue, KeyboardDismissibleFlatListActionsContextValue, ListBehavior};
