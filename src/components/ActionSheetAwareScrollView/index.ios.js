import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native';
import ActionSheetKeyboardSpace from './ActionSheetKeyboardSpace';
import {
    Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider,
} from './ActionSheetAwareScrollViewContext';

const ActionSheetAwareScrollView = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScrollView ref={ref} {...props}>
        <ActionSheetKeyboardSpace>
            {props.children}
        </ActionSheetKeyboardSpace>
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
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */
function renderScrollComponent(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {
    renderScrollComponent,
    ActionSheetAwareScrollViewContext,
    ActionSheetAwareScrollViewProvider,
    Actions,
};
