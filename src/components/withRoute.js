import React from 'react';
import PropTypes from 'prop-types';
import {useRoute} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

const withRoutePropTypes = {
    route: PropTypes.object.isRequired,
};

export default function withRoute(WrappedComponent) {
    function WithRoute(props) {
        const route = useRoute();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                route={route}
            />
        );
    }

    WithRoute.displayName = `withRoute(${getComponentDisplayName(WrappedComponent)})`;
    WithRoute.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithRoute.defaultProps = {
        forwardedRef: () => {},
    };
    return React.forwardRef((props, ref) => (
        <WithRoute
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {withRoutePropTypes};
