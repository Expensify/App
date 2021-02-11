import _ from 'underscore';
import React from 'react';
import {StackActions, getStateFromPath, getActionFromState} from '@react-navigation/native';
import ROUTES from '../ROUTES';
import linkingConfig from './NavigationContainer/linkingConfig';

export const navigationRef = React.createRef();
export const routerRef = React.createRef();
export const modalRef = React.createRef();

const history = [];

function navigate(route) {
    console.debug('Navigating to route: ', route);

    const state = getStateFromPath(route, linkingConfig.config);
    const action = getActionFromState(state, linkingConfig.config);

    navigationRef.current?.dispatch(action);

    if (route === ROUTES.ROOT) {
        window.history.pushState({}, 'Expensify.cash', '/');
    } else {
        window.history.pushState({}, 'Expensify.cash', route);
    }
}

function goBack() {
    navigationRef.current?.goBack();

    // If we have not navigated anywhere yet then we cannot go back and should just return to the root
    if (!history.length) {
        console.debug('No history pushed so far navigating to root');
        navigate(ROUTES.ROOT);
    } else {
        routerRef.current?.history.goBack();
    }
}

function dismissModal() {
    if (navigationRef.current) {
        navigationRef.current.dispatch(StackActions.popToTop());
        navigationRef.current.goBack();
    }

    if (routerRef.current) {
        // Find the last route we have that is not the modal route
        const currentPath = history[0];

        // If there isn't enough history e.g. we landed on a modal route directly then just go to the root
        if (!currentPath) {
            navigate(ROUTES.ROOT);
            return;
        }

        const modalPath = currentPath.slice(1).split('/')[0];

        if (!modalPath) {
            console.debug('Tried to dismiss modal, but we are not displaying one.');
            return;
        }

        const pathToNavigateTo = _.find(history, path => !path.includes(modalPath));
        if (!pathToNavigateTo) {
            navigate(ROUTES.ROOT);
            return;
        }

        navigate(pathToNavigateTo);
    }
}

export default {
    navigate,
    goBack,
    dismissModal,
};
