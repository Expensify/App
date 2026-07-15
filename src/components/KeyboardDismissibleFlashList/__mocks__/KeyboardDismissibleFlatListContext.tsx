import type {
    KeyboardDismissibleFlashListActionsContextValue,
    KeyboardDismissibleFlashListContextValue,
    KeyboardDismissibleFlashListStateContextValue,
} from '@components/KeyboardDismissibleFlashList/types';

import type {PropsWithChildren} from 'react';

import {createContext, useContext} from 'react';

import createSharedValueMock from '../../../../tests/utils/createSharedValueMock';

const mockStateValue: KeyboardDismissibleFlashListStateContextValue = {
    keyboardHeight: createSharedValueMock(0),
    keyboardOffset: createSharedValueMock(0),
    scrollY: createSharedValueMock(0),
    contentSizeHeight: createSharedValueMock(0),
    layoutMeasurementHeight: createSharedValueMock(0),
};

const mockActionsValue: KeyboardDismissibleFlashListActionsContextValue = {
    onScroll: () => {},
    setListBehavior: () => {},
};

const KeyboardDismissibleFlashListStateContext = createContext<KeyboardDismissibleFlashListStateContextValue>(mockStateValue);
const KeyboardDismissibleFlashListActionsContext = createContext<KeyboardDismissibleFlashListActionsContextValue>(mockActionsValue);

function KeyboardDismissibleFlashListContextProvider({children}: PropsWithChildren) {
    return (
        <KeyboardDismissibleFlashListActionsContext.Provider value={mockActionsValue}>
            <KeyboardDismissibleFlashListStateContext.Provider value={mockStateValue}>{children}</KeyboardDismissibleFlashListStateContext.Provider>
        </KeyboardDismissibleFlashListActionsContext.Provider>
    );
}

function useKeyboardDismissibleFlashListState(): KeyboardDismissibleFlashListStateContextValue {
    return useContext(KeyboardDismissibleFlashListStateContext);
}

function useKeyboardDismissibleFlashListActions(): KeyboardDismissibleFlashListActionsContextValue {
    return useContext(KeyboardDismissibleFlashListActionsContext);
}

const mockContextValue: KeyboardDismissibleFlashListContextValue = {...mockStateValue, ...mockActionsValue};

export {KeyboardDismissibleFlashListContextProvider, useKeyboardDismissibleFlashListState, useKeyboardDismissibleFlashListActions, mockContextValue};
