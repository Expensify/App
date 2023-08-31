import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useNavigationBuilder, createNavigatorFactory} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import CustomRouter from './CustomRouter';

const propTypes = {
    /* Determines if the navigator should render the StackView (narrow) or ThreePaneView (wide) */
    isSmallScreenWidth: PropTypes.bool.isRequired,

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
    const isSmallScreenWidthRef = useRef(props.isSmallScreenWidth);
    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
        getIsSmallScreenWidth: () => isSmallScreenWidthRef.current,
    });

    // Options for useNavigationBuilder won't update on prop change, so we need to pass a getter for the router to have the current state of isSmallScreenWidth.
    isSmallScreenWidthRef.current = props.isSmallScreenWidth;

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
