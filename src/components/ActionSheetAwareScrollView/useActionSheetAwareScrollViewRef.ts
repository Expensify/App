import {useCallback} from 'react';
import type Reanimated from 'react-native-reanimated';
import {useAnimatedRef} from 'react-native-reanimated';
import type {ActionSheetAwareScrollViewHandle} from './types';

function useActionSheetAwareScrollViewRef(forwardedRef: React.ForwardedRef<ActionSheetAwareScrollViewHandle>) {
    const animatedRef = useAnimatedRef<Reanimated.ScrollView>();

    const onRef = useCallback(
        (assignedRef: Reanimated.ScrollView) => {
            if (typeof forwardedRef === 'function') {
                forwardedRef(assignedRef);
            } else if (forwardedRef) {
                // eslint-disable-next-line no-param-reassign, react-compiler/react-compiler
                forwardedRef.current = assignedRef;
            }

            animatedRef(assignedRef);
        },
        [forwardedRef, animatedRef],
    );

    return {onRef, animatedRef};
}

export default useActionSheetAwareScrollViewRef;
