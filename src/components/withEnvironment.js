import React from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import useEnvironment from '../hooks/useEnvironment';

const environmentPropTypes = {
    /** The string value representing the current environment */
    environment: PropTypes.string.isRequired,

    /** The string value representing the URL of the current environment */
    environmentURL: PropTypes.string.isRequired,
};

export default function (WrappedComponent) {
    function WithEnvironment(props) {
        const {environment, environmentURL} = useEnvironment();

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                environment={environment}
                environmentURL={environmentURL}
            />
        );
    }

    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;
    WithEnvironment.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithEnvironment.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        <WithEnvironment
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {environmentPropTypes};
