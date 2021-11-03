import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {useNavigationState} from '@react-navigation/native';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import * as Policy from '../../libs/actions/Policy';

let previousRoute = '';

/*
 * HOC for loading a full policy. It checks the route params and if current route has a policyID that the previous route did not, it full-loads that policy.
 */
export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.func,
    };

    const defaultProps = {
        forwardedRef: () => {},
    };

    const WithFullPolicy = (props) => {
        const currentRoute = _.last(useNavigationState(state => state.routes || []));
        const policyID = _.get(currentRoute, ['params', 'policyID'], '');

        if (policyID && !previousRoute.includes(policyID)) {
            Policy.loadFullPolicy(policyID);
        }

        previousRoute = _.get(currentRoute, 'path', '');

        const {forwardedRef, ...rest} = props;
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={forwardedRef}
            />
        );
    };

    WithFullPolicy.propTypes = propTypes;
    WithFullPolicy.defaultProps = defaultProps;
    WithFullPolicy.displayName = `withFullPolicy(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithFullPolicy {...props} forwardedRef={ref} />
    ));
}
