import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import {StackView} from '@react-navigation/stack';
import ClickAwayHandler from './ClickAwayHandler';

const CustomRootStackNavigator = ({
    children,
    ...rest
}) => {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        children,
    });
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

CustomRootStackNavigator.propTypes = {
    children: PropTypes.node.isRequired,
};

export default createNavigatorFactory(CustomRootStackNavigator);
