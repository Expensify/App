// this whole file is just for other platforms
// iOS version has everything implemented
import type {PropsWithChildren} from 'react';
import React, {forwardRef} from 'react';
import type {ScrollViewProps} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {ScrollView} from 'react-native';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';

const ActionSheetAwareScrollView = forwardRef<ScrollView, PropsWithChildren<ScrollViewProps>>((props, ref) => (
    <ScrollView
        ref={ref}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </ScrollView>
));

export default ActionSheetAwareScrollView;

/**
 * This is only used on iOS. On other platforms it's just undefined to be pass a prop to FlatList
 *
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */
const renderScrollComponent = undefined;

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
