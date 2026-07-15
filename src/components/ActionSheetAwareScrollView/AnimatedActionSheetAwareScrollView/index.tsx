import useActionSheetAwareScrollViewRef from '@components/ActionSheetAwareScrollView/useActionSheetAwareScrollViewRef';

// The action sheet is only used on native platforms (iOS and Android)
// On all other platforms, the action sheet is implemented using the Animated.ScrollView
import React from 'react';
import Reanimated from 'react-native-reanimated';

import type AnimatedActionSheetAwareScrollViewProps from './types';

function AnimatedActionSheetAwareScrollView({children, ref, ...restProps}: AnimatedActionSheetAwareScrollViewProps) {
    const {onRef} = useActionSheetAwareScrollViewRef(ref);

    return (
        <Reanimated.ScrollView
            {...restProps}
            ref={onRef}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

export default AnimatedActionSheetAwareScrollView;
