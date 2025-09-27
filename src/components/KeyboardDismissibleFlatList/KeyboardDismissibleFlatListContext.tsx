import type {PropsWithChildren} from 'react';
import React, {useMemo, useState} from 'react';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type KeyboardDismissibleFlatListContextValues = {
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    scrollY: SharedValue<number>;
    setListBehavior: React.Dispatch<React.SetStateAction<'regular' | 'inverted'>>;
};

const createDummySharedValue = (): SharedValue<number> =>
    ({
        value: 0,
        addListener: () => 0,
        removeListener: () => {},
        modify: () => {},
    }) as unknown as SharedValue<number>;

const KeyboardDismissibleFlatListContext = React.createContext<KeyboardDismissibleFlatListContextValues>({
    keyboardHeight: createDummySharedValue(),
    keyboardOffset: createDummySharedValue(),
    scrollY: createDummySharedValue(),
    onScroll: () => {},
    contentSizeHeight: createDummySharedValue(),
    layoutMeasurementHeight: createDummySharedValue(),
    setListBehavior: () => {},
});

function KeyboardDismissibleFlatListContextProvider({children}: PropsWithChildren) {
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: false});
    const isModalVisible = useMemo(() => modal?.isPopover, [modal?.isPopover]);

    const [listBehavior, setListBehavior] = useState<'regular' | 'inverted'>('inverted');

    const height = useSharedValue(0);
    const offset = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const keyboardOpenedHeight = useSharedValue(0);
    const contentSizeHeight = useSharedValue(0);
    const layoutMeasurementHeight = useSharedValue(0);

    useKeyboardHandler({
        onStart: (e) => {
            'worklet';

            const scrollYValueAtStart = scrollY.get();
            const prevHeight = height.get();

            height.set(e.height);

            const willKeyboardOpen = e.progress === 1;

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

            if (listBehavior === 'regular') {
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

            if (listBehavior === 'regular') {
                return offset.set(scrollY.get() - e.height);
            }

            offset.set(scrollY.get() + e.height);
        },
        onMove: (e) => {
            'worklet';

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

    const value = useMemo<KeyboardDismissibleFlatListContextValues>(
        () => ({
            keyboardHeight: height,
            keyboardOffset: offset,
            onScroll,
            scrollY,
            contentSizeHeight,
            layoutMeasurementHeight,
            setListBehavior,
        }),
        [height, offset, onScroll, scrollY, contentSizeHeight, layoutMeasurementHeight],
    );

    return <KeyboardDismissibleFlatListContext.Provider value={value}>{children}</KeyboardDismissibleFlatListContext.Provider>;
}

KeyboardDismissibleFlatListContextProvider.displayName = 'KeyboardDismissibleFlatListContextProvider';

export {KeyboardDismissibleFlatListContext, KeyboardDismissibleFlatListContextProvider};
