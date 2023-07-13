import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {useNavigationState} from '@react-navigation/native';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import * as Policy from '../../libs/actions/Policy';
import ONYXKEYS from '../../ONYXKEYS';
import policyMemberPropType from '../policyMemberPropType';
import policyPropType from '../policyPropType';

/**
 * @param {Object} route
 * @returns {String}
 */
function getPolicyIDFromRoute(route) {
    return lodashGet(route, 'params.policyID', '');
}

const policyPropTypes = {
    /** The policy object for the current route */
    policy: PropTypes.objectOf(policyPropType),

    /** The employee list of this policy */
    policyMembers: PropTypes.objectOf(policyMemberPropType),
};

const policyDefaultProps = {
    policy: {},
    policyMembers: {},
};

/*
 * HOC for connecting a policy in Onyx corresponding to the policyID in route params
 */
export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
         * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        ...policyPropTypes,
    };

    const defaultProps = {
        forwardedRef: () => {},

        ...policyDefaultProps,
    };

    function WithPolicy(props) {
        const currentRoute = _.last(useNavigationState((state) => state.routes || []));
        const policyID = getPolicyIDFromRoute(currentRoute);

        if (_.isString(policyID) && !_.isEmpty(policyID)) {
            Policy.updateLastAccessedWorkspace(policyID);
        }

        const rest = _.omit(props, ['forwardedRef']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
            />
        );
    }

    WithPolicy.propTypes = propTypes;
    WithPolicy.defaultProps = defaultProps;
    WithPolicy.displayName = `withPolicy(${getComponentDisplayName(WrappedComponent)})`;
    const withPolicy = React.forwardRef((props, ref) => (
        <WithPolicy
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    return withOnyx({
        policy: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
        },
        policyMembers: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${getPolicyIDFromRoute(props.route)}`,
        },
    })(withPolicy);
}

export {policyPropTypes, policyDefaultProps};
