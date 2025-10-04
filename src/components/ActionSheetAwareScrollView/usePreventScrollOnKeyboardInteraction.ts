import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef} from 'react-native-reanimated';
import {scrollTo, useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

function usePreventScrollOnKeyboardInteraction({scrollViewRef}: {scrollViewRef: AnimatedRef<Reanimated.ScrollView>}) {
    // Receive the latest scroll position whenever the content is scrolled
    const scroll = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
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

    return {onScroll};
}

export default usePreventScrollOnKeyboardInteraction;
