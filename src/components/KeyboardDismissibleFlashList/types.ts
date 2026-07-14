import type CONST from '@src/CONST';

import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type ListBehavior = ValueOf<typeof CONST.LIST_BEHAVIOR>;

type KeyboardDismissibleFlashListStateContextValue = {
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    scrollY: SharedValue<number>;
};

type KeyboardDismissibleFlashListActionsContextValue = {
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    setListBehavior: React.Dispatch<React.SetStateAction<ListBehavior>>;
};

type KeyboardDismissibleFlashListContextValue = KeyboardDismissibleFlashListStateContextValue & KeyboardDismissibleFlashListActionsContextValue;

export type {KeyboardDismissibleFlashListContextValue, KeyboardDismissibleFlashListStateContextValue, KeyboardDismissibleFlashListActionsContextValue, ListBehavior};
