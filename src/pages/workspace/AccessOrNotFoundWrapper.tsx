/* eslint-disable rulesdir/no-negated-variables */
import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {openWorkspace} from '@libs/actions/Policy/Policy';
import {isValidMoneyRequestType} from '@libs/IOUUtils';
import goBackFromWorkspaceSettingPages from '@libs/Navigation/helpers/goBackFromWorkspaceSettingPages';
import Navigation from '@libs/Navigation/Navigation';
import {canSendInvoice, isControlPolicy, isPaidGroupPolicy, isPolicyAccessible, isPolicyAdmin, isPolicyFeatureEnabled as isPolicyFeatureEnabledUtil} from '@libs/PolicyUtils';
import {canCreateRequest} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import callOrReturn from '@src/types/utils/callOrReturn';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const ACCESS_VARIANTS = {
    [CONST.POLICY.ACCESS_VARIANTS.PAID]: (policy: OnyxEntry<Policy>) => isPaidGroupPolicy(policy),
    [CONST.POLICY.ACCESS_VARIANTS.CONTROL]: (policy: OnyxEntry<Policy>) => isControlPolicy(policy),
    [CONST.POLICY.ACCESS_VARIANTS.ADMIN]: (policy: OnyxEntry<Policy>, login: string) => isPolicyAdmin(policy, login),
    [CONST.IOU.ACCESS_VARIANTS.CREATE]: (
        policy: OnyxEntry<Policy>,
        login: string,
        report: OnyxEntry<Report>,
        allPolicies: NonNullable<OnyxCollection<Policy>> | null,
        iouType?: IOUType,
        isReportArchived?: boolean,
        isRestrictedToPreferredPolicy?: boolean,
    ) =>
        !!iouType &&
        isValidMoneyRequestType(iouType) &&
        // Allow the user to submit the expense if we are submitting the expense in global menu or the report can create the expense

        (isEmptyObject(report?.reportID) || canCreateRequest(report, policy, iouType, isReportArchived, isRestrictedToPreferredPolicy)) &&
        (iouType !== CONST.IOU.TYPE.INVOICE || canSendInvoice(allPolicies, login)),
} as const satisfies Record<
    string,
    (
        policy: Policy,
        login: string,
        report: Report,
        allPolicies: NonNullable<OnyxCollection<Policy>> | null,
        iouType?: IOUType,
        isArchivedReport?: boolean,
        isRestrictedToPreferredPolicy?: boolean,
    ) => boolean
>;

type AccessVariant = keyof typeof ACCESS_VARIANTS;
type AccessOrNotFoundWrapperChildrenProps = {
    /** The report that holds the transaction */
    report: OnyxEntry<Report>;

    /** The report currently being looked at */
    policy: OnyxEntry<Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type AccessOrNotFoundWrapperProps = {
    /** The children to render */
    children: ((props: AccessOrNotFoundWrapperChildrenProps) => React.ReactNode) | React.ReactNode;

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
    allPolicies?: OnyxCollection<Policy>;
} & Pick<FullPageNotFoundViewProps, 'subtitleKey' | 'onLinkPress'>;

type PageNotFoundFallbackProps = Pick<AccessOrNotFoundWrapperProps, 'policyID' | 'fullPageNotFoundViewProps'> & {
    isFeatureEnabled: boolean;
    isPolicyNotAccessible: boolean;
    isMoneyRequest: boolean;
};

function PageNotFoundFallback({policyID, fullPageNotFoundViewProps, isFeatureEnabled, isPolicyNotAccessible, isMoneyRequest}: PageNotFoundFallbackProps) {
    const shouldShowFullScreenFallback = !isFeatureEnabled || isPolicyNotAccessible;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NotFoundPage
            shouldForceFullScreen={shouldShowFullScreenFallback}
            shouldShowOfflineIndicator={false}
            onBackButtonPress={() => {
                if (isPolicyNotAccessible) {
                    goBackFromWorkspaceSettingPages();
                    return;
                }
                Navigation.goBack(policyID && !isMoneyRequest ? ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID) : undefined);
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fullPageNotFoundViewProps}
            shouldShowBackButton={fullPageNotFoundViewProps?.shouldShowBackButton ?? (!shouldShowFullScreenFallback ? shouldUseNarrowLayout : undefined)}
        />
    );
}

function AccessOrNotFoundWrapper({
    accessVariants = [],
    fullPageNotFoundViewProps,
    shouldBeBlocked,
    policyID,
    reportID,
    iouType,
    allPolicies,
    featureName,
    ...props
}: AccessOrNotFoundWrapperProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        canBeMissing: true,
    });
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        canBeMissing: true,
    });
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const {login = ''} = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const isPolicyIDInRoute = !!policyID?.length;
    const isMoneyRequest = !!iouType && isValidMoneyRequestType(iouType);
    const isFromGlobalCreate = !!reportID && isEmptyObject(report?.reportID);
    const pendingField = featureName ? policy?.pendingFields?.[featureName] : undefined;
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        openWorkspace(policyID, []);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, policyID]);

    const shouldShowFullScreenLoadingIndicator = !isMoneyRequest && isLoadingReportData !== false && (!Object.entries(policy ?? {}).length || !policy?.id);

    const isFeatureEnabled = featureName ? isPolicyFeatureEnabledUtil(policy, featureName) : true;

    const {isOffline} = useNetwork();

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isPageAccessible = accessVariants.reduce((acc, variant) => {
        const accessFunction = ACCESS_VARIANTS[variant];
        if (variant === CONST.IOU.ACCESS_VARIANTS.CREATE) {
            return acc && accessFunction(policy, login, report, allPolicies ?? null, iouType, isReportArchived, isRestrictedToPreferredPolicy);
        }
        return acc && accessFunction(policy, login, report, allPolicies ?? null, iouType, isReportArchived);
    }, true);

    const isPolicyNotAccessible = !isPolicyAccessible(policy, login);
    const shouldShowNotFoundPage = (!isMoneyRequest && !isFromGlobalCreate && isPolicyNotAccessible) || !isPageAccessible || shouldBeBlocked;
    // We only update the feature state if it isn't pending.
    // This is because the feature state changes several times during the creation of a workspace, while we are waiting for a response from the backend.
    // Without this, we can be unexpectedly navigated to the More Features page.
    useEffect(() => {
        if (!isFocused || isFeatureEnabled || (pendingField && !isOffline && !isFeatureEnabled)) {
            return;
        }

        // When a workspace feature linked to the current page is disabled we will navigate to the More Features page.
        Navigation.isNavigationReady().then(() => Navigation.goBack(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
        // We don't need to run the effect on policyID change as we only use it to get the route to navigate to.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingField, isOffline, isFeatureEnabled]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingReportData || !isPolicyNotAccessible) {
            return;
        }
        Navigation.removeScreenFromNavigationState(SCREENS.WORKSPACE.INITIAL);
    }, [isLoadingReportData, isPolicyNotAccessible]);

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <PageNotFoundFallback
                policyID={policyID}
                isMoneyRequest={isMoneyRequest}
                isFeatureEnabled={isFeatureEnabled}
                isPolicyNotAccessible={isPolicyNotAccessible}
                fullPageNotFoundViewProps={fullPageNotFoundViewProps}
            />
        );
    }

    return callOrReturn(props.children, {report, policy, isLoadingReportData});
}

export type {AccessVariant};

export default AccessOrNotFoundWrapper;
