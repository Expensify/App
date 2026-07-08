import useBankLinkedPersonalCards from '@hooks/useBankLinkedPersonalCards';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {hasCompanyCardFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {
    arePolicyRulesEnabled,
    getValidConnectedIntegration,
    hasAccountingFeatureConnection,
    hasConfiguredRules,
    hasCustomCategories,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';
import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import isWithinGettingStartedPeriod from '@pages/home/GettingStartedSection/utils/isWithinGettingStartedPeriod';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import {hasIssuedExpensifyCardSelector} from '@selectors/Card';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';

const MIN_MEMBERS_FOR_ACCOUNTANT_INVITED = 2;

type GettingStartedItem = {
    key: string;
    label: string;
    subtitle?: string;
    isComplete: boolean;
    route?: Route;
    isFeatureEnabled?: boolean;
    onPress?: () => void;
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
    const workspaceAccountID = useWorkspaceAccountID(activePolicyID);

    // Subscribe to this workspace's Expensify Card list by its exact key rather than the whole cards collection. This scopes the
    // re-render to this workspace's issued-card state and prevents a workspaceAccountID that is a substring of another
    // workspace's ID from marking this step complete. Mirrors the pattern used in WorkspaceMoreFeaturesPage.
    const [hasIssuedExpensifyCard = false] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: hasIssuedExpensifyCardSelector,
    });
    const [hasCreatedExpense = false] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => Object.values(transactions ?? {}).some((transaction) => !!transaction && !isDeletedTransaction(transaction) && !isTransactionPendingDelete(transaction)),
    });
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const personalCards = useBankLinkedPersonalCards();
    const isAccountingEnabled = !!policy?.areConnectionsEnabled || hasAccountingFeatureConnection(policy);

    const emptyResult: UseGettingStartedItemsResult = {shouldShowSection: false, items: []};

    // Hide the whole section as soon as every onboarding to-do is complete, instead of keeping it
    // around for the full Getting Started window.
    const buildResult = (builtItems: GettingStartedItem[]): UseGettingStartedItemsResult => {
        if (builtItems.every((item) => item.isComplete)) {
            return emptyResult;
        }
        return {shouldShowSection: true, items: builtItems};
    };

    if (intent !== CONST.ONBOARDING_CHOICES.MANAGE_TEAM && intent !== CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE && intent !== CONST.ONBOARDING_CHOICES.TRACK_PERSONAL) {
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

    if (intent === CONST.ONBOARDING_CHOICES.TRACK_PERSONAL) {
        // Only surface the categories step while the Categories feature is enabled. Disabling it from the
        // More features menu hides this step, and re-enabling it brings the step back.
        if (policy.areCategoriesEnabled) {
            items.push({
                key: 'customizeSpendCategories',
                label: translate('homePage.gettingStartedSection.customizeSpendCategories'),
                isComplete: hasCustomCategories(policyCategories),
                route: ROUTES.WORKSPACE_CATEGORIES.getRoute(activePolicyID),
                isFeatureEnabled: true,
            });
        }

        items.push({
            key: 'createExpense',
            label: translate('homePage.gettingStartedSection.createExpense'),
            isComplete: hasCreatedExpense,
            onPress: () => startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs),
        });

        items.push({
            key: 'linkPersonalCard',
            label: translate('homePage.gettingStartedSection.linkPersonalCard'),
            isComplete: Object.keys(personalCards).length > 0,
            route: ROUTES.SETTINGS_WALLET,
        });

        return buildResult(items);
    }

    if (intent === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        if (policy.areCategoriesEnabled) {
            items.push({
                key: 'customizeCategories',
                label: translate('homePage.gettingStartedSection.customizeCategories'),
                isComplete: hasCustomCategories(policyCategories),
                route: ROUTES.WORKSPACE_CATEGORIES.getRoute(activePolicyID),
            });
        }

        if (policy.areCompanyCardsEnabled) {
            items.push({
                key: 'linkCompanyCards',
                label: translate('homePage.gettingStartedSection.linkCompanyCards'),
                isComplete: hasCompanyCardFeeds(allCardFeeds),
                route: ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(activePolicyID),
            });
        }

        const activeMemberCount = Object.values(policy.employeeList ?? {}).filter((member) => member?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
        items.push({
            key: 'inviteAccountant',
            label: translate('homePage.gettingStartedSection.inviteAccountant'),
            isComplete: activeMemberCount >= MIN_MEMBERS_FOR_ACCOUNTANT_INVITED,
            route: ROUTES.WORKSPACE_MEMBERS.getRoute(activePolicyID),
        });

        return buildResult(items);
    }

    const isDirectConnect = !!reportedIntegration && DIRECT_CONNECT_INTEGRATIONS.has(reportedIntegration);
    // Only route to the Connections page when the user picked a directly supported integration or the workspace already has a
    // real accounting connection. Otherwise (e.g. the "Other" onboarding choice merely enables the connections feature) we send
    // the user to customize categories instead of back to the integration list they already opted out of.
    const shouldShowConnectAccounting = isAccountingEnabled && (isDirectConnect || hasAccountingFeatureConnection(policy));

    if (shouldShowConnectAccounting) {
        const integrationName = isDirectConnect
            ? (CONST.ONBOARDING_ACCOUNTING_MAPPING[reportedIntegration as keyof typeof CONST.ONBOARDING_ACCOUNTING_MAPPING] ?? String(reportedIntegration))
            : undefined;
        items.push({
            key: 'connectAccounting',
            label: integrationName ? translate('homePage.gettingStartedSection.connectAccounting', {integrationName}) : translate('homePage.gettingStartedSection.connectAccountingDefault'),
            isComplete: !!getValidConnectedIntegration(policy) || Object.values(policy?.connections ?? {}).some((conn) => !!conn?.lastSync?.successfulDate),
            route: ROUTES.WORKSPACE_ACCOUNTING.getRoute(activePolicyID),
        });
    } else if (policy.areCategoriesEnabled) {
        items.push({
            key: 'customizeCategories',
            label: translate('homePage.gettingStartedSection.customizeCategories'),
            isComplete: hasCustomCategories(policyCategories),
            route: ROUTES.WORKSPACE_CATEGORIES.getRoute(activePolicyID),
        });
    }

    // The two card features are independent: each shows its own getting-started step only when that feature was enabled during onboarding
    if (policy.areCompanyCardsEnabled) {
        items.push({
            key: 'linkCompanyCards',
            label: translate('homePage.gettingStartedSection.linkCompanyCards'),
            isComplete: hasCompanyCardFeeds(allCardFeeds),
            route: ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(activePolicyID),
        });
    }

    if (policy.areExpensifyCardsEnabled) {
        items.push({
            key: 'issueExpensifyCards',
            label: translate('homePage.gettingStartedSection.issueExpensifyCards'),
            subtitle: translate('homePage.gettingStartedSection.issueExpensifyCardsSubtitle'),
            isComplete: hasIssuedExpensifyCard,
            route: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(activePolicyID),
        });
    }

    if (arePolicyRulesEnabled(policy, policyCategories)) {
        items.push({
            key: 'setupRules',
            label: translate('homePage.gettingStartedSection.setupRules'),
            isComplete: hasConfiguredRules(policy, policyCategories),
            route: ROUTES.WORKSPACE_RULES.getRoute(activePolicyID),
        });
    }

    return buildResult(items);
}

export default useGettingStartedItems;
export type {GettingStartedItem};
