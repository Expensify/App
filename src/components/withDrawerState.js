import React from 'react';
import PropTypes from 'prop-types';
import {useIsDrawerOpen} from '@react-navigation/drawer';
import getComponentDisplayName from '../libs/getComponentDisplayName';

export const withDrawerPropTypes = {
    isDrawerOpen: PropTypes.bool.isRequired,
};

export default function withDrawerState(WrappedComponent) {
    const HOC_Wrapper = (props) => {
        const isDrawerOpen = useIsDrawerOpen();

        return (
            <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isDrawerOpen={isDrawerOpen}
            />
        );
    };

    HOC_Wrapper.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return HOC_Wrapper;
}
