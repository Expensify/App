import React from 'react';
import {StackActions, getStateFromPath, getActionFromState} from '@react-navigation/native';
import ROUTES from '../ROUTES';
import linkingConfig from './NavigationContainer/linkingConfig';

export const navigationRef = React.createRef();
export const routerRef = React.createRef();
export const modalRef = React.createRef();

function navigate(route) {
    console.debug('Navigating to route: ', route);
    if (!route) {
        return;
    }

    const state = getStateFromPath(route, linkingConfig.config);
    const action = getActionFromState(state, linkingConfig.config);
    navigationRef.current?.dispatch(action);
}

function goBack() {
    if (!navigationRef.current?.canGoBack()) {
        console.debug('Unable to go back');
        navigate(ROUTES.HOME);
        return;
    }

    navigationRef.current?.goBack();
}

function dismissModal() {
    if (navigationRef.current?.canGoBack()) {
        navigationRef.current?.dispatch(StackActions.popToTop());
        navigationRef.current?.goBack();
    } else {
        navigate(ROUTES.HOME);
    }
}

window._navigate = navigate;
window._navRef = navigationRef;

export default {
    navigate,
    goBack,
    dismissModal,
};
