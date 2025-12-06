import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ListBehavior = ValueOf<typeof CONST.LIST_BEHAVIOR>;

type KeyboardDismissibleFlatListContextValue = {
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    scrollY: SharedValue<number>;
    setListBehavior: React.Dispatch<React.SetStateAction<ListBehavior>>;
};

// eslint-disable-next-line import/prefer-default-export
export type {KeyboardDismissibleFlatListContextValue, ListBehavior};
