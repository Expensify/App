import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import CustomRouter from './CustomRouter';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

const propTypes = {
    /* Determines if the navigator should render the StackView (narrow) or ThreePaneView (wide) */
    shouldUseNarrowLayout: PropTypes.bool.isRequired,

    /* Children for the useNavigationBuilder hook */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /* initialRouteName for this navigator */
    initialRouteName: PropTypes.oneOf([PropTypes.string, PropTypes.undefined]),

    /* Screen options defined for this navigator */
    // eslint-disable-next-line react/forbid-prop-types
    screenOptions: PropTypes.object,
};

const defaultProps = {
    initialRouteName: undefined,
    screenOptions: undefined,
};

function ResponsiveStackNavigator(props) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const shouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);

    shouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
        // Options for useNavigationBuilder won't update on prop change, so we need to pass a getter for the router to have the current state of shouldUseNarrowLayout.
        getShouldUseNarrowLayout: () => shouldUseNarrowLayoutRef.current,
    });

    return (
        <NavigationContent>
            <StackView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                state={state}
                descriptors={descriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}

ResponsiveStackNavigator.defaultProps = defaultProps;
ResponsiveStackNavigator.propTypes = propTypes;
ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
