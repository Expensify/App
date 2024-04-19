/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const POLICY_ACCESS_VARIANTS = {
    PAID: (policy: OnyxEntry<OnyxTypes.Policy>) => !PolicyUtils.isPaidGroupPolicy(policy) || !policy?.isPolicyExpenseChatEnabled,
    ADMIN: (policy: OnyxEntry<OnyxTypes.Policy>) => !PolicyUtils.isPolicyAdmin(policy),
} as const satisfies Record<string, (policy: OnyxTypes.Policy) => boolean>;

type PolicyAccessVariant = keyof typeof POLICY_ACCESS_VARIANTS;

type AccessOrNotFoundWrapperOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type AccessOrNotFoundWrapperProps = AccessOrNotFoundWrapperOnyxProps & {
    /** The children to render */
    children: ((props: AccessOrNotFoundWrapperOnyxProps) => React.ReactNode) | React.ReactNode;

    /** The report currently being looked at */
    policyID: string;

    /** Defines which types of access should be verified */
    accessVariants?: PolicyAccessVariant[];
};

function AccessOrNotFoundWrapper({accessVariants = ['ADMIN', 'PAID'], ...props}: AccessOrNotFoundWrapperProps) {
    const isPolicyIDInRoute = !!props.policyID?.length;

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(props.policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        Policy.openWorkspace(props.policyID, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, props.policyID]);

    const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.policy ?? {}).length || !props.policy?.id);

    const pageUnaccessible = accessVariants.reduce((acc, variant) => {
        const accessFunction = POLICY_ACCESS_VARIANTS[variant];
        return acc || accessFunction(props.policy);
    }, false);
    const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || pageUnaccessible;

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(props.policyID))} />;
    }

    return typeof props.children === 'function' ? props.children(props) : props.children;
}

export default withOnyx<AccessOrNotFoundWrapperProps, AccessOrNotFoundWrapperOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(AccessOrNotFoundWrapper);
