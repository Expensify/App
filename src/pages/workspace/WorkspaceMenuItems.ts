import type {ValueOf} from 'type-fest';
import {
    Building,
    CalendarSolid,
    Car,
    Coins,
    CreditCard,
    Document,
    ExpensifyCard,
    Feed,
    Folder,
    Gear,
    InvoiceGeneric,
    Receipt,
    Sync,
    Tag,
    Users,
    Workflows,
} from '@components/Icon/Expensicons';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {checkIfFeedConnectionIsBroken, flatAllCardsList} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, shouldShowTaxRateError} from '@libs/PolicyUtils';
import type WORKSPACE_TO_RHP from '@navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

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

type PolicyFeatureStates = Record<PolicyFeatureName, boolean>;

type GetWorkspaceMenuItemsParams = {
    policy: Policy | undefined;
    featureStates: PolicyFeatureStates;
    workspaceAccountID: number;
    hasSyncError: boolean;
    hasGeneralSettingsError: boolean;
    hasMembersError: boolean;
    hasPolicyCategoryError: boolean;
    shouldShowProtectedItems: boolean;
    shouldShowEnterCredentialsError: boolean;
    highlightedFeature: string | undefined;
    cardsDomainIDs: number[];
    singleExecution: <T extends unknown[]>(func: (...args: T) => void) => (...args: T) => void;
    waitForNavigate: <T extends unknown[]>(func: (...args: T) => void) => (...args: T) => void;
    allFeedsCards: Record<string, WorkspaceCardsList | undefined> | undefined;
};

function getWorkspaceMenuItems({
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
}: GetWorkspaceMenuItemsParams): WorkspaceMenuItem[] {
    if (!policy) {
        return [];
    }

    const protectedMenuItems: WorkspaceMenuItem[] = [];

    protectedMenuItems.push({
        translationKey: 'common.reports',
        icon: Document,
        action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REPORTS.getRoute(policy.id)))),
        screenName: SCREENS.WORKSPACE.REPORTS,
    });

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.accounting',
            icon: Sync,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policy.id)))),
            brickRoadIndicator: hasSyncError || shouldShowQBOReimbursableExportDestinationAccountError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.receiptPartners',
            brickRoadIndicator: shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            icon: Receipt,
            action: singleExecution(
                waitForNavigate(() => {
                    Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policy.id));
                }),
            ),
            screenName: SCREENS.WORKSPACE.RECEIPT_PARTNERS,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.categories',
            icon: Folder,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policy.id)))),
            brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.CATEGORIES,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.tags',
            icon: Tag,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.TAGS,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.taxes',
            icon: Coins,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.TAXES,
            brickRoadIndicator: shouldShowTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.workflows',
            icon: Workflows,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.WORKFLOWS,
            brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.rules',
            icon: Feed,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_RULES.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.RULES,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.distanceRates',
            icon: Car,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.DISTANCE_RATES,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'workspace.common.expensifyCard',
            icon: ExpensifyCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]) {
        const hasBrokenFeedConnection = checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, workspaceAccountID, cardsDomainIDs));

        protectedMenuItems.push({
            translationKey: 'workspace.common.companyCards',
            icon: CreditCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.COMPANY_CARDS,
            brickRoadIndicator: hasBrokenFeedConnection ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]) {
        protectedMenuItems.push({
            translationKey: 'common.perDiem',
            icon: CalendarSolid,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.PER_DIEM,
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
        });
    }

    if (featureStates[CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]) {
        const currencyCode = policy.outputCurrency ?? CONST.CURRENCY.USD;
        protectedMenuItems.push({
            translationKey: 'workspace.common.invoices',
            icon: InvoiceGeneric,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policy.id)))),
            screenName: SCREENS.WORKSPACE.INVOICES,
            badgeText: convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, currencyCode),
            highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
        });
    }

    protectedMenuItems.push({
        translationKey: 'workspace.common.moreFeatures',
        icon: Gear,
        action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policy.id)))),
        screenName: SCREENS.WORKSPACE.MORE_FEATURES,
    });

    return [
        {
            translationKey: 'workspace.common.profile',
            icon: Building,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policy.id)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.PROFILE,
        },
        {
            translationKey: 'workspace.common.members',
            icon: Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policy.id)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            screenName: SCREENS.WORKSPACE.MEMBERS,
        },
        ...(isPaidGroupPolicy(policy) && shouldShowProtectedItems ? protectedMenuItems : []),
    ];
}

export default getWorkspaceMenuItems;
