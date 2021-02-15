import React from 'react';
import {StackActions} from '@react-navigation/native';
import linkTo from './linkTo';

export const navigationRef = React.createRef();
export const routerRef = React.createRef();
export const modalRef = React.createRef();

function navigate(route) {
    if (!route) {
        return;
    }

    linkTo(navigationRef.current, route);
}

function goBack() {
    if (!navigationRef.current?.canGoBack()) {
        console.debug('Unable to go back');
        navigationRef.current?.navigate('Home');
        return;
    }

    navigationRef.current?.goBack();
}

// This needs to be improved...
function dismissModal() {
    // This should take us to the first view of the modal's stack navigator
    navigationRef.current?.dispatch(StackActions.popToTop());

    // From there we can try to go back or navigate back to the root
    goBack();
}

export default {
    navigate,
    goBack,
    dismissModal,
};
