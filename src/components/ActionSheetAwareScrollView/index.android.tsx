import React from 'react';
import Reanimated from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

function ActionSheetAwareScrollView({style, children, ref, ...restProps}: ActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={onRef}
            style={style}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
const renderScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
