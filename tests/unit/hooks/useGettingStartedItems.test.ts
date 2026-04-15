import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useGettingStartedItems from '@pages/home/GettingStartedSection/hooks/useGettingStartedItems';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, string>) => {
            if (params && 'integrationName' in params) {
                return `${key}:${params.integrationName}`;
            }
            return key;
        }),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@userActions/Policy/Category', () => ({enablePolicyCategories: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({enableCompanyCards: jest.fn(), enablePolicyConnections: jest.fn(), enablePolicyRules: jest.fn()}));

const POLICY_ID = '1';

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Test Workspace'),
        id: POLICY_ID,
        pendingAction: undefined,
        role: CONST.POLICY.ROLE.ADMIN,
        areCompanyCardsEnabled: false,
        areRulesEnabled: false,
        connections: undefined,
        rules: undefined,
        customRules: undefined,
        ...overrides,
    };
}

async function setupManageTeamScenario(overrides: {policy?: Partial<Policy>; accounting?: string | null; firstDayTrial?: string; lastDayTrial?: string} = {}) {
    const policy = buildPolicy(overrides.policy);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
    await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);

    if (overrides.accounting !== undefined) {
        await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, overrides.accounting as never);
    }

    const now = new Date();
    const firstDay = overrides.firstDayTrial ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    const lastDay = overrides.lastDayTrial ?? new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDay);
    await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDay);

    await waitForBatchedUpdates();
}

