import type {ReactNode} from 'react';
import React, {forwardRef, useCallback} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {AnimatedScrollViewProps, SharedValue} from 'react-native-reanimated';
import Reanimated, {useAnimatedRef, useScrollViewOffset} from 'react-native-reanimated';
import type {AnimatedScrollView} from 'react-native-reanimated/lib/typescript/component/ScrollView';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import useActionSheetKeyboardSpace from './useActionSheetKeyboardSpace';

type PropsWithAnimatedChildren = AnimatedScrollViewProps & {
    children?: ReactNode | SharedValue<ReactNode>;
};

const ActionSheetAwareScrollView = forwardRef<AnimatedScrollView, PropsWithAnimatedChildren>(({style, children, ...rest}, ref) => {
    const scrollViewAnimatedRef = useAnimatedRef<Reanimated.ScrollView>();
    const position = useScrollViewOffset(scrollViewAnimatedRef);

    const onRef = useCallback(
        (assignedRef: Reanimated.ScrollView) => {
            if (typeof ref === 'function') {
                ref(assignedRef);
            } else if (ref) {
                // eslint-disable-next-line no-param-reassign
                ref.current = assignedRef;
            }

            scrollViewAnimatedRef(assignedRef);
        },
        [ref, scrollViewAnimatedRef],
    );

    const {animatedStyle} = useActionSheetKeyboardSpace({position});

    return (
        <Reanimated.ScrollView
            ref={onRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            style={[style, animatedStyle]}
        >
            {children}
        </Reanimated.ScrollView>
    );
});

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
function renderScrollComponent(props: PropsWithAnimatedChildren) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
