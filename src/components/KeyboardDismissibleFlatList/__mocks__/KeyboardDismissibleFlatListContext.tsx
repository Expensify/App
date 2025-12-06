import type {PropsWithChildren} from 'react';
import {createContext} from 'react';
import type {KeyboardDismissibleFlatListContextValue} from '@components/KeyboardDismissibleFlatList/types';
import createSharedValueMock from '../../../../tests/utils/createSharedValueMock';

const mockSharedValue: KeyboardDismissibleFlatListContextValue = {
    keyboardHeight: createSharedValueMock(0),
    keyboardOffset: createSharedValueMock(0),
    scrollY: createSharedValueMock(0),
    onScroll: () => {},
    contentSizeHeight: createSharedValueMock(0),
    layoutMeasurementHeight: createSharedValueMock(0),
    setListBehavior: () => {},
};

const KeyboardDismissibleFlatListContext = createContext<KeyboardDismissibleFlatListContextValue>(mockSharedValue);

function KeyboardDismissibleFlatListContextProvider({children}: PropsWithChildren) {
    return <KeyboardDismissibleFlatListContext.Provider value={mockSharedValue}>{children}</KeyboardDismissibleFlatListContext.Provider>;
}

export {KeyboardDismissibleFlatListContext, KeyboardDismissibleFlatListContextProvider};
