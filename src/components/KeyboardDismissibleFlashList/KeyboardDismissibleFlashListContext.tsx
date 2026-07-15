import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createDummySharedValue from '@src/utils/createDummySharedValue';

import type {PropsWithChildren} from 'react';

import React, {createContext, useContext, useState} from 'react';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';

import type {KeyboardDismissibleFlashListActionsContextValue, KeyboardDismissibleFlashListStateContextValue, ListBehavior} from './types';

const defaultStateValue: KeyboardDismissibleFlashListStateContextValue = {
    keyboardHeight: createDummySharedValue(0),
    keyboardOffset: createDummySharedValue(0),
    scrollY: createDummySharedValue(0),
    contentSizeHeight: createDummySharedValue(0),
    layoutMeasurementHeight: createDummySharedValue(0),
};

const defaultActionsValue: KeyboardDismissibleFlashListActionsContextValue = {
    onScroll: () => {},
    setListBehavior: () => {},
};

const KeyboardDismissibleFlashListStateContext = createContext<KeyboardDismissibleFlashListStateContextValue>(defaultStateValue);

const KeyboardDismissibleFlashListActionsContext = createContext<KeyboardDismissibleFlashListActionsContextValue>(defaultActionsValue);

function KeyboardDismissibleFlashListContextProvider({children}: PropsWithChildren) {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isModalVisible = !!modal?.isPopover;

    const [listBehavior, setListBehavior] = useState<ListBehavior>(CONST.LIST_BEHAVIOR.INVERTED);

    const height = useSharedValue(0);
    const offset = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const keyboardOpenedHeight = useSharedValue(0);
    const contentSizeHeight = useSharedValue(0);
    const layoutMeasurementHeight = useSharedValue(0);

    const isKeyboardOpening = useSharedValue(false);

    useKeyboardHandler({
        onStart: (e) => {
            'worklet';

            const scrollYValueAtStart = scrollY.get();
            const prevHeight = height.get();

            const willKeyboardOpen = e.progress === 1;
            isKeyboardOpening.set(willKeyboardOpen);

            if (willKeyboardOpen) {
                if (e.height > 0) {
                    keyboardOpenedHeight.set(e.height);
                }

                // Do nothing when the keyboard opens again after the modal closes, since the current position is preserved
                if (isModalVisible) {
                    return;
                }
            }

            if (isModalVisible) {
                // Since the keyboard will close immediately when a modal opens, this is to preserve the current scroll position before it closes
                offset.set(scrollYValueAtStart + keyboardOpenedHeight.get());
                return;
            }

            if (listBehavior === CONST.LIST_BEHAVIOR.REGULAR) {
                const isAtTop = scrollY.get() <= 0;

                if (!willKeyboardOpen && isAtTop) {
                    return offset.set(0);
                }

                return offset.set(scrollYValueAtStart - prevHeight);
            }

            const invertedListVisualTop = contentSizeHeight.get() - layoutMeasurementHeight.get();

            const isAtTop = scrollY.get() >= invertedListVisualTop;

            if (!willKeyboardOpen && isAtTop) {
                return offset.set(invertedListVisualTop);
            }

            // Preserve the current scroll position the the keyboard starts its movement
            offset.set(scrollYValueAtStart + prevHeight);
        },
        onInteractive: (e) => {
            'worklet';

            height.set(e.height);

            if (listBehavior === CONST.LIST_BEHAVIOR.REGULAR) {
                return offset.set(scrollY.get() - e.height);
            }

            offset.set(scrollY.get() + e.height);
        },
        onMove: (e) => {
            'worklet';

            // This is to fix an issue with react-native-keyboard-controller, where an `onMove` event is triggered with an invalid height value when the keyboard is opened
            // react-native-keyboard-controller issue: https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1298
            if (isKeyboardOpening.get() && e.height < height.get()) {
                return;
            }

            height.set(e.height);
        },
        onEnd: (e) => {
            'worklet';

            height.set(e.height);
        },
    });

    const onScroll = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollY.set(e.contentOffset.y);
            contentSizeHeight.set(e.contentSize.height);
            layoutMeasurementHeight.set(e.layoutMeasurement.height);
        },
    });

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue: KeyboardDismissibleFlashListStateContextValue = {
        keyboardHeight: height,
        keyboardOffset: offset,
        scrollY,
        contentSizeHeight,
        layoutMeasurementHeight,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue: KeyboardDismissibleFlashListActionsContextValue = {onScroll, setListBehavior};

    return (
        <KeyboardDismissibleFlashListActionsContext.Provider value={actionsValue}>
            <KeyboardDismissibleFlashListStateContext.Provider value={stateValue}>{children}</KeyboardDismissibleFlashListStateContext.Provider>
        </KeyboardDismissibleFlashListActionsContext.Provider>
    );
}

function useKeyboardDismissibleFlashListState(): KeyboardDismissibleFlashListStateContextValue {
    return useContext(KeyboardDismissibleFlashListStateContext);
}

function useKeyboardDismissibleFlashListActions(): KeyboardDismissibleFlashListActionsContextValue {
    return useContext(KeyboardDismissibleFlashListActionsContext);
}

export {KeyboardDismissibleFlashListContextProvider, useKeyboardDismissibleFlashListState, useKeyboardDismissibleFlashListActions};
