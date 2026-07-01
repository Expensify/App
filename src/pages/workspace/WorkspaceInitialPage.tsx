import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigationState} from '@react-navigation/native';
import {emailSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import useIsWorkspacesTabFocused from '@hooks/useIsWorkspacesTabFocused';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {clearErrors, openPolicyInitialPage, removeWorkspace} from '@libs/actions/Policy/Policy';
import {isAnyHRConnected, isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import goBackFromWorkspaceSettingPages from '@libs/Navigation/helpers/goBackFromWorkspaceSettingPages';
import WorkspaceCreationReveal from '@libs/Navigation/helpers/WorkspaceCreationReveal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    arePolicyRulesEnabled,
    canMemberRead,
    canPolicyAccessFeature,
    shouldShowPolicy as checkIfShouldShowPolicy,
    goBackFromInvalidPolicy,
    hasAccountingFeatureConnection,
    hasPolicyCategoriesError,
    hasPolicyRulesError,
    isGroupPolicy,
    isPendingDeletePolicy,
    isTimeTrackingEnabled,
    shouldShowEmployeeListError,
    shouldShowSyncError,
    shouldShowTaxRateError,
} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type WORKSPACE_TO_RHP from '@navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceTopLevelScreens = keyof typeof WORKSPACE_TO_RHP;

type WorkspaceMenuItem = WithSentryLabel & {
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
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();

    const isFocused = useIsFocused();
    const isWorkspacesTabFocused = useIsWorkspacesTabFocused();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const wasRendered = useRef(false);

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const policyID = policy?.id;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID}`);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const {shouldShowEnterCredentialsError} = useGetReceiptPartnersIntegrationData(policyID);
    const {shouldShowRbrForWorkspaceAccountID} = useCardFeedErrors();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Building',
        'CalendarSolid',
        'Car',
        'Coins',
        'CreditCard',
        'Document',
        'ExpensifyAppIcon',
        'ExpensifyCard',
        'Feed',
        'Folder',
        'Gear',
        'Hashtag',
        'InvoiceGeneric',
        'Receipt',
        'Sync',
        'Tag',
        'Users',
        'Workflows',
        'LuggageWithLines',
        'Clock',
        'Bolt',
    ]);

    const policyName = policy?.name ?? '';
    const hasPolicyCreationError = policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(policy.errors);
    const canReadPolicyFeature = (policyFeature: PolicyFeature) => canMemberRead(policy, currentUserLogin ?? '', policyFeature);
    const canReadMoreFeatures = canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const shouldShowProtectedItems = [
        CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS,
        CONST.POLICY.POLICY_FEATURE.ACCOUNTING,
        CONST.POLICY.POLICY_FEATURE.CATEGORIES,
        CONST.POLICY.POLICY_FEATURE.TAGS,
        CONST.POLICY.POLICY_FEATURE.TAXES,
        CONST.POLICY.POLICY_FEATURE.WORKFLOWS,
        CONST.POLICY.POLICY_FEATURE.RULES,
        CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES,
        CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD,
        CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS,
        CONST.POLICY.POLICY_FEATURE.PER_DIEM,
        CONST.POLICY.POLICY_FEATURE.MORE_FEATURES,
    ].some(canReadPolicyFeature);

    const accountingConnectionNames = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES;
    const hasSyncError = shouldShowSyncError(policy, isConnectionInProgress(connectionSyncProgress, policy), accountingConnectionNames);
    const hasMembersError = shouldShowEmployeeListError(policy);
    const hasPolicyCategoryError = hasPolicyCategoriesError(policyCategories);
    const hasGeneralSettingsError =
        !isEmptyObject(policy?.errorFields?.name ?? {}) ||
        !isEmptyObject(policy?.errorFields?.avatarURL ?? {}) ||
        !isEmptyObject(policy?.errorFields?.outputCurrency ?? {}) ||
        !isEmptyObject(policy?.errorFields?.address ?? {});
    const shouldShowRBR = shouldShowRbrForWorkspaceAccountID[workspaceAccountID];

    const policyAvatar = !policy
        ? {source: expensifyIcons.ExpensifyAppIcon, name: CONST.EXPENSIFY_ICON_NAME, type: CONST.ICON_TYPE_AVATAR}
        : {
              source: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
              name: policy.name ?? '',
              type: CONST.ICON_TYPE_WORKSPACE,
              id: policy.id,
          };

    const policyFeatureStates = {
        [CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]: policy?.areDistanceRatesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]: policy?.areWorkflowsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]: policy?.areCategoriesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]: policy?.areTagsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]: policy?.tax?.trackingEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]: policy?.areCompanyCardsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]: !!policy?.areConnectionsEnabled || hasAccountingFeatureConnection(policy),
        [CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED]: (policy?.isHREnabled === true || isAnyHRConnected(policy)) && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]: policy?.areExpensifyCardsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]: policy?.areReportFieldsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: arePolicyRulesEnabled(policy, policyCategories),
        [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy?.areInvoicesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: policy?.arePerDiemRatesEnabled && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]: policy?.receiptPartners?.enabled ?? false,
        [CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED]: policy?.isTravelEnabled,
        [CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED]: isTimeTrackingEnabled(policy),
    } as PolicyFeatureStates;

    const prevPendingFields = usePrevious(policy?.pendingFields);

    // Detect the most recently enabled feature for highlight animation
    const highlightedFeature = (Object.keys(policyFeatureStates) as PolicyFeatureName[]).find((key) => policyFeatureStates[key] && !prevPendingFields?.[key] && policy?.pendingFields?.[key]);

    const prevPolicy = usePrevious(policy);
    const shouldShowPolicy = checkIfShouldShowPolicy(policy, true, currentUserLogin);
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = isPendingDeletePolicy(prevPolicy);
    // While the policy is being fetched (e.g., right after joinAccessiblePolicy), the role is not yet populated,
    // so checkIfShouldShowPolicy returns false. Suppress NotFound during this loading window.
    const computedShouldShowNotFoundPage = isWorkspacesTabFocused && !shouldShowPolicy && !policy?.isLoading && (!isPendingDelete || prevIsPendingDelete);
    // Latch to true: once the not-found state is detected, keep showing it so the normal
    // workspace content doesn't flash during the exit animation when navigation state
    // changes (e.g., isWorkspacesTabFocused becomes false after StackActions.pop()).
    const prevShouldShowNotFoundPage = usePrevious(computedShouldShowNotFoundPage);
    const shouldShowNotFoundPage = computedShouldShowNotFoundPage || !!prevShouldShowNotFoundPage;
    const fetchPolicyData = () => {
        if (policyDraft?.id || !isFocused) {
            return;
        }
        openPolicyInitialPage(route.params.policyID);
    };
    useNetwork({onReconnect: fetchPolicyData});
    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    // Navigate away when workspace is deleted
    useEffect(() => {
        if (!isFocused || isEmptyObject(prevPolicy) || prevIsPendingDelete || !isPendingDelete) {
            return;
        }
        goBackFromInvalidPolicy();
    }, [isFocused, isPendingDelete, policy, prevIsPendingDelete, prevPolicy]);

    const workspaceMenuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.profile',
            icon: expensifyIcons.Building,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.PROFILE,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PROFILE,
        },
        {
            translationKey: 'workspace.common.members',
            icon: expensifyIcons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.MEMBERS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MEMBERS,
        },
    ];

    if (isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE)) {
        workspaceMenuItems.push({
            translationKey: 'workspace.common.rooms',
            icon: expensifyIcons.Hashtag,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ROOMS.getRoute(policyID)))),
            screenName: SCREENS.WORKSPACE.ROOMS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ROOMS,
        });
    }

    if (isGroupPolicy(policy) && shouldShowProtectedItems) {
        if (canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS)) {
            workspaceMenuItems.push({
                translationKey: 'common.reports',
                icon: expensifyIcons.Document,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REPORTS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.REPORTS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.REPORTS,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.ACCOUNTING)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.accounting',
                icon: expensifyIcons.Sync,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID)))),
                brickRoadIndicator: hasSyncError || shouldShowQBOReimbursableExportDestinationAccountError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ACCOUNTING,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED] && canReadMoreFeatures) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.hr',
                brickRoadIndicator: isMergeHRCompleteSetupNeeded(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined,
                icon: expensifyIcons.Users,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_HR.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.HR,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.HR,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED] && canReadMoreFeatures) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.receiptPartners',
                brickRoadIndicator: shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                icon: expensifyIcons.Receipt,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.RECEIPT_PARTNERS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RECEIPT_PARTNERS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.CATEGORIES)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.categories',
                icon: expensifyIcons.Folder,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)))),
                brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.CATEGORIES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.CATEGORIES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAGS)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.tags',
                icon: expensifyIcons.Tag,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TAGS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAGS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAXES)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.taxes',
                icon: expensifyIcons.Coins,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TAXES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAXES,
                brickRoadIndicator: shouldShowTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.WORKFLOWS)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.workflows',
                icon: expensifyIcons.Workflows,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.WORKFLOWS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.WORKFLOWS,
                brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.RULES)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.rules',
                icon: isBetaEnabled(CONST.BETAS.RULES_REVAMP) ? expensifyIcons.Bolt : expensifyIcons.Feed,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_RULES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.RULES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RULES,
                brickRoadIndicator: hasPolicyRulesError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.distanceRates',
                icon: expensifyIcons.Car,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.DISTANCE_RATES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.DISTANCE_RATES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED] && canReadMoreFeatures) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.travel',
                icon: expensifyIcons.LuggageWithLines,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TRAVEL,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TRAVEL,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.expensifyCard',
                icon: expensifyIcons.ExpensifyCard,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.EXPENSIFY_CARD,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS)) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.companyCards',
                icon: expensifyIcons.CreditCard,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.COMPANY_CARDS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.COMPANY_CARDS,
                brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.PER_DIEM)) {
            workspaceMenuItems.push({
                translationKey: 'common.perDiem',
                icon: expensifyIcons.CalendarSolid,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.PER_DIEM,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PER_DIEM,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED] && canReadMoreFeatures) {
            workspaceMenuItems.push({
                translationKey: 'iou.time',
                icon: expensifyIcons.Clock,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TIME_TRACKING,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TIME_TRACKING,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED,
            });
        }

        if (policyFeatureStates?.[CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED] && canReadMoreFeatures) {
            const currencyCode = policy?.outputCurrency ?? CONST.CURRENCY.USD;
            workspaceMenuItems.push({
                translationKey: 'workspace.common.invoices',
                icon: expensifyIcons.InvoiceGeneric,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.INVOICES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.INVOICES,
                badgeText: convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, currencyCode),
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
            });
        }

        if (canReadMoreFeatures) {
            workspaceMenuItems.push({
                translationKey: 'workspace.common.moreFeatures',
                icon: expensifyIcons.Gear,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.MORE_FEATURES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MORE_FEATURES,
            });
        }
    }

    // Close RHP if we land on a route that no longer exists in the menu
    const canAccessRoute = activeRoute && (workspaceMenuItems.some((item) => item.screenName === activeRoute) || activeRoute === SCREENS.WORKSPACE.INITIAL);
    useEffect(() => {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        if (wasRendered.current) {
            return;
        }
        wasRendered.current = true;
        Navigation.isNavigationReady().then(() => {
            Navigation.closeRHPFlow();
        });
    }, [canAccessRoute, shouldShowNotFoundPage]);

    // When this page is revealed from under the RHP during workspace creation (#90985), the RHP
    // slide-out is held until the page has painted. Signal readiness from the first non-empty layout
    // of the actual content (not the navigator container, which lays out at full height before this
    // lazy page mounts) and defer one frame so paint completes before the RHP slides away.
    // notifyRevealUnderRHPReady is a no-op unless a reveal is pending, so this costs nothing on
    // normal navigation.
    const hasReportedRevealReadinessRef = useRef(false);
    const handleRevealContentLayout = (event: LayoutChangeEvent) => {
        if (hasReportedRevealReadinessRef.current || event.nativeEvent.layout.height === 0) {
            return;
        }
        hasReportedRevealReadinessRef.current = true;
        requestAnimationFrame(() => WorkspaceCreationReveal.notifyRevealUnderRHPReady());
    };

    return (
        <ScreenWrapper
            testID="WorkspaceInitialPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            bottomContentStyle={styles.overflowVisible}
        >
            <FullPageNotFoundView
                onBackButtonPress={goBackFromWorkspaceSettingPages}
                onLinkPress={Navigation.goBackToHome}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined}
                addBottomSafeAreaPadding
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={policyName}
                    onBackButtonPress={() => Navigation.goBack(route.params?.backTo ?? ROUTES.WORKSPACES_LIST.route)}
                    policyAvatar={policyAvatar}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={[styles.flexColumn, styles.pb14]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID, policy?.pendingAction)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                        shouldDisableStrikeThrough={false}
                        shouldHideOnDelete={false}
                        shouldShowErrorMessages={false}
                    >
                        <View
                            style={[styles.pb4, styles.mh3, styles.mt3]}
                            onLayout={handleRevealContentLayout}
                        >
                            {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                            {workspaceMenuItems.map((item) => (
                                <HighlightableMenuItem
                                    key={item.translationKey}
                                    disabled={hasPolicyCreationError || isExecuting}
                                    interactive={!hasPolicyCreationError}
                                    title={translate(item.translationKey)}
                                    icon={item.icon}
                                    onPress={item.action}
                                    brickRoadIndicator={item.brickRoadIndicator}
                                    wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                                    highlighted={!!item?.highlighted}
                                    focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                    role={CONST.ROLE.TAB}
                                    badgeText={item.badgeText}
                                    shouldIconUseAutoWidthStyle
                                    sentryLabel={item.sentryLabel}
                                />
                            ))}
                        </View>
                    </OfflineWithFeedback>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceInitialPage);
