/**
 * Builds the ordered Workspace menu items with their visibility and indicator states.
 */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {isAnyHRConnected, isMergeHRCompleteSetupNeeded, shouldShowHRConnectionError} from '@libs/merge/HRUtils';
import {getObjectKeys} from '@libs/ObjectUtils';
import {
    arePolicyRulesEnabled,
    canMemberRead,
    canPolicyAccessFeature,
    hasAccountingFeatureConnection,
    hasPolicyCategoriesError,
    hasPolicyRulesError,
    hasVendorFeature,
    isGroupPolicy,
    isMatchingVendorListLoaded,
    isPerDiemEnabled,
    isPolicyAdmin,
    isTimeTrackingEnabled,
    shouldShowEmployeeListError,
    shouldShowSyncError,
    shouldShowTaxRateError,
} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';

import type WORKSPACE_TO_RHP from '@navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ValueOf} from 'type-fest';

/**
 * Icons used by Workspace menu items. They are injected instead of imported from Expensicons so the page keeps lazy-loading them and this helper remains unit-testable.
 * Keep this map in sync with the icons referenced by the menu items below.
 */
type WorkspaceMenuIconMap = Record<
    | 'Building'
    | 'Users'
    | 'Hashtag'
    | 'Document'
    | 'Sync'
    | 'Receipt'
    | 'Briefcase'
    | 'Folder'
    | 'Tag'
    | 'Coins'
    | 'Workflows'
    | 'Feed'
    | 'Car'
    | 'LuggageWithLines'
    | 'ExpensifyCard'
    | 'CreditCard'
    | 'CalendarSolid'
    | 'Clock'
    | 'InvoiceGeneric'
    | 'Gear'
    | 'Bolt',
    IconAsset
>;

/** Workspace screens that can be opened from the top-level Workspace menu. */
type WorkspaceTopLevelScreens = keyof typeof WORKSPACE_TO_RHP;

/** Data needed to render and navigate from a Workspace menu item. */
type WorkspaceMenuItem = WithSentryLabel & {
    translationKey: TranslationPaths;
    icon: IconAsset;
    getRoute: () => Route;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: WorkspaceTopLevelScreens;
    badgeText?: string;
    highlighted?: boolean;
};

