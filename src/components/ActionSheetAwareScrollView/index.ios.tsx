import type { PropsWithChildren} from 'react';
import React, {forwardRef} from 'react';

import type { ScrollViewProps} from 'react-native';
import {ScrollView} from 'react-native';
import ActionSheetKeyboardSpace from './ActionSheetKeyboardSpace';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';

const ActionSheetAwareScrollView = forwardRef<ScrollView, PropsWithChildren<ScrollViewProps>>((props, ref) => (
    <ScrollView
        ref={ref}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        <ActionSheetKeyboardSpace>
            {props.children}
        </ActionSheetKeyboardSpace>
    </ScrollView>
));

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
function renderScrollComponent(props: ScrollViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
