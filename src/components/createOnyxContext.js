import React, {createContext} from 'react';
import {withOnyx} from 'react-native-onyx';

export default (onyxKeyName) => {
    const Context = createContext();
    const Provider = props => (
        <Context.Provider value={props[onyxKeyName]}>
            {props.children}
        </Context.Provider>
    );

    const ProviderWithOnyx = withOnyx({
        key: onyxKeyName,
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

    return {
        withOnyxKey,
        Provider: ProviderWithOnyx,
    };
};
