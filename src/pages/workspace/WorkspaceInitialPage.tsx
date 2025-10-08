import {findFocusedRoute, useFocusEffect, useNavigationState} from '@react-navigation/native';
import {emailSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ValueOf} from 'type-fest';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {isConnectionInProgress} from '@libs/actions/connections';
import {clearErrors, openPolicyInitialPage, removeWorkspace} from '@libs/actions/Policy/Policy';
import {getCompanyFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    shouldShowPolicy as checkIfShouldShowPolicy,
    goBackFromInvalidPolicy,
    hasPolicyCategoriesError,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyFeatureEnabled,
    shouldShowEmployeeListError,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import type WORKSPACE_TO_RHP from '@navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import WorkspaceInitialPageContent from './WorkspaceInitialPageContent';
import getWorkspaceMenuItems from './WorkspaceMenuItems';

type WorkspaceTopLevelScreens = keyof typeof WORKSPACE_TO_RHP;

type WorkspaceMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: WorkspaceTopLevelScreens;
    badgeText?: string;
    highlighted?: boolean;
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

type PolicyFeatureStates = Record<PolicyFeatureName, boolean>;

function dismissError(policyID: string | undefined, pendingAction: PendingAction | undefined) {
    if (!policyID || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        goBackFromInvalidPolicy();
        if (policyID) {
            removeWorkspace(policyID);
        }
    } else {
        clearErrors(policyID);
    }
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, route}: WorkspaceInitialPageProps) {
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasPolicyCreationError = policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(policy.errors);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: true});
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID}`, {canBeMissing: true});
    const cardsDomainIDs = Object.values(getCompanyFeeds(cardFeeds))
        .map((data) => data.domainID)
        .filter((domainID): domainID is number => !!domainID);
    const {login, accountID} = useCurrentUserPersonalDetails();
    const hasSyncError = shouldShowSyncError(policy, isConnectionInProgress(connectionSyncProgress, policy));
    const {shouldShowEnterCredentialsError} = useGetReceiptPartnersIntegrationData(policy?.id);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const {isBetaEnabled} = usePermissions();
    const isUberForBusinessEnabled = isBetaEnabled(CONST.BETAS.UBER_FOR_BUSINESS);
    const {isOffline} = useNetwork();
    const wasRendered = useRef(false);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const currentUserPolicyExpenseChatReportID = getPolicyExpenseChat(accountID, policy?.id, allReports)?.reportID;
    const [currentUserPolicyExpenseChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentUserPolicyExpenseChatReportID}`, {canBeMissing: true});
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(currentUserPolicyExpenseChat);
    const isPolicyExpenseChatEnabled = !!policy?.isPolicyExpenseChatEnabled;
    const prevPendingFields = usePrevious(policy?.pendingFields);
    const policyFeatureStates = useMemo(
        () => ({
            [CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]: policy?.areDistanceRatesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]: policy?.areWorkflowsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]: policy?.areCategoriesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]: policy?.areTagsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]: policy?.tax?.trackingEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]: policy?.areCompanyCardsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]: !!policy?.areConnectionsEnabled || !isEmptyObject(policy?.connections),
            [CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]: policy?.areExpensifyCardsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]: policy?.areReportFieldsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: policy?.areRulesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy?.areInvoicesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: policy?.arePerDiemRatesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]: isUberForBusinessEnabled && (policy?.receiptPartners?.enabled ?? false),
        }),
        [policy, isUberForBusinessEnabled],
    ) as PolicyFeatureStates;

    const fetchPolicyData = useCallback(() => {
        if (policyDraft?.id) {
            return;
        }
        openPolicyInitialPage(route.params.policyID);
    }, [policyDraft?.id, route.params.policyID]);

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const hasMembersError = shouldShowEmployeeListError(policy);
    const hasPolicyCategoryError = hasPolicyCategoriesError(policyCategories);
    const hasGeneralSettingsError =
        !isEmptyObject(policy?.errorFields?.name ?? {}) ||
        !isEmptyObject(policy?.errorFields?.avatarURL ?? {}) ||
        !isEmptyObject(policy?.errorFields?.outputCurrency ?? {}) ||
        !isEmptyObject(policy?.errorFields?.address ?? {});
    const shouldShowProtectedItems = isPolicyAdmin(policy, login);
    const [featureStates, setFeatureStates] = useState(policyFeatureStates);

    const [highlightedFeature, setHighlightedFeature] = useState<string | undefined>(undefined);

    const workspaceMenuItems: WorkspaceMenuItem[] = useMemo(() => {
        return getWorkspaceMenuItems({
            policy,
            featureStates,
            workspaceAccountID,
            hasSyncError,
            hasGeneralSettingsError,
            hasMembersError,
            hasPolicyCategoryError,
            shouldShowProtectedItems,
            shouldShowEnterCredentialsError,
            highlightedFeature,
            cardsDomainIDs,
            singleExecution,
            waitForNavigate,
            allFeedsCards,
        });
    }, [
        singleExecution,
        waitForNavigate,
        featureStates,
        hasGeneralSettingsError,
        hasMembersError,
        policy,
        shouldShowProtectedItems,
        hasSyncError,
        highlightedFeature,
        shouldShowEnterCredentialsError,
        hasPolicyCategoryError,
        allFeedsCards,
        workspaceAccountID,
        cardsDomainIDs,
    ]);

    // We only update feature states if they aren't pending.
    // These changes are made to synchronously change feature states along with AccessOrNotFoundWrapperComponent.
    useEffect(() => {
        setFeatureStates((currentFeatureStates) => {
            const newFeatureStates = {} as PolicyFeatureStates;
            let newlyEnabledFeature: PolicyFeatureName | null = null;
            (Object.keys(policy?.pendingFields ?? {}) as PolicyFeatureName[]).forEach((key) => {
                const isFeatureEnabled = isPolicyFeatureEnabled(policy, key);
                // Determine if this feature is newly enabled (wasn't enabled before but is now)
                if (isFeatureEnabled && !currentFeatureStates[key]) {
                    newlyEnabledFeature = key;
                }
                newFeatureStates[key] =
                    prevPendingFields?.[key] !== policy?.pendingFields?.[key] || isOffline || !policy?.pendingFields?.[key] ? isFeatureEnabled : currentFeatureStates[key];
            });

            // Only highlight the newly enabled feature
            if (newlyEnabledFeature) {
                setHighlightedFeature(newlyEnabledFeature);
            }

            return {
                ...policyFeatureStates,
                ...newFeatureStates,
            };
        });
    }, [policy, isOffline, policyFeatureStates, prevPendingFields]);

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    const prevPolicy = usePrevious(policy);

    const shouldShowPolicy = useMemo(() => checkIfShouldShowPolicy(policy, false, currentUserLogin), [policy, currentUserLogin]);
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = isPendingDeletePolicy(prevPolicy);
    // We check isPendingDelete and prevIsPendingDelete to prevent the NotFound view from showing right after we delete the workspace
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !shouldShowPolicy && (!isPendingDelete || prevIsPendingDelete);

    useEffect(() => {
        if (isEmptyObject(prevPolicy) || prevIsPendingDelete || !isPendingDelete) {
            return;
        }
        goBackFromInvalidPolicy();
    }, [isPendingDelete, policy, prevIsPendingDelete, prevPolicy]);

    // We are checking if the user can access the route.
    // If user can't access the route, we are dismissing any modals that are open when the NotFound view is shown
    const canAccessRoute = activeRoute && (workspaceMenuItems.some((item) => item.screenName === activeRoute) || activeRoute === SCREENS.WORKSPACE.INITIAL);

    useEffect(() => {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        if (wasRendered.current) {
            return;
        }
        wasRendered.current = true;
        // We are dismissing any modals that are open when the NotFound view is shown
        Navigation.isNavigationReady().then(() => {
            Navigation.closeRHPFlow();
        });
    }, [canAccessRoute, shouldShowNotFoundPage]);

    return (
        <WorkspaceInitialPageContent
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowPolicy={shouldShowPolicy}
            policy={policy}
            workspaceMenuItems={workspaceMenuItems}
            hasPolicyCreationError={hasPolicyCreationError}
            isExecuting={isExecuting}
            route={route}
            isPolicyExpenseChatEnabled={isPolicyExpenseChatEnabled}
            currentUserPolicyExpenseChatReportID={currentUserPolicyExpenseChatReportID}
            reportPendingAction={reportPendingAction}
            activeRoute={activeRoute}
            dismissError={dismissError}
        />
    );
}

WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export type {WorkspaceMenuItem};
export default withPolicyAndFullscreenLoading(WorkspaceInitialPage);
