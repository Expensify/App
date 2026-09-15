import {useEffect} from 'react';

import type UseRemoveNonInteractiveClickHandler from './types';

/**
 * react-native-web's Pressable always passes an `onClick` prop to the DOM element, even without an `onPress`, which
 * makes React DOM set `element.onclick` to a noop. TalkBack on Android web reads that as clickable and announces
 * "double tap to activate" on non-interactive elements. Clearing it is safe - React dispatches real clicks through
 * its own delegated listener on the root container.
 */
const useRemoveNonInteractiveClickHandler: UseRemoveNonInteractiveClickHandler = (ref, isInteractive) => {
    // Must stay passive: `PressableWithSecondaryInteraction` (web) forwards its ref in its own passive effect, so at
    // layout-effect time `ref.current` is still null and this silently no-ops. Passive effects flush child-first.
    // Nothing here is visible to paint, so there is no flicker argument for `useLayoutEffect`.
    useEffect(() => {
        const element = ref.current;
        if (isInteractive || !(element instanceof HTMLElement)) {
            return;
        }
        element.onclick = null;
    }, [ref, isInteractive]);
};

export default useRemoveNonInteractiveClickHandler;
