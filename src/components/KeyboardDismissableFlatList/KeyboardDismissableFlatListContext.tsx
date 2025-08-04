import PropTypes from 'prop-types';
import type {PropsWithChildren} from 'react';
import React, {useContext, useMemo} from 'react';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import type {ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type KeyboardDismissableFlatListContextValues = {
    keyboardHeight: SharedValue<number>;
    keyboardOffset: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
    scrollY: SharedValue<number>;
};

const createDummySharedValue = (): SharedValue<number> =>
    ({
        value: 0,
        addListener: () => 0,
        removeListener: () => {},
        modify: () => {},
    }) as unknown as SharedValue<number>;

const KeyboardDismissableFlatListContext = React.createContext<KeyboardDismissableFlatListContextValues>({
    keyboardHeight: createDummySharedValue(),
    keyboardOffset: createDummySharedValue(),
    scrollY: createDummySharedValue(),
    onScroll: () => {},
    contentSizeHeight: createDummySharedValue(),
    layoutMeasurementHeight: createDummySharedValue(),
});

function KeyboardDismissableFlatListContextProvider(props: PropsWithChildren) {
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: false});
    const isModalVisible = useMemo(() => modal?.isPopover, [modal?.isPopover]);

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

            // Preserve the current scroll position the the keyboard starts its movement
            offset.set(scrollYValueAtStart + prevHeight);
        },
        onInteractive: (e) => {
            'worklet';

            height.set(e.height);
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

    const value = useMemo<KeyboardDismissableFlatListContextValues>(
        () => ({
            keyboardHeight: height,
            keyboardOffset: offset,
            onScroll,
            scrollY,
            contentSizeHeight,
            layoutMeasurementHeight,
        }),
        [height, offset, onScroll, scrollY, contentSizeHeight, layoutMeasurementHeight],
    );

    return <KeyboardDismissableFlatListContext.Provider value={value}>{props.children}</KeyboardDismissableFlatListContext.Provider>;
}

function useKeyboardDismissableFlatListContext() {
    return useContext(KeyboardDismissableFlatListContext);
}

KeyboardDismissableFlatListContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export {KeyboardDismissableFlatListContext, KeyboardDismissableFlatListContextProvider, useKeyboardDismissableFlatListContext};
