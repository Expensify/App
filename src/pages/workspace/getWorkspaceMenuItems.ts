import type {ValueOf} from 'type-fest';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {isAnyHRConnected, isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import {
    canMemberRead,
    canPolicyAccessFeature,
    hasAccountingFeatureConnection,
    hasPolicyCategoriesError,
    hasPolicyRulesError,
    isGroupPolicy,
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

type WorkspaceMenuIconMap = Record<
    | 'Building'
    | 'Users'
    | 'Hashtag'
    | 'Document'
    | 'Sync'
    | 'Receipt'
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
    | 'Gear',
    IconAsset
>;

type WorkspaceTopLevelScreens = keyof typeof WORKSPACE_TO_RHP;

type WorkspaceMenuItem = WithSentryLabel & {
    translationKey: TranslationPaths;
    icon: IconAsset;
    route: Route;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: WorkspaceTopLevelScreens;
    badgeText?: string;
    highlighted?: boolean;
};

type GetWorkspaceMenuItemsParams = {
    policy: OnyxTypes.Policy | undefined;
    policyID: string | undefined;
    currentUserLogin?: string;
    icons: WorkspaceMenuIconMap;
    isRoomsPageBetaEnabled: boolean;
    highlightedFeature?: PolicyFeatureName;
    isConnectionInProgress?: boolean;
    policyCategories?: OnyxTypes.PolicyCategories;
    shouldShowEnterCredentialsError?: boolean;
    shouldShowRBR?: boolean;
    convertToDisplayString: (amount?: number, currency?: string) => string;
};

function getWorkspaceMenuItems({
    policy,
    policyID,
    currentUserLogin,
    icons,
    isRoomsPageBetaEnabled,
    highlightedFeature,
    isConnectionInProgress = false,
    policyCategories,
    shouldShowEnterCredentialsError = false,
    shouldShowRBR = false,
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
        [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: policy?.areRulesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy?.areInvoicesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: policy?.arePerDiemRatesEnabled && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]: policy?.receiptPartners?.enabled ?? false,
        [CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED]: policy?.isTravelEnabled,
        [CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED]: isTimeTrackingEnabled(policy),
    };

    const items: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.profile',
            icon: icons.Building,
            route: ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.PROFILE,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PROFILE,
        },
        {
            translationKey: 'workspace.common.members',
            icon: icons.Users,
            route: ROUTES.WORKSPACE_MEMBERS.getRoute(policyID),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.MEMBERS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MEMBERS,
        },
    ];

    if (isRoomsPageBetaEnabled) {
        items.push({
            translationKey: 'workspace.common.rooms',
            icon: icons.Hashtag,
            route: ROUTES.WORKSPACE_ROOMS.getRoute(policyID),
            screenName: SCREENS.WORKSPACE.ROOMS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ROOMS,
        });
    }

    if (isGroupPolicy(policy) && shouldShowProtectedItems) {
        if (canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS)) {
            items.push({
                translationKey: 'common.reports',
                icon: icons.Document,
                route: ROUTES.WORKSPACE_REPORTS.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.REPORTS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.REPORTS,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.ACCOUNTING)) {
            items.push({
                translationKey: 'workspace.common.accounting',
                icon: icons.Sync,
                route: ROUTES.POLICY_ACCOUNTING.getRoute(policyID),
                brickRoadIndicator: hasSyncError || shouldShowQBOReimbursableExportDestinationAccountError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.ACCOUNTING,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.hr',
                icon: icons.Users,
                route: ROUTES.WORKSPACE_HR.getRoute(policyID),
                brickRoadIndicator: isMergeHRCompleteSetupNeeded(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined,
                screenName: SCREENS.WORKSPACE.HR,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.HR,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.receiptPartners',
                icon: icons.Receipt,
                route: ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID),
                brickRoadIndicator: shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.RECEIPT_PARTNERS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RECEIPT_PARTNERS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.CATEGORIES)) {
            items.push({
                translationKey: 'workspace.common.categories',
                icon: icons.Folder,
                route: ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID),
                brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.CATEGORIES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.CATEGORIES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAGS)) {
            items.push({
                translationKey: 'workspace.common.tags',
                icon: icons.Tag,
                route: ROUTES.WORKSPACE_TAGS.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TAGS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAGS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.TAXES)) {
            items.push({
                translationKey: 'workspace.common.taxes',
                icon: icons.Coins,
                route: ROUTES.WORKSPACE_TAXES.getRoute(policyID),
                brickRoadIndicator: shouldShowTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.TAXES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TAXES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.WORKFLOWS)) {
            items.push({
                translationKey: 'workspace.common.workflows',
                icon: icons.Workflows,
                route: ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID),
                brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.WORKFLOWS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.WORKFLOWS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.RULES)) {
            items.push({
                translationKey: 'workspace.common.rules',
                icon: icons.Feed,
                route: ROUTES.WORKSPACE_RULES.getRoute(policyID),
                brickRoadIndicator: hasPolicyRulesError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.RULES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.RULES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES)) {
            items.push({
                translationKey: 'workspace.common.distanceRates',
                icon: icons.Car,
                route: ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.DISTANCE_RATES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.DISTANCE_RATES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.travel',
                icon: icons.LuggageWithLines,
                route: ROUTES.WORKSPACE_TRAVEL.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TRAVEL,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TRAVEL,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)) {
            items.push({
                translationKey: 'workspace.common.expensifyCard',
                icon: icons.ExpensifyCard,
                route: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.EXPENSIFY_CARD,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS)) {
            items.push({
                translationKey: 'workspace.common.companyCards',
                icon: icons.CreditCard,
                route: ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID),
                brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.COMPANY_CARDS,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.COMPANY_CARDS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED] && canReadPolicyFeature(CONST.POLICY.POLICY_FEATURE.PER_DIEM)) {
            items.push({
                translationKey: 'common.perDiem',
                icon: icons.CalendarSolid,
                route: ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.PER_DIEM,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.PER_DIEM,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED] && canReadMoreFeatures) {
            items.push({
                translationKey: 'iou.time',
                icon: icons.Clock,
                route: ROUTES.WORKSPACE_TIME_TRACKING.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.TIME_TRACKING,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.TIME_TRACKING,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED,
            });
        }

        if (policyFeatureStates[CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED] && canReadMoreFeatures) {
            const currencyCode = policy?.outputCurrency ?? CONST.CURRENCY.USD;
            items.push({
                translationKey: 'workspace.common.invoices',
                icon: icons.InvoiceGeneric,
                route: ROUTES.WORKSPACE_INVOICES.getRoute(policyID),
                badgeText: convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, currencyCode),
                screenName: SCREENS.WORKSPACE.INVOICES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.INVOICES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
            });
        }

        if (canReadMoreFeatures) {
            items.push({
                translationKey: 'workspace.common.moreFeatures',
                icon: icons.Gear,
                route: ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID),
                screenName: SCREENS.WORKSPACE.MORE_FEATURES,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.INITIAL.MORE_FEATURES,
            });
        }
    }

    return items;
}

export default getWorkspaceMenuItems;
