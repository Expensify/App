import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ListBehavior = ValueOf<typeof CONST.LIST_BEHAVIOR>;

type KeyboardDismissibleFlatListStateContextValue = {
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    scrollY: SharedValue<number>;
};

type KeyboardDismissibleFlatListActionsContextValue = {
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    setListBehavior: React.Dispatch<React.SetStateAction<ListBehavior>>;
};

type KeyboardDismissibleFlatListContextValue = KeyboardDismissibleFlatListStateContextValue & KeyboardDismissibleFlatListActionsContextValue;

// eslint-disable-next-line import/prefer-default-export
export type {KeyboardDismissibleFlatListContextValue, KeyboardDismissibleFlatListStateContextValue, KeyboardDismissibleFlatListActionsContextValue, ListBehavior};
