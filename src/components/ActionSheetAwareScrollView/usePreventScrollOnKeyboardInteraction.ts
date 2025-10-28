import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef} from 'react-native-reanimated';
import {scrollTo, useScrollViewOffset} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

type UsePreventScrollOnKeyboardInteractionProps = {
    scrollViewRef: AnimatedRef<Reanimated.ScrollView>;
    enabled?: boolean;
};

function usePreventScrollOnKeyboardInteraction({scrollViewRef, enabled = false}: UsePreventScrollOnKeyboardInteractionProps) {
    const scrollOffset = useScrollViewOffset(scrollViewRef);

    // Scroll to the latest scroll position whenever the keyboard is interacted with,
    // to prevent additional scrolling when the keyboard is interactively dismissed.
    useKeyboardHandler({
        onInteractive: () => {
            'worklet';

            if (!enabled) {
                return;
            }

            scrollTo(scrollViewRef, 0, scrollOffset.get(), false);
        },
    });
}

export default usePreventScrollOnKeyboardInteraction;
