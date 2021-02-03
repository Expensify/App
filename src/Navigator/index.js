import React from 'react';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

export const navigationRef = React.createRef();
export const routerRef = React.createRef();

function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
    routerRef.current?.history.push(name);
    Onyx.merge(ONYXKEYS.CURRENT_ROUTE, name);
}

export default {
    navigate,
};
