import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import {StackView} from '@react-navigation/stack';
import ClickAwayHandler from './ClickAwayHandler';
import {setModalVisibility} from '../../actions/Modal';

const CustomRootStackNavigator = ({
    children,
    ...rest
}) => {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        children,
    });
    const isDisplayingModal = Boolean(_.find(descriptors, descriptor => descriptor.options.isModal));

    // Store modal visible state in Onyx
    if (isDisplayingModal) {
        setModalVisibility(true);
    }

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
                isDisplayingModal={isDisplayingModal}
            />
        </>
    );
};

CustomRootStackNavigator.propTypes = {
    children: PropTypes.node.isRequired,
};

export default createNavigatorFactory(CustomRootStackNavigator);
