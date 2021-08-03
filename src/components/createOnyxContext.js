import React, {createContext} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import getComponentDisplayName from '../libs/getComponentDisplayName';

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
    Provider.displayName = `${Str.UCFirst(onyxKeyName)}Provider`;

    const ProviderWithOnyx = withOnyx({
        [onyxKeyName]: {
            key: onyxKeyName,
        },
    })(Provider);

    const withOnyxKey = ({propName = onyxKeyName, transformValue = () => {}} = {}) => (WrappedComponent) => {
        const Consumer = props => (
            <Context.Consumer>
                {(value) => {
                    const propsToPass = {
                        ...props,
                        [propName]: transformValue ? transformValue(value, props) : value,
                    };
                    return (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <WrappedComponent {...propsToPass} />
                    );
                }}
            </Context.Consumer>
        );

        Consumer.displayName = `with${Str.UCFirst(onyxKeyName)}(${getComponentDisplayName(WrappedComponent)})`;
        return Consumer;
    };

    return [withOnyxKey, ProviderWithOnyx];
};
