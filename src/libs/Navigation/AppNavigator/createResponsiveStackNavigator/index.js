import * as React from 'react';
import PropTypes from 'prop-types';
import {useNavigationBuilder, createNavigatorFactory, StackRouter} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import ThreePaneView from './ThreePaneView';

const propTypes = {
    isNarrowLayout: PropTypes.bool.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,
    initialRouteName: PropTypes.oneOf([PropTypes.string, PropTypes.undefined]),
};

const defaultProps = {
    initialRouteName: undefined,
};

function ResponsiveStackNavigator(props) {
    const {
        navigation, state, descriptors, NavigationContent,
    } = useNavigationBuilder(StackRouter, {
        children: props.children,
        // eslint-disable-next-line react/prop-types
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    if (props.isNarrowLayout) {
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
    return (
        <NavigationContent>
            <ThreePaneView
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
