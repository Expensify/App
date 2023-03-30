// this whole file is just for other platforms
// iOS version has everything implemented
import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native';
import {
    Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider,
} from './ActionSheetAwareScrollViewContext';

const ActionSheetAwareScrollView = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScrollView ref={ref} {...props}>
        {props.children}
    </ScrollView>
));

ActionSheetAwareScrollView.defaultProps = {
    children: null,
};

ActionSheetAwareScrollView.propTypes = {
    children: PropTypes.node,
};

export default ActionSheetAwareScrollView;

/**
 * This is only used on iOS. On other platforms it's just undefined to be pass a prop to FlatList
 *
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */
const renderScrollComponent = undefined;

export {
    renderScrollComponent,
    ActionSheetAwareScrollViewContext,
    ActionSheetAwareScrollViewProvider,
    Actions,
};
