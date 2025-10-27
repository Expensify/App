import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef} from 'react-native-reanimated';
import {scrollTo, useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

type UsePreventScrollOnKeyboardInteractionProps = {
    scrollViewRef: AnimatedRef<Reanimated.ScrollView>;
    enabled?: boolean;
};

function usePreventScrollOnKeyboardInteraction({scrollViewRef, enabled = false}: UsePreventScrollOnKeyboardInteractionProps) {
    // Receive the latest scroll position whenever the content is scrolled
    const scroll = useSharedValue(0);
    const preventScrollOnKeyboardInteraction = useAnimatedScrollHandler({
        onScroll: (e) => {
            if (!enabled) {
                return;
            }

            scroll.set(e.contentOffset.y);
        },
    });

    // Scroll to the latest scroll position whenever the keyboard is interacted with,
    // to prevent additional scrolling when the keyboard is interactively dismissed.
    useKeyboardHandler({
        onInteractive: () => {
            'worklet';

            if (!enabled) {
                return;
            }

            scrollTo(scrollViewRef, 0, scroll.get(), false);
        },
    });

    return enabled ? preventScrollOnKeyboardInteraction : null;
}

export default usePreventScrollOnKeyboardInteraction;
