/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import callOrReturn from '@src/types/utils/callOrReturn';
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

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;
};

type PageNotFoundFallackProps = Pick<AccessOrNotFoundWrapperProps, 'policyID'> & {showFullScreenFallback: boolean};

function PageNotFoundFallback({policyID, showFullScreenFallback}: PageNotFoundFallackProps) {
    return showFullScreenFallback ? (
        <FullPageNotFoundView
            shouldShow
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            shouldForceFullScreen
        />
    ) : (
        <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(policyID))} />
    );
}

function AccessOrNotFoundWrapper({accessVariants = [], ...props}: AccessOrNotFoundWrapperProps) {
    const {policy, policyID, featureName, isLoadingReportData} = props;

    const isPolicyIDInRoute = !!policyID?.length;

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        Policy.openWorkspace(policyID, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, policyID]);

    const shouldShowFullScreenLoadingIndicator = isLoadingReportData !== false && (!Object.entries(policy ?? {}).length || !policy?.id);

    const isFeatureEnabled = featureName ? PolicyUtils.isPolicyFeatureEnabled(policy, featureName) : true;
    const pageUnaccessible = accessVariants.reduce((acc, variant) => {
        const accessFunction = POLICY_ACCESS_VARIANTS[variant];
        return acc || accessFunction(policy);
    }, false);

    const shouldShowNotFoundPage = isEmptyObject(policy) || (Object.keys(policy).length === 1 && !isEmptyObject(policy.errors)) || !policy?.id || pageUnaccessible || !isFeatureEnabled;

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <PageNotFoundFallback
                policyID={policyID}
                showFullScreenFallback={!isFeatureEnabled}
            />
        );
    }

    return callOrReturn(props.children, props);
}

export default withOnyx<AccessOrNotFoundWrapperProps, AccessOrNotFoundWrapperOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(AccessOrNotFoundWrapper);
