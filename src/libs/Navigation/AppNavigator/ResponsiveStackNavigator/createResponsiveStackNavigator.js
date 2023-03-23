import * as React from 'react';
import {useNavigationBuilder, createNavigatorFactory, StackRouter} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import WideView from './WideView';

// TODO-NR prop types

function ResponsiveStackNavigator(props) {
    const {
        navigation, state, descriptors, NavigationContent,
    } = useNavigationBuilder(StackRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    if (props.isNarrowLayout) {
        return (
            <NavigationContent>
                <StackView
                    // TODO-NR should really props spreading be forbidden? There are stuff you can't do without it 
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
            <WideView
                {...props}
                state={state}
                descriptors={descriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}

ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
