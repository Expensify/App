import React from 'react';
import PropTypes from 'prop-types';
import {NavigationContext} from '@react-navigation/native';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const MockNavigationProvider = props => (
    <NavigationContext.Provider
        value={{
            isFocused: () => true,
            addListener: () => {},
            removeListener: () => {},
        }}
    >
        {props.children}
    </NavigationContext.Provider>
);

MockNavigationProvider.propTypes = propTypes;

export default MockNavigationProvider;
