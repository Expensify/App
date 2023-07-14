import React, {createContext, useState, useEffect, forwardRef} from 'react';
import PropTypes from 'prop-types';
import * as Environment from '../libs/Environment/Environment';
import CONST from '../CONST';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const EnvironmentContext = createContext(null);

const withEnvironmentPropTypes = {
    /** The string value representing the current environment */
    environment: PropTypes.string.isRequired,

    /** The string value representing the URL of the current environment */
    environmentURL: PropTypes.string.isRequired,
};

function EnvironmentProvider({children}) {
    const [environment, setEnvironment] = useState(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);

    useEffect(() => {
        Environment.getEnvironment().then(setEnvironment);
        Environment.getEnvironmentURL().then(setEnvironmentURL);
    }, []);

    return <EnvironmentContext.Provider value={{environment, environmentURL}}>{children}</EnvironmentContext.Provider>;
}

EnvironmentProvider.displayName = 'EnvironmentProvider';
EnvironmentProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export default function withEnvironment(WrappedComponent) {
    const WithEnvironment = forwardRef((props, ref) => (
        <EnvironmentContext.Consumer>
            {({environment, environmentURL}) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                    environment={environment}
                    environmentURL={environmentURL}
                />
            )}
        </EnvironmentContext.Consumer>
    ));

    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;

    return WithEnvironment;
}

export {EnvironmentContext, withEnvironmentPropTypes, EnvironmentProvider};
