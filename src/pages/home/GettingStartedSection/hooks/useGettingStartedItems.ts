import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {enablePolicyCategories} from '@libs/actions/Policy/Category';
import {hasCompanyCardFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {
    getValidConnectedIntegration,
    hasAccountingFeatureConnection,
    hasConfiguredRules,
    hasCustomCategories,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
} from '@libs/PolicyUtils';
import isWithinGettingStartedPeriod from '@pages/home/GettingStartedSection/utils/isWithinGettingStartedPeriod';
import {enableCompanyCards, enablePolicyConnections} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

const MIN_MEMBERS_FOR_ACCOUNTANT_INVITED = 2;

type GettingStartedItem = {
    key: string;
    label: string;
    isComplete: boolean;
    route: Route;
    isFeatureEnabled?: boolean;
    enableFeature?: () => void;
};

type UseGettingStartedItemsResult = {
    shouldShowSection: boolean;
    items: GettingStartedItem[];
};

const DIRECT_CONNECT_INTEGRATIONS = new Set<string>([
    CONST.POLICY.CONNECTIONS.NAME.QBO,
    CONST.POLICY.CONNECTIONS.NAME.QBD,
    CONST.POLICY.CONNECTIONS.NAME.XERO,
    CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
    CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
]);

function useGettingStartedItems(): UseGettingStartedItemsResult {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const intent = useOnboardingIntent();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [reportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${activePolicyID}`);
    const [allCardFeeds] = useCardFeeds(activePolicyID);
    const isAccountingEnabled = !!policy?.areConnectionsEnabled || hasAccountingFeatureConnection(policy);

    const emptyResult: UseGettingStartedItemsResult = {shouldShowSection: false, items: []};

    if (intent !== CONST.ONBOARDING_CHOICES.MANAGE_TEAM && intent !== CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        return emptyResult;
    }

    if (!activePolicyID || !policy || isPendingDeletePolicy(policy) || !isPaidGroupPolicy(policy)) {
        return emptyResult;
    }

    if (!isPolicyAdmin(policy)) {
        return emptyResult;
    }

    if (!isWithinGettingStartedPeriod(firstDayFreeTrial)) {
        return emptyResult;
    }

    const items: GettingStartedItem[] = [];

    items.push({
        key: 'createWorkspace',
        label: translate('homePage.gettingStartedSection.createWorkspace'),
        isComplete: true,
        route: shouldUseNarrowLayout ? ROUTES.WORKSPACE_INITIAL.getRoute(activePolicyID, Navigation.getActiveRoute()) : ROUTES.WORKSPACE_OVERVIEW.getRoute(activePolicyID),
    });

    if (intent === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        items.push({
            key: 'customizeCategories',
            label: translate('homePage.gettingStartedSection.customizeCategories'),
            isComplete: hasCustomCategories(policyCategories),
            route: ROUTES.WORKSPACE_CATEGORIES.getRoute(activePolicyID),
            isFeatureEnabled: policy.areCategoriesEnabled,
            enableFeature: () => enablePolicyCategories({policy, categories: policyCategories ?? {}, tags: {}, reports: [], transactionsAndViolations: {}}, true, false),
        });

        const activeMemberCount = Object.values(policy.employeeList ?? {}).filter((member) => member?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
        items.push({
            key: 'inviteAccountant',
            label: translate('homePage.gettingStartedSection.inviteAccountant'),
            isComplete: activeMemberCount >= MIN_MEMBERS_FOR_ACCOUNTANT_INVITED,
            route: ROUTES.WORKSPACE_MEMBERS.getRoute(activePolicyID),
        });

        return {shouldShowSection: true, items};
    }

    const isDirectConnect = !!reportedIntegration && DIRECT_CONNECT_INTEGRATIONS.has(reportedIntegration);

    if (isAccountingEnabled) {
        const integrationName = isDirectConnect
            ? (CONST.ONBOARDING_ACCOUNTING_MAPPING[reportedIntegration as keyof typeof CONST.ONBOARDING_ACCOUNTING_MAPPING] ?? String(reportedIntegration))
            : undefined;
        items.push({
            key: 'connectAccounting',
            label: integrationName ? translate('homePage.gettingStartedSection.connectAccounting', {integrationName}) : translate('homePage.gettingStartedSection.connectAccountingDefault'),
            isComplete: !!getValidConnectedIntegration(policy) || Object.values(policy?.connections ?? {}).some((conn) => !!conn?.lastSync?.successfulDate),
            route: ROUTES.WORKSPACE_ACCOUNTING.getRoute(activePolicyID),
            isFeatureEnabled: policy.areConnectionsEnabled,
            enableFeature: () => enablePolicyConnections(activePolicyID, true, false),
        });
    } else {
        items.push({
            key: 'customizeCategories',
            label: translate('homePage.gettingStartedSection.customizeCategories'),
            isComplete: hasCustomCategories(policyCategories),
            route: ROUTES.WORKSPACE_CATEGORIES.getRoute(activePolicyID),
            isFeatureEnabled: policy.areCategoriesEnabled,
            enableFeature: () => enablePolicyCategories({policy, categories: policyCategories ?? {}, tags: {}, reports: [], transactionsAndViolations: {}}, true, false),
        });
    }

    items.push({
        key: 'linkCompanyCards',
        label: translate('homePage.gettingStartedSection.linkCompanyCards'),
        isComplete: hasCompanyCardFeeds(allCardFeeds),
        route: ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(activePolicyID),
        isFeatureEnabled: policy.areCompanyCardsEnabled,
        enableFeature: () => enableCompanyCards(activePolicyID, true, false),
    });

    if (policy.areRulesEnabled) {
        items.push({
            key: 'setupRules',
            label: translate('homePage.gettingStartedSection.setupRules'),
            isComplete: hasConfiguredRules(policy),
            route: ROUTES.WORKSPACE_RULES.getRoute(activePolicyID),
        });
    }

    return {shouldShowSection: true, items};
}

export default useGettingStartedItems;
export type {GettingStartedItem, UseGettingStartedItemsResult};
