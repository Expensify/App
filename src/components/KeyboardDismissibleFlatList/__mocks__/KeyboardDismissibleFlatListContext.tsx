import type {PropsWithChildren} from 'react';
import {createContext, useContext} from 'react';
import type {
    KeyboardDismissibleFlatListActionsContextValue,
    KeyboardDismissibleFlatListContextValue,
    KeyboardDismissibleFlatListStateContextValue,
} from '@components/KeyboardDismissibleFlatList/types';
import createSharedValueMock from '../../../../tests/utils/createSharedValueMock';

const mockStateValue: KeyboardDismissibleFlatListStateContextValue = {
    keyboardHeight: createSharedValueMock(0),
    keyboardOffset: createSharedValueMock(0),
    scrollY: createSharedValueMock(0),
    contentSizeHeight: createSharedValueMock(0),
    layoutMeasurementHeight: createSharedValueMock(0),
};

const mockActionsValue: KeyboardDismissibleFlatListActionsContextValue = {
    onScroll: () => {},
    setListBehavior: () => {},
};

const KeyboardDismissibleFlatListStateContext = createContext<KeyboardDismissibleFlatListStateContextValue>(mockStateValue);
const KeyboardDismissibleFlatListActionsContext = createContext<KeyboardDismissibleFlatListActionsContextValue>(mockActionsValue);

function KeyboardDismissibleFlatListContextProvider({children}: PropsWithChildren) {
    return (
        <KeyboardDismissibleFlatListActionsContext.Provider value={mockActionsValue}>
            <KeyboardDismissibleFlatListStateContext.Provider value={mockStateValue}>{children}</KeyboardDismissibleFlatListStateContext.Provider>
        </KeyboardDismissibleFlatListActionsContext.Provider>
    );
}

function useKeyboardDismissibleFlatListState(): KeyboardDismissibleFlatListStateContextValue {
    return useContext(KeyboardDismissibleFlatListStateContext);
}

function useKeyboardDismissibleFlatListActions(): KeyboardDismissibleFlatListActionsContextValue {
    return useContext(KeyboardDismissibleFlatListActionsContext);
}

const mockContextValue: KeyboardDismissibleFlatListContextValue = {...mockStateValue, ...mockActionsValue};

export {KeyboardDismissibleFlatListContextProvider, useKeyboardDismissibleFlatListState, useKeyboardDismissibleFlatListActions, mockContextValue};
