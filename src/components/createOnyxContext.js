import React, {createContext} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

export default (onyxKeyName) => {
    const Context = createContext();
    const Provider = props => (
        <Context.Provider value={props[onyxKeyName]}>
            {props.children}
        </Context.Provider>
    );

    Provider.propTypes = propTypes;
    Provider.displayName = `${onyxKeyName.toUpperCase()}Provider`;

    const ProviderWithOnyx = withOnyx({
        [onyxKeyName]: {
            key: onyxKeyName,
        },
    })(Provider);

    const withOnyxKey = WrappedComponent => props => (
        <Context.Consumer>
            {(value) => {
                const propsToPass = {...props, [onyxKeyName]: value};
                return (
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    <WrappedComponent {...propsToPass} />
                );
            }}
        </Context.Consumer>
    );

    withOnyxKey.displayName = `with${onyxKeyName.toUpperCase()}`;
    return [withOnyxKey, ProviderWithOnyx];
};
