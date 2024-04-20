import type {RouteProp} from '@react-navigation/native';
import {useNavigationState} from '@react-navigation/native';
import PropTypes from 'prop-types';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import taxPropTypes from '@components/taxPropTypes';
import {translatableTextPropTypes} from '@libs/Localize';
import type {
    BottomTabNavigatorParamList,
    CentralPaneNavigatorParamList,
    FullScreenNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
    SettingsNavigatorParamList,
    WorkspacesCentralPaneNavigatorParamList,
} from '@navigation/types';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type NavigatorsParamList = BottomTabNavigatorParamList &
    CentralPaneNavigatorParamList &
    SettingsNavigatorParamList &
    ReimbursementAccountNavigatorParamList &
    FullScreenNavigatorParamList &
    WorkspacesCentralPaneNavigatorParamList;

type PolicyRoute = RouteProp<
    NavigatorsParamList,
    | typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT
    | typeof SCREENS.WORKSPACE.INITIAL
    | typeof SCREENS.WORKSPACE.BILLS
    | typeof SCREENS.WORKSPACE.MORE_FEATURES
    | typeof SCREENS.WORKSPACE.MEMBERS
    | typeof SCREENS.WORKSPACE.INVITE
    | typeof SCREENS.WORKSPACE.INVITE_MESSAGE
    | typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER
    | typeof SCREENS.WORKSPACE.WORKFLOWS
    | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVER
    | typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET
    | typeof SCREENS.WORKSPACE.TRAVEL
    | typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY
    | typeof SCREENS.WORKSPACE.MEMBER_DETAILS
    | typeof SCREENS.WORKSPACE.INVOICES
    | typeof SCREENS.WORKSPACE.CARD
    | typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK
    | typeof SCREENS.WORKSPACE.TAX_EDIT
>;

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
        errorFields: PropTypes.objectOf(PropTypes.objectOf(translatableTextPropTypes)),

        /** Whether or not the policy requires tags */
        requiresTag: PropTypes.bool,

        /** Whether or not the policy requires categories */
        requiresCategory: PropTypes.bool,

        /** Whether or not the policy has multiple tag lists */
        hasMultipleTagLists: PropTypes.bool,

        /**
         * Whether or not the policy has tax tracking enabled
         *
         * @deprecated - use tax.trackingEnabled instead
         */
        isTaxTrackingEnabled: PropTypes.bool,

        /** Whether or not the policy has tax tracking enabled */
        tax: PropTypes.shape({
            trackingEnabled: PropTypes.bool,
        }),

        /** Collection of tax rates attached to a policy */
        taxRates: taxPropTypes,
    }),
};

type WithPolicyOnyxProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyDraft: OnyxEntry<OnyxTypes.Policy>;
};

type WithPolicyProps = WithPolicyOnyxProps & {
    route: PolicyRoute;
};

const policyDefaultProps: WithPolicyOnyxProps = {
    policy: {} as OnyxTypes.Policy,
    policyDraft: {} as OnyxTypes.Policy,
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
        policyDraft: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${getPolicyIDFromRoute(props.route)}`,
        },
    })(forwardRef(WithPolicy));
}

export {policyDefaultProps, policyPropTypes};
export type {PolicyRoute, WithPolicyOnyxProps, WithPolicyProps};
