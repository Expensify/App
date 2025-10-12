import {useCallback} from 'react';
import type Reanimated from 'react-native-reanimated';
import {useAnimatedRef} from 'react-native-reanimated';
import type {ActionSheetAwareScrollViewHandle} from './types';

function useActionSheetAwareScrollViewRef(ref: React.ForwardedRef<ActionSheetAwareScrollViewHandle>) {
    const animatedRef = useAnimatedRef<Reanimated.ScrollView>();

    const onRef = useCallback(
        (assignedRef: Reanimated.ScrollView) => {
            if (typeof ref === 'function') {
                ref(assignedRef);
            } else if (ref) {
                // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
                ref.current = assignedRef;
            }

            animatedRef(assignedRef);
        },
        [ref, animatedRef],
    );

    return {onRef, animatedRef};
}

export default useActionSheetAwareScrollViewRef;
