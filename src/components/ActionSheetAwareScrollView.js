// this whole file is just for other platforms
// iOS version has everything implemented
import React, {
    createContext, forwardRef, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native';
import {
    useWorkletCallback,
} from 'react-native-reanimated';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const ActionSheetAwareScrollViewContext = createContext();
function ActionSheetAwareScrollViewProvider(props) {
    const initialState = {
        previous: null,
        current: {
            state: 'idle',
            payload: null,
        },
    };

    const transitionActionSheetStateWorklet = useWorkletCallback(() => {});

    const value = useMemo(() => ({
        currentActionSheetState: initialState,
        transitionActionSheetState: () => {},
        transitionActionSheetStateWorklet,
        resetStateMachine: () => {},
    }), []);

    return (
        <ActionSheetAwareScrollViewContext.Provider
            value={value}
        >
            {props.children}
        </ActionSheetAwareScrollViewContext.Provider>
    );
}

ActionSheetAwareScrollViewProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

function withActionSheetAwareScrollViewContext(WrappedComponent) {
    const WithActionSheetAwareScrollViewContext = forwardRef((props, ref) => (
        <ActionSheetAwareScrollViewContext.Consumer>
            {context => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...context} {...props} ref={ref} />
            )}
        </ActionSheetAwareScrollViewContext.Consumer>
    ));

    WithActionSheetAwareScrollViewContext.displayName = `withActionSheetAwareScrollViewContext(${getComponentDisplayName(WrappedComponent)})`;

    return WithActionSheetAwareScrollViewContext;
}
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

// mock
const renderScrollComponent = undefined;

export {
    renderScrollComponent,
    ActionSheetAwareScrollViewProvider,
    ActionSheetAwareScrollViewContext,
    withActionSheetAwareScrollViewContext,
};
