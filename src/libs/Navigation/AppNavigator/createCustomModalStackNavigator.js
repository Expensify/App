import _ from 'underscore';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import {StackView} from '@react-navigation/stack';
import ClickAwayHandler from './ClickAwayHandler';

const propTypes = {
    children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react/destructuring-assignment
const CustomRootStackNavigator = ({
    children,
    screenListeners,
    ...rest
}) => {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        children, screenListeners,
    });
    console.log('CustomRootStackNavigator rest', rest);
    console.log('CustomRootStackNavigator rest', rest);

    useEffect(() => {
        console.log('CustomRootStackNavigator screenListeners state', navigation);
        // This navigation doesn't have addListener!!!
        // const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
        //     console.log('CustomRootStackNavigator transitionEnd event');
        // });
        // const unsubscribeTransitionStart = navigation.addListener('transitionStart', (event) => {
        //     console.log('CustomRootStackNavigator transitionStart event');
        // });
        // return () => {
        //     if (unsubscribeTransitionEnd) {
        //         console.log('CustomRootStackNavigator unsuscribing from transitioEnd event');
        //         unsubscribeTransitionEnd();
        //     }
        //     if (unsubscribeTransitionStart) {
        //         console.log('CustomRootStackNavigator unsuscribing from transitionStart event');
        //         unsubscribeTransitionStart();
        //     }
        // };
    }, [navigation]);
    const topScreen = _.last(_.values(descriptors));
    const isDisplayingModal = Boolean(topScreen.options.isModal);
    const isDisplayingFullScreenModal = Boolean(topScreen.options.isFullScreenModal);
    return (
        <>
            <StackView
                state={state}
                navigation={navigation}
                descriptors={descriptors}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />

            {/* We need to superimpose a clickaway handler when showing modals so that they can be dismissed. Capturing
            press events on the cardOverlay element in react-navigation is not yet supported on web */}
            <ClickAwayHandler
                isDisplayingModal={isDisplayingModal && !isDisplayingFullScreenModal}
            />
        </>
    );
};

CustomRootStackNavigator.propTypes = propTypes;
CustomRootStackNavigator.displayName = 'CustomRootStackNavigator';

export default createNavigatorFactory(CustomRootStackNavigator);
