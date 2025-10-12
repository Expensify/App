import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef} from 'react-native-reanimated';
import {scrollTo, useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

function usePreventScrollOnKeyboardInteraction({scrollViewRef, enabled = false}: {scrollViewRef: AnimatedRef<Reanimated.ScrollView>; enabled?: boolean}) {
    // Receive the latest scroll position whenever the content is scrolled
    const scroll = useSharedValue(0);
    const preventScrollOnKeyboardInteraction = useAnimatedScrollHandler({
        onScroll: enabled
            ? (e) => {
                  scroll.set(e.contentOffset.y);
              }
            : undefined,
    });

    // Scroll to the latest scroll position whenever the keyboard is interacted with,
    // to prevent additional scrolling when the keyboard is interactively dismissed.
    useKeyboardHandler({
        onInteractive: enabled
            ? () => {
                  scrollTo(scrollViewRef, 0, scroll.get(), false);
              }
            : undefined,
    });

    return preventScrollOnKeyboardInteraction;
}

export default usePreventScrollOnKeyboardInteraction;