/** Inputs used to build the Workspace menu while preserving its visibility and indicator rules. */
type GetWorkspaceMenuItemsParams = {
    /** Workspace policy used to determine menu visibility and indicators. */
    policy: OnyxTypes.Policy | undefined;
    /** Workspace policy ID used to build destination routes. */
    policyID: string | undefined;
    /** Login used to determine the member's feature access. */
    currentUserLogin?: string;
    /** Lazily loaded icons used by the menu items. */
    icons: WorkspaceMenuIconMap;
    /** Whether an accounting connection is currently syncing. */
    isConnectionInProgress?: boolean;
    /** Categories used to determine category-related errors. */
    policyCategories?: OnyxTypes.PolicyCategories;
    /** Previous pending fields used to identify the most recently enabled feature. */
    previousPendingFields?: OnyxTypes.Policy['pendingFields'];
    /** Whether receipt partner credentials require attention. */
    shouldShowEnterCredentialsError?: boolean;
    /** Whether the company cards row should show an error indicator. */
    shouldShowRBR?: boolean;
    /** Whether the Rules revamp beta is enabled. */
    isRulesRevampBetaEnabled?: boolean;
    /** Whether the vendor matching beta is enabled. */
    isVendorMatchingBetaEnabled?: boolean;
    /** Formats the invoice account balance for its menu badge. */
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

function getWorkspaceMenuItems({
    policy,
    policyID,
    currentUserLogin,
    icons,
    isConnectionInProgress = false,
    policyCategories,
    previousPendingFields,
    shouldShowEnterCredentialsError = false,
    shouldShowRBR = false,
    isRulesRevampBetaEnabled = false,
    isVendorMatchingBetaEnabled = false,
    convertToDisplayString,
}: GetWorkspaceMenuItemsParams): WorkspaceMenuItem[] {
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
    const hasSyncError = shouldShowSyncError(policy, isConnectionInProgress, accountingConnectionNames);
    const hasHRError = shouldShowHRConnectionError(policy, isConnectionInProgress, isPolicyAdmin(policy));
    const getHRBrickRoadIndicator = () => {
        if (hasHRError) {
            return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }
        if (isMergeHRCompleteSetupNeeded(policy)) {
            return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }
    };
    const hasMembersError = shouldShowEmployeeListError(policy);
    const hasPolicyCategoryError = hasPolicyCategoriesError(policyCategories);
    const hasGeneralSettingsError =
        !isEmptyObject(policy?.errorFields?.name ?? {}) ||
        !isEmptyObject(policy?.errorFields?.avatarURL ?? {}) ||
        !isEmptyObject(policy?.errorFields?.outputCurrency ?? {}) ||
        !isEmptyObject(policy?.errorFields?.address ?? {});

    const policyFeatureStates: Partial<Record<PolicyFeatureName, boolean | undefined>> = {
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
        [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: arePolicyRulesEnabled(policy, policyCategories, isRulesRevampBetaEnabled),
        [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy?.areInvoicesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: isPerDiemEnabled(policy) && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]: policy?.receiptPartners?.enabled ?? false,
        [CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED]: policy?.isTravelEnabled,
        [CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED]: isTimeTrackingEnabled(policy),
    };
    const highlightedPolicyFeature = getObjectKeys(policyFeatureStates).find((key) => policyFeatureStates[key] && !previousPendingFields?.[key] && policy?.pendingFields?.[key]);

    const items: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.profile',
            icon: icons.Building,
            getRoute: () => ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.PROFILE,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PROFILE,
        },
        {
            translationKey: 'workspace.common.members',
            icon: icons.Users,
            getRoute: () => ROUTES.WORKSPACE_MEMBERS.getRoute(policyID),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.MEMBERS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MEMBERS,
        },
        {
            translationKey: 'workspace.common.rooms',
            icon: icons.Hashtag,
            getRoute: () => ROUTES.WORKSPACE_ROOMS.getRoute(policyID),
            screenName: SCREENS.WORKSPACE.ROOMS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ROOMS,
        },
    ];

    if (isGroupPolicy(policy) && shouldShowProtectedItems) {
        if (canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS)) {
            items.push({
                translationKey: 'common.reports',
                icon: icons.Document,
                getRoute: () => ROUTES.WORKSPACE_REPORTS.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.REPORTS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.REPORTS,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.ACCOUNTING)) {
            items.push({
                translationKey: 'workspace.common.accounting',
                icon: icons.Sync,
                getRoute: () => ROUTES.POLICY_ACCOUNTING.getRoute(policyID),
                brickRoadIndicator: hasSyncError || shouldShowQBOReimbursableExportDestinationAccountError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ACCOUNTING,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.hr',
                icon: icons.Users,
                getRoute: () => ROUTES.WORKSPACE_HR.getRoute(policyID),
                brickRoadIndicator: getHRBrickRoadIndicator(),
                screenName: SCREENS.WORKSPACE.HR,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.HR,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.receiptPartners',
                icon: icons.Receipt,
                getRoute: () => ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID),
                brickRoadIndicator: shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.RECEIPT_PARTNERS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RECEIPT_PARTNERS,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.CATEGORIES)) {
            items.push({
                translationKey: 'workspace.common.categories',
                icon: icons.Folder,
                getRoute: () => ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID),
                brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.CATEGORIES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.CATEGORIES,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
            });
        }

        if (canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.VENDORS) && hasVendorFeature(policy, isVendorMatchingBetaEnabled) && isMatchingVendorListLoaded(policy)) {
            items.push({
                translationKey: 'workspace.common.vendors',
                icon: icons.Briefcase,
                getRoute: () => ROUTES.WORKSPACE_VENDORS.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.VENDORS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.VENDORS,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAGS)) {
            items.push({
                translationKey: 'workspace.common.tags',
                icon: icons.Tag,
                getRoute: () => ROUTES.WORKSPACE_TAGS.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TAGS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAGS,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAXES)) {
            items.push({
                translationKey: 'workspace.common.taxes',
                icon: icons.Coins,
                getRoute: () => ROUTES.WORKSPACE_TAXES.getRoute(policyID),
                brickRoadIndicator: shouldShowTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.TAXES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAXES,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.WORKFLOWS)) {
            items.push({
                translationKey: 'workspace.common.workflows',
                icon: icons.Workflows,
                getRoute: () => ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID),
                brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.WORKFLOWS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.WORKFLOWS,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.RULES)) {
            items.push({
                translationKey: 'workspace.common.rules',
                icon: isRulesRevampBetaEnabled ? icons.Bolt : icons.Feed,
                getRoute: () => ROUTES.WORKSPACE_RULES.getRoute(policyID),
                brickRoadIndicator: hasPolicyRulesError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.RULES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RULES,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES)) {
            items.push({
                translationKey: 'workspace.common.distanceRates',
                icon: icons.Car,
                getRoute: () => ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.DISTANCE_RATES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.DISTANCE_RATES,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.travel',
                icon: icons.LuggageWithLines,
                getRoute: () => ROUTES.WORKSPACE_TRAVEL.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TRAVEL,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TRAVEL,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)) {
            items.push({
                translationKey: 'workspace.common.expensifyCard',
                icon: icons.ExpensifyCard,
                getRoute: () => ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.EXPENSIFY_CARD,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS)) {
            items.push({
                translationKey: 'workspace.common.companyCards',
                icon: icons.CreditCard,
                getRoute: () => ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID),
                brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.COMPANY_CARDS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.COMPANY_CARDS,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.PER_DIEM)) {
            items.push({
                translationKey: 'common.perDiem',
                icon: icons.CalendarSolid,
                getRoute: () => ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.PER_DIEM,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PER_DIEM,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'iou.time',
                icon: icons.Clock,
                getRoute: () => ROUTES.WORKSPACE_TIME_TRACKING.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TIME_TRACKING,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TIME_TRACKING,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED] && canReadMoreFeatures) {
            const currencyCode = policy?.outputCurrency ?? CONST.CURRENCY.USD;
            items.push({
                translationKey: 'workspace.common.invoices',
                icon: icons.InvoiceGeneric,
                getRoute: () => ROUTES.WORKSPACE_INVOICES.getRoute(policyID),
                badgeText: convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, currencyCode),
                screenName: SCREENS.WORKSPACE.INVOICES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.INVOICES,
                highlighted: highlightedPolicyFeature === CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
            });
        }

        if (canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.moreFeatures',
                icon: icons.Gear,
                getRoute: () => ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.MORE_FEATURES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MORE_FEATURES,
            });
        }
    }

    return items;
}

export default getWorkspaceMenuItems;
