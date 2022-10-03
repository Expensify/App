import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {useNavigationState} from '@react-navigation/native';
import CONST from '../../CONST';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import * as Policy from '../../libs/actions/Policy';
import ONYXKEYS from '../../ONYXKEYS';
import policyMemberPropType from '../policyMemberPropType';

/**
 * @param {Object} route
 * @returns {String}
 */
function getPolicyIDFromRoute(route) {
    return lodashGet(route, 'params.policyID', '');
}

const policyPropTypes = {
    /** The policy object for the current route */
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
        avatar: PropTypes.string,

        /** Errors on the policy keyed by microtime */
        errors: PropTypes.objectOf(PropTypes.string),

        /**
         * Error objects keyed by field name containing errors keyed by microtime
         * E.x
         * {
         *     name: {
         *        [DateUtils.getMicroseconds()]: 'Sorry, there was an unexpected problem updating your workspace name.',
         *     }
         * }
        */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** The employee list of this policy */
    policyMemberList: PropTypes.objectOf(policyMemberPropType),
};

const policyDefaultProps = {
    policy: {},
    policyMemberList: {},
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

    const WithPolicy = (props) => {
        const currentRoute = _.last(useNavigationState(state => state.routes || []));
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
    };

    WithPolicy.propTypes = propTypes;
    WithPolicy.defaultProps = defaultProps;
    WithPolicy.displayName = `withPolicy(${getComponentDisplayName(WrappedComponent)})`;
    const withPolicy = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithPolicy {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        policy: {
            key: props => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
        },
        policyMemberList: {
            key: props => `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${getPolicyIDFromRoute(props.route)}`,
        },
    })(withPolicy);
}

export {
    policyPropTypes,
    policyDefaultProps,
};
