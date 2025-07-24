// this whole file is just for other platforms
// iOS version has everything implemented
import type {ReactNode} from 'react';
import React, {forwardRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {AnimatedScrollViewProps, SharedValue} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import type {AnimatedScrollView} from 'react-native-reanimated/lib/typescript/component/ScrollView';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';

type PropsWithAnimatedChildren = AnimatedScrollViewProps & {
    children?: ReactNode | SharedValue<ReactNode>;
};

const ActionSheetAwareScrollView = forwardRef<AnimatedScrollView, PropsWithAnimatedChildren>((props, ref) => (
    <Animated.ScrollView
        ref={ref}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </Animated.ScrollView>
));

export default ActionSheetAwareScrollView;

/**
 * The bottom spacing config for this action sheet is only used on Android and iOS. On other platforms,
 * this component will be a default Animated.Scrollview, because the onScroll handler used is from Reanimated.
 *
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */

function renderScrollComponent(props: PropsWithAnimatedChildren) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
