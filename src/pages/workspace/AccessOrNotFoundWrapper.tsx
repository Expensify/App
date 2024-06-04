/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy/Policy';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import callOrReturn from '@src/types/utils/callOrReturn';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const ACCESS_VARIANTS = {
    [CONST.POLICY.ACCESS_VARIANTS.PAID]: (policy: OnyxEntry<OnyxTypes.Policy>) => PolicyUtils.isPaidGroupPolicy(policy) && !!policy?.isPolicyExpenseChatEnabled,
    [CONST.POLICY.ACCESS_VARIANTS.ADMIN]: (policy: OnyxEntry<OnyxTypes.Policy>, login: string) => PolicyUtils.isPolicyAdmin(policy, login),
    [CONST.IOU.ACCESS_VARIANTS.CREATE]: (
        policy: OnyxEntry<OnyxTypes.Policy>,
        login: string,
        report: OnyxEntry<OnyxTypes.Report>,
        allPolicies: OnyxCollection<OnyxTypes.Policy>,
        iouType?: IOUType,
    ) =>
        !!iouType &&
        IOUUtils.isValidMoneyRequestType(iouType) &&
        // Allow the user to submit the expense if we are submitting the expense in global menu or the report can create the expense
        (isEmptyObject(report?.reportID) || ReportUtils.canCreateRequest(report, policy, iouType)) &&
        (iouType !== CONST.IOU.TYPE.INVOICE || PolicyUtils.canSendInvoice(allPolicies)),
} as const satisfies Record<string, (policy: OnyxTypes.Policy, login: string, report: OnyxTypes.Report, allPolicies: OnyxCollection<OnyxTypes.Policy>, iouType?: IOUType) => boolean>;

type AccessVariant = keyof typeof ACCESS_VARIANTS;
type AccessOrNotFoundWrapperOnyxProps = {
    /** The report that holds the transaction */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type AccessOrNotFoundWrapperProps = AccessOrNotFoundWrapperOnyxProps & {
    /** The children to render */
    children: ((props: AccessOrNotFoundWrapperOnyxProps) => React.ReactNode) | React.ReactNode;

    /** The id of the report that holds the transaction */
    reportID?: string;

    /** The report currently being looked at */
    policyID?: string;

    /** Defines which types of access should be verified */
    accessVariants?: AccessVariant[];

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;

    /** Props for customizing fallback pages */
    fullPageNotFoundViewProps?: FullPageNotFoundViewProps;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;

    /** The type of the transaction */
    iouType?: IOUType;

    /** The list of all policies */
    allPolicies?: OnyxCollection<OnyxTypes.Policy>;
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
            onBackButtonPress={() => Navigation.goBack(policyID ? ROUTES.WORKSPACE_PROFILE.getRoute(policyID) : ROUTES.HOME)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fullPageNotFoundViewProps}
        />
    );
}

function AccessOrNotFoundWrapper({accessVariants = [], fullPageNotFoundViewProps, shouldBeBlocked, ...props}: AccessOrNotFoundWrapperProps) {
    const {policy, policyID, report, iouType, allPolicies, featureName, isLoadingReportData} = props;
    const {login = ''} = useCurrentUserPersonalDetails();
    const isPolicyIDInRoute = !!policyID?.length;
    const isMoneyRequest = !!iouType && IOUUtils.isValidMoneyRequestType(iouType);
    const isFromGlobalCreate = isEmptyObject(report?.reportID);

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        Policy.openWorkspace(policyID, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, policyID]);

    const shouldShowFullScreenLoadingIndicator = !isMoneyRequest && isLoadingReportData !== false && (!Object.entries(policy ?? {}).length || !policy?.id);

    const isFeatureEnabled = featureName ? PolicyUtils.isPolicyFeatureEnabled(policy, featureName) : true;

    const isPageAccessible = accessVariants.reduce((acc, variant) => {
        const accessFunction = ACCESS_VARIANTS[variant];
        return acc && accessFunction(policy, login, report, allPolicies ?? null, iouType);
    }, true);

    const isPolicyNotAccessible = isEmptyObject(policy) || (Object.keys(policy).length === 1 && !isEmptyObject(policy.errors)) || !policy?.id;
    const shouldShowNotFoundPage = (!isMoneyRequest && !isFromGlobalCreate && isPolicyNotAccessible) || !isPageAccessible || !isFeatureEnabled || shouldBeBlocked;

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

export type {AccessVariant};

export default withOnyx<AccessOrNotFoundWrapperProps, AccessOrNotFoundWrapperOnyxProps>({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(AccessOrNotFoundWrapper);
