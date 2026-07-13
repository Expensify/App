/* eslint-disable @typescript-eslint/naming-convention -- test fixtures use backend-shaped object keys that don't follow camelCase: email addresses for PolicyEmployeeList entries and human-readable names / 'GL Code' for PolicyCategories */
import {renderHook, waitFor} from '@testing-library/react-native';

import useGettingStartedItems from '@pages/home/GettingStartedSection/hooks/useGettingStartedItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import Onyx from 'react-native-onyx';

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

const useResponsiveLayoutMock = jest.requireMock<jest.Mock>('@hooks/useResponsiveLayout');

jest.mock('@userActions/Policy/Category', () => ({enablePolicyCategories: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({enableCompanyCards: jest.fn(), enableExpensifyCard: jest.fn(), enablePolicyConnections: jest.fn(), enablePolicyRules: jest.fn()}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({startMoneyRequest: jest.fn()}));

const {startMoneyRequest} = jest.requireMock<{startMoneyRequest: jest.Mock}>('@libs/actions/IOU/MoneyRequest');

const POLICY_ID = '1';

// Trial dates relative to today so the 60-day Getting Started window check
// (isWithinGettingStartedPeriod) doesn't drift out of bounds as wall time
// passes. The previously-hardcoded values passed at landing time but started
// failing 60+ days later when the trial cutoff swept past them.
const RECENT_TRIAL_START = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
const FUTURE_TRIAL_END = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';

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

async function setupTrackWorkspaceScenario(overrides: {policy?: Partial<Policy>; firstDayTrial?: string; lastDayTrial?: string; intentSource?: 'introSelected' | 'onboardingPurpose'} = {}) {
    // New workspaces enable Categories by default, so keep the categories step visible unless a test opts out.
    const policy = buildPolicy({areCategoriesEnabled: true, ...overrides.policy});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

    if (overrides.intentSource === 'onboardingPurpose') {
        await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);
    } else {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE});
    }

    await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);

    const now = new Date();
    const firstDay = overrides.firstDayTrial ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    const lastDay = overrides.lastDayTrial ?? new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDay);
    await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDay);

    await waitForBatchedUpdates();
}

async function setupTrackPersonalScenario(overrides: {policy?: Partial<Policy>; firstDayTrial?: string; lastDayTrial?: string; intentSource?: 'introSelected' | 'onboardingPurpose'} = {}) {
    const policy = buildPolicy(overrides.policy);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

    if (overrides.intentSource === 'onboardingPurpose') {
        await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.TRACK_PERSONAL);
    } else {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
    }

    await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);

    const now = new Date();
    const firstDay = overrides.firstDayTrial ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    const lastDay = overrides.lastDayTrial ?? new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
    await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDay);
    await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDay);

    await waitForBatchedUpdates();
}

