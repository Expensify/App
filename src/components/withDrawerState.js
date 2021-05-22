import React from 'react';
import PropTypes from 'prop-types';
import {useDrawerStatus} from '@react-navigation/drawer';
import getComponentDisplayName from '../libs/getComponentDisplayName';

export const withDrawerPropTypes = {
    isDrawerOpen: PropTypes.bool.isRequired,
};

export default function withDrawerState(WrappedComponent) {
    const HOC_Wrapper = (props) => {
        const drawerStatus = useDrawerStatus();

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isDrawerOpen={drawerStatus === 'open'}
            />
        );
    };

    HOC_Wrapper.displayName = `withDrawerState(${getComponentDisplayName(WrappedComponent)})`;
    return HOC_Wrapper;
}
