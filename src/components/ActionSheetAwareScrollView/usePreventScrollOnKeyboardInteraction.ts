import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef, ScrollHandlerProcessed} from 'react-native-reanimated';
import {scrollTo, useAnimatedScrollHandler, useComposedEventHandler, useSharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

function usePreventScrollOnKeyboardInteraction({
    scrollViewRef,
    onScroll: onScrollProp,
}: {
    scrollViewRef: AnimatedRef<Reanimated.ScrollView>;
    onScroll?: ScrollHandlerProcessed<Record<string, unknown>>;
}) {
    // Receive the latest scroll position whenever the content is scrolled
    const scroll = useSharedValue(0);
    const onScrollInternal = useAnimatedScrollHandler({
        onScroll: (e) => {
            scroll.set(e.contentOffset.y);
        },
    });

    // Scroll to the latest scroll position whenever the keyboard is interacted with,
    // to prevent additional scrolling when the keyboard is interactively dismissed.
    useKeyboardHandler({
        onInteractive: () => {
            scrollTo(scrollViewRef, 0, scroll.get(), false);
        },
    });

    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

    return {onScroll};
}

export default usePreventScrollOnKeyboardInteraction;