async function setupManageTeamScenario(overrides: {policy?: Partial<Policy>; accounting?: string | null; firstDayTrial?: string; lastDayTrial?: string} = {}) {
    // New workspaces enable Categories by default, so keep the categories step visible unless a test opts out.
    const policy = buildPolicy({areCategoriesEnabled: true, ...overrides.policy});
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
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should return no items when ONBOARDING_PURPOSE_SELECTED is set to a non-manage-team value and NVP_INTRO_SELECTED is not loaded', async () => {
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.EMPLOYER);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should use NVP_INTRO_SELECTED.choice as primary source for intent detection', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should fall back to ONBOARDING_PURPOSE_SELECTED when NVP_INTRO_SELECTED is not available', async () => {
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy({areCategoriesEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            // The hook reads ONBOARDING_PURPOSE_SELECTED via a separate useOnyx
            // subscription whose callback can land a tick after the others; poll
            // with waitFor instead of relying on a single batched-updates flush.
            await waitFor(() => expect(result.current.shouldShowSection).toBe(true));
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
            await waitForBatchedUpdates();

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
            await waitForBatchedUpdates();

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
            await waitForBatchedUpdates();

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
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(false);
        });
    });

    describe('row 1 - Create a workspace', () => {
        it('should always be present for manage-team intent', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
            expect(createWorkspaceItem).toBeDefined();
        });

        it('should always be checked (completed)', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
            expect(createWorkspaceItem?.isComplete).toBe(true);
        });

        it('should be the first item', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.items.at(0)?.key).toBe('createWorkspace');
        });

        it('should navigate to the workspace overview route', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

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
            await waitForBatchedUpdates();

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeDefined();
            expect(connectItem?.label).toContain(name);
        });

        it('should navigate to workspace accounting route', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.route).toBe(ROUTES.WORKSPACE_ACCOUNTING.getRoute(POLICY_ID));
        });

        it('should be not completed when workspace has no accounting connection', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, connections: undefined},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has a successful accounting connection', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: true,

                    // Keep an incomplete card row so the section stays visible; it hides once every item is complete.
                    areCompanyCardsEnabled: true,
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
            await waitForBatchedUpdates();

            await waitFor(() => {
                const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
                expect(connectItem?.isComplete).toBe(true);
            });
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
            await waitForBatchedUpdates();

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem?.isComplete).toBe(false);
        });

        it('should stay completed when a previously successful connection later breaks', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: true,

                    // Keep an incomplete card row so the section stays visible; it hides once every item is complete.
                    areCompanyCardsEnabled: true,
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
            await waitForBatchedUpdates();

            await waitFor(() => {
                const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
                expect(connectItem?.isComplete).toBe(true);
            });
        });

        it('should not show the categories row when showing the connect row', async () => {
            await setupManageTeamScenario({accounting: CONST.POLICY.CONNECTIONS.NAME.QBO, policy: {areConnectionsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeUndefined();
        });

        it('should show generic "Connect to accounting" when reportedIntegration is not set but a connection already exists (e.g. cache cleared after connecting)', async () => {
            await setupManageTeamScenario({
                policy: {
                    areConnectionsEnabled: true,

                    // Keep an incomplete card row so the section stays visible; it hides once every item is complete.
                    areCompanyCardsEnabled: true,
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
            await waitForBatchedUpdates();

            await waitFor(() => {
                const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
                expect(connectItem).toBeDefined();
                expect(connectItem?.label).toContain('connectAccountingDefault');
            });
        });

        it('should show "Customize accounting categories" when reportedIntegration is not set and no connections exist (e.g. cache cleared before connecting)', async () => {
            await setupManageTeamScenario({policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
        });

        it('should still show the connect accounting row when connections feature is disabled but an existing connection makes the row visible', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areConnectionsEnabled: false,

                    // Keep an incomplete card row so the section stays visible; it hides once every item is complete.
                    areCompanyCardsEnabled: true,
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
            await waitForBatchedUpdates();

            await waitFor(() => {
                const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
                expect(connectItem).toBeDefined();
            });
        });
    });

    describe('row 2b - Customize accounting categories', () => {
        const categoriesIntegrations = ['sap', 'oracle', 'microsoftDynamics', 'other', 'none'];

        it.each(categoriesIntegrations)('should show "Customize accounting categories" when accounting choice is %s', async (accounting) => {
            await setupManageTeamScenario({accounting, policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
        });

        it('should show "Customize accounting categories" (not "Connect to accounting") for "other" even when the connections feature is enabled', async () => {
            // Selecting "Other" during onboarding enables the connections feature (areConnectionsEnabled: true) without a real
            // connection, so the row must still route to categories rather than back to the unsupported integration list.
            await setupManageTeamScenario({accounting: 'other', policy: {areConnectionsEnabled: true, areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(categoriesItem).toBeDefined();
            expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
            expect(connectItem).toBeUndefined();
        });

        it('should show the categories row when categories feature is enabled', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeDefined();
        });

        it('should not show the categories row when categories feature is not enabled', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: false}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem).toBeUndefined();
        });

        it('should navigate to workspace categories route', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
        });

        it('should not show the connect accounting row when showing the categories row', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
            expect(connectItem).toBeUndefined();
        });

        it('should be not completed when workspace has only default categories', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
            expect(categoriesItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has at least one non-default category', async () => {
            const customCategories: PolicyCategories = {
                'Custom Category': {
                    name: 'Custom Category',
                    enabled: true,
                    unencodedName: 'Custom Category',
                    areCommentsRequired: false,
                    'GL Code': '',
                    externalID: '',
                    origin: '',
                    previousCategoryName: undefined,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategories);

            // Keep an incomplete card row so the section stays visible; it hides once every item is complete.
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true, areCompanyCardsEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            await waitFor(() => {
                const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
                expect(categoriesItem?.isComplete).toBe(true);
            });
        });
    });

    describe('row 3 - Link company cards', () => {
        it('should be shown when the company cards feature is enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem).toBeDefined();
        });

        it('should not be shown when company cards feature is not enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem).toBeUndefined();
        });

        it('should navigate to workspace company cards route', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.route).toBe(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(POLICY_ID));
        });

        it('should be not completed when no company card feed exists', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(companyCardsItem?.isComplete).toBe(false);
        });
    });

    describe('row 3 (Expensify Card variant) - Issue Expensify cards', () => {
        const WORKSPACE_ACCOUNT_ID = 12345;

        it('should show "Issue Expensify cards" and not "Link company cards" when Expensify Card is enabled and Company cards is not', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            expect(expensifyCardItem).toBeDefined();
            expect(companyCardsItem).toBeUndefined();
        });

        it('should carry the subText and navigate to the workspace Expensify Card route', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(expensifyCardItem?.route).toBe(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID));
            expect(expensifyCardItem?.subText).toBeTruthy();
        });

        it('should be not completed when the workspace has no Expensify card provisioned', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(expensifyCardItem?.isComplete).toBe(false);
        });

        it('should be completed once the workspace card list contains an issued Expensify Card', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${WORKSPACE_ACCOUNT_ID}_${CONST.EXPENSIFY_CARD.BANK}`, {
                '1234': {cardID: 1234, bank: CONST.EXPENSIFY_CARD.BANK, state: CONST.EXPENSIFY_CARD.STATE.OPEN},
            });
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(expensifyCardItem?.isComplete).toBe(true);
        });

        it('should not be completed by an Expensify Card issued in another workspace whose account ID contains this workspace ID', async () => {
            // `12345` is a substring of `123456`; the exact-key subscription must not let the other workspace's issued card
            // (keyed on `cards_123456_Expensify Card`) mark this workspace's onboarding step complete.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${WORKSPACE_ACCOUNT_ID}6_${CONST.EXPENSIFY_CARD.BANK}`, {
                '9999': {cardID: 9999, bank: CONST.EXPENSIFY_CARD.BANK, state: CONST.EXPENSIFY_CARD.STATE.OPEN},
            });
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(expensifyCardItem?.isComplete).toBe(false);
        });

        it('should show both card rows when both Company cards and Expensify Card are enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: true, areExpensifyCardsEnabled: true, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(companyCardsItem).toBeDefined();
            expect(expensifyCardItem).toBeDefined();
        });

        it('should show no card rows when neither Company cards nor Expensify Card is enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areCompanyCardsEnabled: false, areExpensifyCardsEnabled: false, policyAccountID: WORKSPACE_ACCOUNT_ID},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
            const expensifyCardItem = result.current.items.find((item) => item.key === 'issueExpensifyCards');
            expect(companyCardsItem).toBeUndefined();
            expect(expensifyCardItem).toBeUndefined();
        });
    });

    describe('row 4 - Set up spend rules', () => {
        it('should be shown when areRulesEnabled is true', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeDefined();
        });

        it('should not be shown when areRulesEnabled is false', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeUndefined();
        });

        it('should not be included in items when rules feature is not enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem).toBeUndefined();
        });

        it('should navigate to workspace rules route', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.route).toBe(ROUTES.WORKSPACE_RULES.getRoute(POLICY_ID));
        });

        it('should be not completed when workspace has default rules only', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areRulesEnabled: true, rules: undefined, customRules: undefined, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(false);
        });

        it('should be completed when workspace has non-default rules', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areRulesEnabled: true,
                    type: CONST.POLICY.TYPE.CORPORATE,
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
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(true);
        });

        it('should be completed when workspace has custom rules text', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {
                    areRulesEnabled: true,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    customRules: 'All expenses over $500 need manager approval',
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const rulesItem = result.current.items.find((item) => item.key === 'setupRules');
            expect(rulesItem?.isComplete).toBe(true);
        });
    });

    describe('item ordering', () => {
        it('should return items in the correct order: createWorkspace, accounting/categories, companyCards, rules', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, areCompanyCardsEnabled: true, areRulesEnabled: true, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'connectAccounting', 'linkCompanyCards', 'setupRules']);
        });

        it('should return items in the correct order with categories instead of connect', async () => {
            await setupManageTeamScenario({
                accounting: 'none',
                policy: {areCategoriesEnabled: true, areCompanyCardsEnabled: true, areRulesEnabled: true, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'customizeCategories', 'linkCompanyCards', 'setupRules']);
        });

        it('should contain only the non-card rows when no card feature and rules are enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {areConnectionsEnabled: true, areCompanyCardsEnabled: false, areExpensifyCardsEnabled: false, areRulesEnabled: false},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'connectAccounting']);
        });

        it('should order both card rows as company cards then Expensify cards when both are enabled', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,

                // Rules (setupRules) only render for a control policy, so the type must be CORPORATE here.
                policy: {areConnectionsEnabled: true, areCompanyCardsEnabled: true, areExpensifyCardsEnabled: true, areRulesEnabled: true, type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            const keys = result.current.items.map((item) => item.key);
            expect(keys).toEqual(['createWorkspace', 'connectAccounting', 'linkCompanyCards', 'issueExpensifyCards', 'setupRules']);
        });
    });

    describe('edge cases', () => {
        it('should fall back to a single create-workspace step when active policy ID is missing', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
            expect(result.current.items.at(0)?.isComplete).toBe(false);
        });

        it('should fall back to a single create-workspace step when the policy is pending deletion', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
            expect(result.current.items.at(0)?.isComplete).toBe(false);
        });

        it('should fall back to a single create-workspace step when policy data does not exist', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'nonexistent-policy');
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
            expect(result.current.items.at(0)?.isComplete).toBe(false);
        });

        it('should fall back to a single create-workspace step when active policy is a personal policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.PERSONAL},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
            expect(result.current.items.at(0)?.isComplete).toBe(false);
        });

        it('should be visible when active policy is a collect (team) policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.TEAM},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should be visible when active policy is a control (corporate) policy', async () => {
            await setupManageTeamScenario({
                accounting: CONST.POLICY.CONNECTIONS.NAME.QBO,
                policy: {type: CONST.POLICY.TYPE.CORPORATE},
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });

        it('should prefer NVP_INTRO_SELECTED over ONBOARDING_PURPOSE_SELECTED when both are set', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.PERSONAL_SPEND);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            const policy = buildPolicy({areCategoriesEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, RECENT_TRIAL_START);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, FUTURE_TRIAL_END);
            await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useGettingStartedItems());
            // Same reasoning as the ONBOARDING_PURPOSE_SELECTED fallback test above:
            // poll until the hook's dependent useOnyx chain settles instead of
            // relying on a single flush.
            await waitFor(() => expect(result.current.shouldShowSection).toBe(true));
        });
    });

    describe('TRACK_WORKSPACE intent', () => {
        describe('visibility rules', () => {
            it('should fall back to a single create-workspace step until NVP_ACTIVE_POLICY_ID is present', async () => {
                await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE});
                const policy = buildPolicy();
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '');
                await waitForBatchedUpdates();

                const {result: missingActivePolicy} = renderHook(() => useGettingStartedItems());
                expect(missingActivePolicy.current.shouldShowSection).toBe(true);
                expect(missingActivePolicy.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
                expect(missingActivePolicy.current.items.at(0)?.isComplete).toBe(false);

                await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
                await waitForBatchedUpdates();

                const {result: withActivePolicy} = renderHook(() => useGettingStartedItems());
                expect(withActivePolicy.current.shouldShowSection).toBe(true);
                expect(withActivePolicy.current.items.length).toBeGreaterThan(1);
            });

            it('should show the section only within 60 days of NVP_FIRST_DAY_FREE_TRIAL', async () => {
                const sixtyOneDaysAgo = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
                await setupTrackWorkspaceScenario({firstDayTrial: sixtyOneDaysAgo, lastDayTrial: thirtyDaysAgo});

                const {result: expired} = renderHook(() => useGettingStartedItems());
                expect(expired.current.shouldShowSection).toBe(false);
                expect(expired.current.items).toEqual([]);

                const fiftyNineDaysAgo = new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
                await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, fiftyNineDaysAgo);
                await waitForBatchedUpdates();

                const {result: withinWindow} = renderHook(() => useGettingStartedItems());
                expect(withinWindow.current.shouldShowSection).toBe(true);
            });

            it('should show the section only when the user is a policy admin', async () => {
                await setupTrackWorkspaceScenario({policy: {role: CONST.POLICY.ROLE.USER}});

                const {result: nonAdmin} = renderHook(() => useGettingStartedItems());
                expect(nonAdmin.current.shouldShowSection).toBe(false);
                expect(nonAdmin.current.items).toEqual([]);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {role: CONST.POLICY.ROLE.ADMIN});
                await waitForBatchedUpdates();

                const {result: admin} = renderHook(() => useGettingStartedItems());
                expect(admin.current.shouldShowSection).toBe(true);
            });

            it('should fall back to a single create-workspace step until the active policy is a paid group policy', async () => {
                await setupTrackWorkspaceScenario({policy: {type: CONST.POLICY.TYPE.PERSONAL}});

                const {result: personal} = renderHook(() => useGettingStartedItems());
                expect(personal.current.shouldShowSection).toBe(true);
                expect(personal.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
                expect(personal.current.items.at(0)?.isComplete).toBe(false);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {type: CONST.POLICY.TYPE.TEAM});
                await waitForBatchedUpdates();

                const {result: team} = renderHook(() => useGettingStartedItems());
                expect(team.current.shouldShowSection).toBe(true);
                expect(team.current.items.length).toBeGreaterThan(1);
            });

            it('should return items when intent is TRACK_WORKSPACE, within 60 days, policy admin on a paid group policy', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(true);
                expect(result.current.items.length).toBeGreaterThan(0);
            });

            it('should return items when introSelected.choice is undefined but ONBOARDING_PURPOSE_SELECTED === TRACK_WORKSPACE', async () => {
                await setupTrackWorkspaceScenario({intentSource: 'onboardingPurpose'});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(true);
                expect(result.current.items.length).toBeGreaterThan(0);
            });
        });

        describe('items and check states', () => {
            it('should return exactly three items in order: createWorkspace, customizeCategories, inviteAccountant', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'customizeCategories', 'inviteAccountant']);
            });

            it('should keep createWorkspace isComplete=true even when no workspace-related state exists', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
                expect(createWorkspaceItem?.isComplete).toBe(true);
            });

            it('should resolve createWorkspace route to WORKSPACE_OVERVIEW on wide layout', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
                expect(createWorkspaceItem?.route).toBe(ROUTES.WORKSPACE_OVERVIEW.getRoute(POLICY_ID));
            });

            it('should resolve createWorkspace route to WORKSPACE_INITIAL on narrow layout', async () => {
                useResponsiveLayoutMock.mockReturnValueOnce({shouldUseNarrowLayout: true});
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const createWorkspaceItem = result.current.items.find((item) => item.key === 'createWorkspace');
                expect(createWorkspaceItem?.route).toContain(ROUTES.WORKSPACE_INITIAL.getRoute(POLICY_ID).split('?').at(0) ?? '');
            });

            it('should resolve customizeCategories route to WORKSPACE_CATEGORIES', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
                expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
            });

            it('should have customizeCategories isComplete=false when the workspace only has default categories', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
                expect(categoriesItem?.isComplete).toBe(false);
            });

            it('should have customizeCategories isComplete=true when the workspace has at least one non-default category', async () => {
                const customCategories: PolicyCategories = {
                    'Custom Category': {
                        name: 'Custom Category',
                        enabled: true,
                        unencodedName: 'Custom Category',
                        areCommentsRequired: false,
                        'GL Code': '',
                        externalID: '',
                        origin: '',
                        previousCategoryName: undefined,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategories);
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
                expect(categoriesItem?.isComplete).toBe(true);
            });

            it('should still render customizeCategories (not connectAccounting) when the policy has an accounting integration connected', async () => {
                await setupTrackWorkspaceScenario({
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
                await Onyx.merge(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, CONST.POLICY.CONNECTIONS.NAME.QBO as never);
                await waitForBatchedUpdates();

                const {result} = renderHook(() => useGettingStartedItems());

                const connectItem = result.current.items.find((item) => item.key === 'connectAccounting');
                expect(connectItem).toBeUndefined();
                const categoriesItem = result.current.items.find((item) => item.key === 'customizeCategories');
                expect(categoriesItem).toBeDefined();
                expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
            });

            it('should resolve inviteAccountant route to WORKSPACE_MEMBERS', async () => {
                await setupTrackWorkspaceScenario();

                const {result} = renderHook(() => useGettingStartedItems());

                const inviteAccountantItem = result.current.items.find((item) => item.key === 'inviteAccountant');
                expect(inviteAccountantItem?.route).toBe(ROUTES.WORKSPACE_MEMBERS.getRoute(POLICY_ID));
            });

            it('should have inviteAccountant isComplete=false when policy has only 1 member in employeeList', async () => {
                const employeeList: PolicyEmployeeList = {
                    'owner@test.com': {email: 'owner@test.com', role: CONST.POLICY.ROLE.ADMIN},
                };
                await setupTrackWorkspaceScenario({policy: {employeeList}});

                const {result} = renderHook(() => useGettingStartedItems());

                const inviteAccountantItem = result.current.items.find((item) => item.key === 'inviteAccountant');
                expect(inviteAccountantItem?.isComplete).toBe(false);
            });

            it('should have inviteAccountant isComplete=true when policy has at least 2 members in employeeList', async () => {
                const employeeList: PolicyEmployeeList = {
                    'owner@test.com': {email: 'owner@test.com', role: CONST.POLICY.ROLE.ADMIN},
                    'accountant@test.com': {email: 'accountant@test.com', role: CONST.POLICY.ROLE.USER},
                };
                await setupTrackWorkspaceScenario({policy: {employeeList}});

                const {result} = renderHook(() => useGettingStartedItems());

                const inviteAccountantItem = result.current.items.find((item) => item.key === 'inviteAccountant');
                expect(inviteAccountantItem?.isComplete).toBe(true);
            });

            it('should ignore employeeList entries with pendingAction===DELETE when counting members', async () => {
                const employeeList: PolicyEmployeeList = {
                    'owner@test.com': {email: 'owner@test.com', role: CONST.POLICY.ROLE.ADMIN},
                    'removed@test.com': {
                        email: 'removed@test.com',
                        role: CONST.POLICY.ROLE.USER,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                };
                await setupTrackWorkspaceScenario({policy: {employeeList}});

                const {result} = renderHook(() => useGettingStartedItems());

                const inviteAccountantItem = result.current.items.find((item) => item.key === 'inviteAccountant');
                expect(inviteAccountantItem?.isComplete).toBe(false);
            });

            it('should have inviteAccountant isComplete=true when second member has a failed invite (pendingAction=null + errors), matching WorkspaceMembersPage count', async () => {
                const employeeList: PolicyEmployeeList = {
                    'owner@test.com': {email: 'owner@test.com', role: CONST.POLICY.ROLE.ADMIN},
                    'failed@test.com': {
                        email: 'failed@test.com',
                        role: CONST.POLICY.ROLE.USER,
                        pendingAction: null,
                        errors: {genericAdd: 'workspace.people.error.genericAdd'},
                    },
                };
                await setupTrackWorkspaceScenario({policy: {employeeList}});

                const {result} = renderHook(() => useGettingStartedItems());

                const inviteAccountantItem = result.current.items.find((item) => item.key === 'inviteAccountant');
                expect(inviteAccountantItem?.isComplete).toBe(true);
            });
        });

        describe('link company card step', () => {
            it('should insert linkCompanyCards between customizeCategories and inviteAccountant when company cards are enabled', async () => {
                await setupTrackWorkspaceScenario({policy: {areCompanyCardsEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'customizeCategories', 'linkCompanyCards', 'inviteAccountant']);
            });

            it('should navigate to the workspace company cards route', async () => {
                await setupTrackWorkspaceScenario({policy: {areCompanyCardsEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
                expect(companyCardsItem?.route).toBe(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(POLICY_ID));
            });

            it('should have isComplete=false when the workspace has no connected company card feed', async () => {
                await setupTrackWorkspaceScenario({policy: {areCompanyCardsEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const companyCardsItem = result.current.items.find((item) => item.key === 'linkCompanyCards');
                expect(companyCardsItem?.isComplete).toBe(false);
            });

            it('should have isComplete=true when the workspace has a connected company card feed', async () => {
                const policyAccountID = 7777777;
                const commercialFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${policyAccountID}`, {
                    settings: {
                        companyCards: {
                            [commercialFeed]: {preferredPolicy: POLICY_ID, liabilityType: 'corporate'},
                        },
                    },
                });
                await setupTrackWorkspaceScenario({policy: {policyAccountID, areCompanyCardsEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());
                await waitFor(() => expect(result.current.items.find((item) => item.key === 'linkCompanyCards')?.isComplete).toBe(true));
            });
        });

        describe('feature toggles hide and show steps', () => {
            it('should hide the customizeCategories step when Categories is disabled', async () => {
                await setupTrackWorkspaceScenario({policy: {areCategoriesEnabled: false, areCompanyCardsEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'linkCompanyCards', 'inviteAccountant']);
            });

            it('should hide the linkCompanyCards step when Company cards is disabled', async () => {
                await setupTrackWorkspaceScenario({policy: {areCategoriesEnabled: true, areCompanyCardsEnabled: false}});

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'customizeCategories', 'inviteAccountant']);
            });

            it('should preserve relative order and only collapse the hidden step when both features toggle', async () => {
                await setupTrackWorkspaceScenario({policy: {areCategoriesEnabled: false, areCompanyCardsEnabled: false}});

                const {result: bothDisabled} = renderHook(() => useGettingStartedItems());
                expect(bothDisabled.current.items.map((item) => item.key)).toEqual(['createWorkspace', 'inviteAccountant']);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true, areCompanyCardsEnabled: true});
                await waitForBatchedUpdates();

                const {result: bothEnabled} = renderHook(() => useGettingStartedItems());
                expect(bothEnabled.current.items.map((item) => item.key)).toEqual(['createWorkspace', 'customizeCategories', 'linkCompanyCards', 'inviteAccountant']);
            });
        });
    });

    describe('TRACK_PERSONAL intent', () => {
        const customCategories: PolicyCategories = {
            'Custom Category': {
                name: 'Custom Category',
                enabled: true,
                unencodedName: 'Custom Category',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                previousCategoryName: undefined,
            },
        };

        describe('visibility rules', () => {
            it('should return items when intent is TRACK_PERSONAL, within 60 days, policy admin on a paid group policy', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(true);
                expect(result.current.items.length).toBeGreaterThan(0);
            });

            it('should fall back to ONBOARDING_PURPOSE_SELECTED when NVP_INTRO_SELECTED is not available', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}, intentSource: 'onboardingPurpose'});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(true);
                expect(result.current.items.length).toBeGreaterThan(0);
            });

            it('should be hidden when the user is not a policy admin', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true, role: CONST.POLICY.ROLE.USER}});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(false);
                expect(result.current.items).toEqual([]);
            });

            it('should fall back to a single create-workspace step on a personal (non paid group) policy', async () => {
                await setupTrackPersonalScenario({policy: {type: CONST.POLICY.TYPE.PERSONAL}});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(true);
                expect(result.current.items.map((item) => item.key)).toEqual(['createWorkspace']);
                expect(result.current.items.at(0)?.isComplete).toBe(false);
            });

            it('should be hidden after the 60-day Getting Started window', async () => {
                const sixtyOneDaysAgo = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T').at(0) ?? '';
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}, firstDayTrial: sixtyOneDaysAgo, lastDayTrial: thirtyDaysAgo});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.shouldShowSection).toBe(false);
                expect(result.current.items).toEqual([]);
            });
        });

        describe('items and check states', () => {
            it('should return the four items in order when Categories is enabled', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'customizeSpendCategories', 'createExpense', 'linkPersonalCard']);
            });

            it('should omit customizeSpendCategories when the Categories feature is disabled', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: false}});

                const {result} = renderHook(() => useGettingStartedItems());

                const keys = result.current.items.map((item) => item.key);
                expect(keys).toEqual(['createWorkspace', 'createExpense', 'linkPersonalCard']);
            });

            it('should resolve customizeSpendCategories to the categories route and mark it enabled', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const categoriesItem = result.current.items.find((item) => item.key === 'customizeSpendCategories');
                expect(categoriesItem?.route).toBe(ROUTES.WORKSPACE_CATEGORIES.getRoute(POLICY_ID));
                expect(categoriesItem?.isFeatureEnabled).toBe(true);
            });

            it('should mark customizeSpendCategories incomplete with only default categories and complete with a custom one', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result: defaultResult} = renderHook(() => useGettingStartedItems());
                expect(defaultResult.current.items.find((item) => item.key === 'customizeSpendCategories')?.isComplete).toBe(false);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategories);
                await waitForBatchedUpdates();

                const {result: customResult} = renderHook(() => useGettingStartedItems());
                expect(customResult.current.items.find((item) => item.key === 'customizeSpendCategories')?.isComplete).toBe(true);
            });

            it('should give createExpense an onPress (not a route) that starts a create money request', async () => {
                startMoneyRequest.mockClear();
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                const createExpenseItem = result.current.items.find((item) => item.key === 'createExpense');
                expect(createExpenseItem?.route).toBeUndefined();
                createExpenseItem?.onPress?.();
                expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, expect.any(String), expect.any(Array));
            });

            it('should mark createExpense incomplete with no transactions and complete once a non-deleted transaction exists', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result: emptyResult} = renderHook(() => useGettingStartedItems());
                expect(emptyResult.current.items.find((item) => item.key === 'createExpense')?.isComplete).toBe(false);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', reportID: 'r1'});
                await waitForBatchedUpdates();

                const {result: withExpense} = renderHook(() => useGettingStartedItems());
                expect(withExpense.current.items.find((item) => item.key === 'createExpense')?.isComplete).toBe(true);
            });

            it('should not count a trashed transaction toward createExpense completion', async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', reportID: CONST.REPORT.TRASH_REPORT_ID});
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result} = renderHook(() => useGettingStartedItems());

                expect(result.current.items.find((item) => item.key === 'createExpense')?.isComplete).toBe(false);
            });

            it('should resolve linkPersonalCard to the wallet route and reflect linked-card state', async () => {
                await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

                const {result: noCards} = renderHook(() => useGettingStartedItems());
                const linkCardItem = noCards.current.items.find((item) => item.key === 'linkPersonalCard');
                expect(linkCardItem?.route).toBe(ROUTES.SETTINGS_WALLET);
                expect(linkCardItem?.isComplete).toBe(false);

                await Onyx.merge(ONYXKEYS.CARD_LIST, {testCard: {cardID: 1}});
                await waitForBatchedUpdates();

                const {result: withCard} = renderHook(() => useGettingStartedItems());
                expect(withCard.current.items.find((item) => item.key === 'linkPersonalCard')?.isComplete).toBe(true);
            });
        });

        it('should hide the section once every to-do is complete', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategories);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', reportID: 'r1'});
            await Onyx.merge(ONYXKEYS.CARD_LIST, {testCard: {cardID: 1}});
            await setupTrackPersonalScenario({policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());

            await waitFor(() => expect(result.current.shouldShowSection).toBe(false));
            expect(result.current.items).toEqual([]);
        });
    });

    describe('hides the section once all to-dos are complete', () => {
        const customCategory: PolicyCategories = {
            'Custom Category': {
                name: 'Custom Category',
                enabled: true,
                unencodedName: 'Custom Category',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                previousCategoryName: undefined,
            },
        };

        it('should stay visible for MANAGE_TEAM intent while at least one to-do is incomplete', async () => {
            await setupManageTeamScenario({accounting: 'none', policy: {areCategoriesEnabled: true}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.some((item) => !item.isComplete)).toBe(true);
        });

        it('should hide the section for MANAGE_TEAM intent when every to-do is complete (within the 60-day window)', async () => {
            const policyAccountID = 7777777;
            // A commercial (custom) feed always counts as a linked company card feed, so the linkCompanyCards to-do is complete.
            const commercialFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

            // createWorkspace is always complete; complete categories (custom category) and company cards (a feed) so nothing is left.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategory);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${policyAccountID}`, {
                settings: {
                    companyCards: {
                        [commercialFeed]: {preferredPolicy: POLICY_ID, liabilityType: 'corporate'},
                    },
                },
            });
            await setupManageTeamScenario({
                accounting: 'none',
                policy: {
                    policyAccountID,
                    areCategoriesEnabled: true,
                    areCompanyCardsEnabled: true,
                    areRulesEnabled: false,
                },
            });

            const {result} = renderHook(() => useGettingStartedItems());
            await waitFor(() => expect(result.current.shouldShowSection).toBe(false));
            expect(result.current.items).toEqual([]);
        });

        it('should hide the section for TRACK_WORKSPACE intent when every to-do is complete', async () => {
            const employeeList: PolicyEmployeeList = {
                'owner@test.com': {email: 'owner@test.com', role: CONST.POLICY.ROLE.ADMIN},
                'accountant@test.com': {email: 'accountant@test.com', role: CONST.POLICY.ROLE.USER},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, customCategory);
            await setupTrackWorkspaceScenario({policy: {areCategoriesEnabled: true, employeeList}});

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(false);
            expect(result.current.items).toEqual([]);
        });

        it('should stay visible for TRACK_WORKSPACE intent while at least one to-do is incomplete', async () => {
            await setupTrackWorkspaceScenario();

            const {result} = renderHook(() => useGettingStartedItems());
            await waitForBatchedUpdates();

            expect(result.current.shouldShowSection).toBe(true);
            expect(result.current.items.some((item) => !item.isComplete)).toBe(true);
        });
    });
});
