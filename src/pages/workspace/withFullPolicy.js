import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import {useNavigationState} from '@react-navigation/native';
import CONST from '../../CONST';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import * as Policy from '../../libs/actions/Policy';
import ONYXKEYS from '../../ONYXKEYS';

let previousRouteName = '';
let previousRoutePolicyID = '';

/**
 * @param {Object} route
 * @returns {String}
 */
function getPolicyIDFromRoute(route) {
    return lodashGet(route, 'params.policyID', '');
}

/**
 * @param {String} routeName
 * @param {String} policyID
 * @returns {Boolean}
 */
function isPreviousRouteInSameWorkspace(routeName, policyID) {
    return (
        Str.startsWith(routeName, 'Workspace')
        && Str.startsWith(previousRouteName, 'Workspace')
        && policyID === previousRoutePolicyID
    );
}

const fullPolicyPropTypes = {
    /** The full policy object for the current route (as opposed to the policy summary object) */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,

        /** The current user's role in the policy */
        role: PropTypes.oneOf(_.values(CONST.POLICY.ROLE)),

        /** The policy type */
        type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

        /** The email of the policy owner */
        owner: PropTypes.string,

        /** The output currency for the policy */
        outputCurrency: PropTypes.string,

        /** The URL for the policy avatar */
        avatarURL: PropTypes.string,

        /** A list of emails for the employees on the policy */
        employeeList: PropTypes.arrayOf(PropTypes.string),
    }),
};

const fullPolicyDefaultProps = {
    policy: {},
};

/*
 * HOC for loading a full policy. It checks the route params and if current route has a policyID that the previous route did not, it full-loads that policy.
 */
export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
          * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        ...fullPolicyPropTypes,
    };

    const defaultProps = {
        forwardedRef: () => {},

        ...fullPolicyDefaultProps,
    };

    const WithFullPolicy = (props) => {
        const currentRoute = _.last(useNavigationState(state => state.routes || []));
        const policyID = getPolicyIDFromRoute(currentRoute);
        const isFromFullPolicy = lodashGet(props, 'policy.isFromFullPolicy', false) || lodashGet(props, `policy.policy_${policyID}.isFromFullPolicy`, false);

        if (_.isString(policyID) && !_.isEmpty(policyID) && (!isFromFullPolicy || !isPreviousRouteInSameWorkspace(currentRoute.name, policyID))) {
            Policy.loadFullPolicy(policyID);
            Policy.updateLastAccessedWorkspace(policyID);
        }

        previousRouteName = currentRoute.name;
        previousRoutePolicyID = policyID;

        const rest = _.omit(props, ['forwardedRef', 'policy']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
                policy={props.policy}
            />
        );
    };

    WithFullPolicy.propTypes = propTypes;
    WithFullPolicy.defaultProps = defaultProps;
    WithFullPolicy.displayName = `withFullPolicy(${getComponentDisplayName(WrappedComponent)})`;
    const withFullPolicy = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithFullPolicy {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        policy: {
            key: props => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
        },
    })(withFullPolicy);
}

export {
    fullPolicyPropTypes,
    fullPolicyDefaultProps,
};
