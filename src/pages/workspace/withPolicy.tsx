import {RouteProp, useNavigationState} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, forwardRef, RefAttributes} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import policyMemberPropType from '@pages/policyMemberPropType';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';

type PolicyRoute = RouteProp<{params: {policyID: string}}>;

function getPolicyIDFromRoute(route: PolicyRoute): string {
    return route?.params?.policyID ?? '';
}

const policyPropTypes = {
    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,

        /** The current user's role in the policy */
        role: PropTypes.oneOf(Object.values(CONST.POLICY.ROLE)),

        /** The policy type */
        type: PropTypes.oneOf(Object.values(CONST.POLICY.TYPE)),

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
    policyMembers: PropTypes.objectOf(policyMemberPropType),
};

type WithPolicyOnyxProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyMembers: OnyxEntry<OnyxTypes.PolicyMember>;
    policyDraft: OnyxEntry<OnyxTypes.Policy>;
    policyMembersDraft: OnyxEntry<OnyxTypes.PolicyMember>;
};

type WithPolicyProps = WithPolicyOnyxProps & {
    route: PolicyRoute;
};

const policyDefaultProps: WithPolicyOnyxProps = {
    policy: {} as OnyxTypes.Policy,
    policyMembers: {},
    policyDraft: {} as OnyxTypes.Policy,
    policyMembersDraft: {},
};

/*
 * HOC for connecting a policy in Onyx corresponding to the policyID in route params
 */
export default function <TProps extends WithPolicyProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): React.ComponentType<Omit<TProps, keyof WithPolicyOnyxProps>> {
    function WithPolicy(props: TProps, ref: ForwardedRef<TRef>) {
        const routes = useNavigationState((state) => state.routes || []);
        const currentRoute = routes?.at(-1);
        const policyID = getPolicyIDFromRoute(currentRoute as PolicyRoute);

        if (policyID.length > 0) {
            Policy.updateLastAccessedWorkspace(policyID);
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithPolicy.displayName = `WithPolicy`;

    return withOnyx<TProps & RefAttributes<TRef>, WithPolicyOnyxProps>({
        policy: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
        },
        policyMembers: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${getPolicyIDFromRoute(props.route)}`,
        },
        policyDraft: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${getPolicyIDFromRoute(props.route)}`,
        },
        policyMembersDraft: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS}${getPolicyIDFromRoute(props.route)}`,
        },
    })(forwardRef(WithPolicy));
}

export {policyPropTypes, policyDefaultProps};
export type {WithPolicyOnyxProps, WithPolicyProps};
