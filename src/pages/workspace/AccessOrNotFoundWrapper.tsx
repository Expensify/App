/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import callOrReturn from '@src/types/utils/callOrReturn';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const POLICY_ACCESS_VARIANTS = {
    [CONST.POLICY.ACCESS_VARIANTS.PAID]: (policy: OnyxEntry<OnyxTypes.Policy>) => PolicyUtils.isPaidGroupPolicy(policy) && !!policy?.isPolicyExpenseChatEnabled,
    [CONST.POLICY.ACCESS_VARIANTS.ADMIN]: (policy: OnyxEntry<OnyxTypes.Policy>) => PolicyUtils.isPolicyAdmin(policy),
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

    /** Props for customizing fallback pages */
    fullPageNotFoundViewProps?: FullPageNotFoundViewProps;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;
} & Pick<FullPageNotFoundViewProps, 'subtitleKey' | 'onLinkPress'>;

type PageNotFoundFallbackProps = Pick<AccessOrNotFoundWrapperProps, 'policyID' | 'fullPageNotFoundViewProps'> & {shouldShowFullScreenFallback: boolean};

function PageNotFoundFallback({policyID, shouldShowFullScreenFallback, fullPageNotFoundViewProps}: PageNotFoundFallbackProps) {
    return shouldShowFullScreenFallback ? (
        <FullPageNotFoundView
            shouldShow
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            shouldForceFullScreen
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fullPageNotFoundViewProps}
        />
    ) : (
        <NotFoundPage
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(policyID))}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fullPageNotFoundViewProps}
        />
    );
}

function AccessOrNotFoundWrapper({accessVariants = [], fullPageNotFoundViewProps, shouldBeBlocked, ...props}: AccessOrNotFoundWrapperProps) {
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

    const isPageAccessible = accessVariants.reduce((acc, variant) => {
        const accessFunction = POLICY_ACCESS_VARIANTS[variant];
        return acc && accessFunction(policy);
    }, true);

    const shouldShowNotFoundPage =
        isEmptyObject(policy) || (Object.keys(policy).length === 1 && !isEmptyObject(policy.errors)) || !policy?.id || !isPageAccessible || !isFeatureEnabled || shouldBeBlocked;

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <PageNotFoundFallback
                policyID={policyID}
                shouldShowFullScreenFallback={!isFeatureEnabled}
                fullPageNotFoundViewProps={fullPageNotFoundViewProps}
            />
        );
    }

    return callOrReturn(props.children, props);
}

export type {PolicyAccessVariant};

export default withOnyx<AccessOrNotFoundWrapperProps, AccessOrNotFoundWrapperOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(AccessOrNotFoundWrapper);
