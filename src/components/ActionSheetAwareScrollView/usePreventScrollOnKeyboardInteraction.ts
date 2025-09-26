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
    const scroll = useSharedValue(0);

    useKeyboardHandler({
        onInteractive: () => {
            scrollTo(scrollViewRef, 0, scroll.get(), false);
        },
    });

    const onScrollInternal = useAnimatedScrollHandler({
        onScroll: (e) => {
            scroll.set(e.contentOffset.y);
        },
    });

    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

    return {scrollViewRef, onScroll};
}

export default usePreventScrollOnKeyboardInteraction;