describe('useGettingStartedItems', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('visibility rules', () => {
        it('should return no items when onboarding intent is not MANAGE_TEAM', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should return no items when ONBOARDING_PURPOSE_SELECTED is set to a non-manage-team value and NVP_INTRO_SELECTED is not loaded', async () => {
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.EMPLOYER);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should use NVP_INTRO_SELECTED.choice as primary source for intent detection', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should fall back to ONBOARDING_PURPOSE_SELECTED when NVP_INTRO_SELECTED is not available', async () => {
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
        });

        it('should be hidden after 60 days from NVP_FIRST_DAY_FREE_TRIAL', async () => {
            const sixtyOneDaysAgo = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                firstDayTrial: sixtyOneDaysAgo,
                lastDayTrial: thirtyDaysAgo,
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should be visible within 60 days from NVP_FIRST_DAY_FREE_TRIAL', async () => {
            const fiftyNineDaysAgo = new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                firstDayTrial: fiftyNineDaysAgo,
                lastDayTrial: twentyNineDaysAgo,
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
        });

        it('should be hidden when NVP_FIRST_DAY_FREE_TRIAL is in the future (pre-trial)', async () => {
            const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            const fortyDaysFromNow = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                firstDayTrial: tenDaysFromNow,
                lastDayTrial: fortyDaysFromNow,
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should be hidden when NVP_FIRST_DAY_FREE_TRIAL is not set (not a new sign-up)', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
        });
    });

    describe('row 1 - Create a workspace', () => {
        it('should always be present for manage-team intent', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());

            const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
            expect(createWorkspaceItem).toBeDefined();
        });

        it('should always be checked (completed)', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());

            const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
            expect(createWorkspaceItem?.isComplete).toBe(true);
        });

        it('should be the first item', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.items.at(0)?.key).toBe('createWorkspace');
        });

        it('should navigate to the workspace overview route', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());

            const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
            expect(createWorkspaceItem?.route).toBe(ROUTES.WORKSPACE_OVERVIEW.getRoute(POLICY_ID));
        });
    });

    describe('row 2a - Connect to [accounting system]', () => {
        const directConnectIntegrations = [
            {key: CONST.POLICY.CONNECTIONS.NAME.QBO, name: 'QuickBooks Online'},
            {key: CONST.POLICY.CONNECTIONS.NAME.QBD, name: 'QuickBooks Desktop'},
            {key: CONST.POLICY.CONNECTIONS.NAME.XERO, name: 'Xero'},
            {key: CONST.POLICY.CONNECTIONS.NAME.NETSUITE, name: 'NetSuite'},
            {key: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, name: 'Sage Intacct'},
        ];

        it.each(directConnectIntegrations)('should show "Connect to $name" when user selected $key in onboarding', async ({key, name}) => {
            await setupManageTeamScenario({accounting: key, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeDefined();
            expect(connectItem?.label).toContain(name);
        });

        it('should navigate to workspace accounting route', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.route).toBe(ROUTES.WORKSPACE_ACCOUNTING.getRoute(POLICY_ID));
        });

        it('should be not completed when workspace has no accounting connection', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, connections: undefined},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has a successful accounting connection', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: true,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {},
                            data: {},
                            lastSync: {isConnected: true},
                        },
                    } as Policy['connections'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(true);
        });

        it('should not be completed when the initial connection attempt failed', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: true,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {},
                            data: {},
                            lastSync: {isConnected: false},
                        },
                    } as Policy['connections'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(false);
        });

        it('should stay completed when a previously successful connection later breaks', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: true,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {},
                            data: {},
                            lastSync: {isConnected: false, successfulDate: '2024-01-01'},
                        },
                    } as Policy['connections'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(true);
        });

        it('should not show the categories row when showing the connect row', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeUndefined();
        });

        it('should show generic "Connect to accounting" when reportedIntegration is not set but a connection already exists (e.g. cache cleared after connecting)', async () => {
            await setupManageTeamScenario({
                policy: {
                    areConnectionsEnabled: true,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {},
                            data: {},
                            lastSync: {isConnected: true},
                        },
                    } as Policy['connections'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeDefined();
            expect(connectItem?.label).toContain('connectAccountingDefault');
        });

        it('should show "Customize accounting categories" when reportedIntegration is not set and no connections exist (e.g. cache cleared before connecting)', async () => {
            await setupManageTeamScenario({policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
        });

        it('should have isFeatureEnabled=true when accounting connections feature is enabled', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isFeatureEnabled).toBe(true);
        });

        it('should have isFeatureEnabled=false when accounting connections feature is not enabled but an existing connection makes the row visible', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: false,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {},
                            data: {},
                            lastSync: {isConnected: true},
                        },
                    } as Policy['connections'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeDefined();
            expect(connectItem?.isFeatureEnabled).toBe(false);
        });
    });

    describe('row 2b - Customize accounting categories', () => {
        const categoriesIntegrations = ['sap', 'oracle', 'microsoftDynamics', 'other', 'none'];

        it.each(categoriesIntegrations)('should show "Customize accounting categories" when accounting choice is %s', async (accounting) => {
            await setupManageTeamScenario({accounting, policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
        });

        it('should have isFeatureEnabled=true when categories feature is enabled', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.isFeatureEnabled).toBe(true);
        });

        it('should have isFeatureEnabled=false when categories feature is not enabled', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: false}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
            expect(categoriesItem?.isFeatureEnabled).toBe(false);
        });

        it('should navigate to workspace categories route', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
        });

        it('should not show the connect accounting row when showing the categories row', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeUndefined();
        });

        it('should be not completed when workspace has only default categories', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has at least one non-default category', async () => {
            const customCategories: PolicyCategories = {
                // eslint-disable-next-line @typescript-eslint/naming-convention -- PolicyCategories keys use human-readable names matching the backend API shape
                'Custom Category': {
                    name: 'Custom Category',
                    enabled: true,
                    unencodedName: 'Custom Category',
                    areCommentsRequired: false,
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the backend API field name
                    'GL Code': '',
                    externalID: '',
                    origin: '',
                    previousCategoryName: undefined,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategories);
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.isComplete).toBe(true);
        });
    });

    describe('row 3 - Link company cards', () => {
        it('should always be shown', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem).toBeDefined();
        });

        it('should have isFeatureEnabled=true when company cards feature is enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.isFeatureEnabled).toBe(true);
        });

        it('should have isFeatureEnabled=false when company cards feature is not enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.isFeatureEnabled).toBe(false);
        });

        it('should navigate to workspace company cards route', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.route).toBe(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(POLICY_ID));
        });

        it('should be not completed when no company card feed exists', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.isComplete).toBe(false);
        });
    });

    describe('row 4 - Set up spend rules', () => {
        it('should be shown when areRulesEnabled is true', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeDefined();
        });

        it('should not be shown when areRulesEnabled is false', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeUndefined();
        });

        it('should not be included in items when rules feature is not enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeUndefined();
        });

        it('should navigate to workspace rules route', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.route).toBe(ROUTES.WORKSPACE_RULES.getRoute(POLICY_ID));
        });

        it('should be not completed when workspace has default rules only', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true, rules: undefined, customRules: undefined},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has non-default rules', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areRulesEnabled: true,
                    rules: {
                        approvalRules: [
                            {
                                applyWhen: [{condition: 'matches', field: 'amount', value: '1000'}],
                                approver: 'approver@test.com',
                                id: 'rule-1',
                            },
                        ],
                    } as Policy['rules'],
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(true);
        });

        it('should be completed when workspace has custom rules text', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areRulesEnabled: true,
                    customRules: 'All expenses over $500 need manager approval',
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(true);
        });
    });

    describe('item ordering', () => {
        it('should return items in the correct order: createWorkspace, accounting/categories, companyCards, rules', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, areCompanyCardsEnabled: true, areRulesEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'connectAccounting', 'linkCompanyCards', 'setupRules']);
        });

        it('should return items in the correct order with categories instead of connect', async () => {
            await setupManageTeamScenario({
                accounting: 'none',
                policy: {areCategoriesEnabled: true, areCompanyCardsEnabled: true, areRulesEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'customizeCategories', 'linkCompanyCards', 'setupRules']);
        });

        it('should contain three rows when areRulesEnabled is false', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, areCompanyCardsEnabled: false, areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'connectAccounting', 'linkCompanyCards']);
        });
    });

    describe('edge cases', () => {
        it('should be hidden when active policy ID is missing', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should be hidden when the policy is pending deletion', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should be hidden when policy data does not exist', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'nonexistent-policy');
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should be hidden when active policy is a personal policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.PERSONAL},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should be visible when active policy is a collect (team) policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.TEAM},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should be visible when active policy is a control (corporate) policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should prefer NVP_INTRO_SELECTED over ONBOARDING_PURPOSE_SELECTED when both are set', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.PERSONAL_SPEND);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, '2026-04-01');
            await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());

            expect(result.current.shouldShowSection).toBe(true);
        });
    });
});
