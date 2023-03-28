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
import getComponentDisplayName from '../../libs/getComponentDisplayName';

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

/**
 * This is used only on iOS. On other platforms this will be no-op functions.
 *
 * A HOC that provides the ActionSheetAwareScrollViewContext to the wrapped component.
 * Context will include:
 * - currentActionSheetState - the current state of the state machine
 * - transitionActionSheetState - a function to transition the state machine
 * - transitionActionSheetStateWorklet - a worklet function to transition the state machine
 * - resetStateMachine - a function to reset the state machine to the initial state
 *
 * @param {React.Component} WrappedComponent
 * @returns {React.Component} A wrapped component that has the ActionSheetAwareScrollViewContext
 */
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
    ActionSheetAwareScrollViewProvider,
    ActionSheetAwareScrollViewContext,
    withActionSheetAwareScrollViewContext,
};
