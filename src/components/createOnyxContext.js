import lodashGet from 'lodash/get';
import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

/**
 * @param {Object} onyxConfig
 * @param {String} onyxConfig.key
 * @param {Boolean} [onyxConfig.initWithStoredValues]
 * @returns {Array} // Note: this returns an array where the first item is a HOC and the second item is a context provider for that HOC.
 */
export default (onyxConfig) => {
    const keyName = lodashGet(onyxConfig, 'key');
    if (!keyName) {
        throw new Error('Cannot use createOnyxContext without providing an Onyx key');
    }

    const Context = createContext();
    const Provider = props => (
        <Context.Provider value={props[keyName]}>
            {props.children}
        </Context.Provider>
    );

    Provider.propTypes = propTypes;
    Provider.displayName = `${Str.UCFirst(keyName)}Provider`;

    const ProviderWithOnyx = withOnyx({
        [keyName]: onyxConfig,
    })(Provider);

    const withOnyxKey = ({propName = keyName, transformValue} = {}) => (WrappedComponent) => {
        const Consumer = forwardRef((props, ref) => (
            <Context.Consumer>
                {(value) => {
                    const propsToPass = {
                        ...props,
                        [propName]: transformValue ? transformValue(value, props) : value,
                    };
                    return (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <WrappedComponent {...propsToPass} ref={ref} />
                    );
                }}
            </Context.Consumer>
        ));

        Consumer.displayName = `with${Str.UCFirst(keyName)}(${getComponentDisplayName(WrappedComponent)})`;
        return Consumer;
    };

    return [withOnyxKey, ProviderWithOnyx];
};
