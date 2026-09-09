import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

const currentUserLogin = 'member@example.com';
const mockIcon: IconAsset = () => null;
const icons = {
    Building: mockIcon,
    Users: mockIcon,
    Hashtag: mockIcon,
    Document: mockIcon,
    Sync: mockIcon,
    Receipt: mockIcon,
    Briefcase: mockIcon,
    Folder: mockIcon,
    Tag: mockIcon,
    Coins: mockIcon,
    Workflows: mockIcon,
    Feed: mockIcon,
    Car: mockIcon,
    LuggageWithLines: mockIcon,
    ExpensifyCard: mockIcon,
    CreditCard: mockIcon,
    CalendarSolid: mockIcon,
    Clock: mockIcon,
    InvoiceGeneric: mockIcon,
    Gear: mockIcon,
    Bolt: mockIcon,
};

function buildPolicy(role: Policy['role']): Policy {
    return createMock<Policy>({
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Workspace'),
        role,
        employeeList: {
            [currentUserLogin]: {role},
        },
        pendingAction: undefined,
        errorFields: {},
    });
}

describe('getWorkspaceMenuItems', () => {
    it('does not build routes until a menu item is selected', () => {
        const getRouteSpy = jest.spyOn(ROUTES.WORKSPACE_OVERVIEW, 'getRoute');

        const items = getWorkspaceMenuItems({
            policy: undefined,
            policyID: undefined,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items).toHaveLength(3);
        expect(getRouteSpy).not.toHaveBeenCalled();

        items.at(0)?.getRoute();
        expect(getRouteSpy).toHaveBeenCalledTimes(1);
        getRouteSpy.mockRestore();
    });

    it('returns only the always-visible rows for a member without protected feature access', () => {
        const policy = buildPolicy(CONST.POLICY.ROLE.USER);

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.map((item) => item.translationKey)).toEqual(['workspace.common.profile', 'workspace.common.members', 'workspace.common.rooms']);
        expect(items.map((item) => item.getRoute())).toEqual([
            ROUTES.WORKSPACE_OVERVIEW.getRoute(policy.id),
            ROUTES.WORKSPACE_MEMBERS.getRoute(policy.id),
            ROUTES.WORKSPACE_ROOMS.getRoute(policy.id),
        ]);
    });

    it('returns only the always-visible rows for a personal policy', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), type: CONST.POLICY.TYPE.PERSONAL});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.map((item) => item.translationKey)).toEqual(['workspace.common.profile', 'workspace.common.members', 'workspace.common.rooms']);
    });

    it('highlights the most recently enabled feature', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            areCategoriesEnabled: true,
            pendingFields: {areCategoriesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            previousPendingFields: {},
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.categories')?.highlighted).toBe(true);
        expect(items.filter((item) => item.highlighted)).toHaveLength(1);
    });

    it('shows an error indicator when the employee list has errors', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            employeeList: {[currentUserLogin]: {role: CONST.POLICY.ROLE.ADMIN, errors: {error: 'Whoops'}}},
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.members')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when general Workspace settings have errors', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), errorFields: {name: {error: 'Whoops'}}});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.profile')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an accounting sync error only when a sync is not in progress', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            areConnectionsEnabled: true,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                    lastSync: {
                        errorDate: new Date().toISOString(),
                        errorMessage: 'Whoops',
                        isAuthenticationError: true,
                        isConnected: false,
                        isSuccessful: false,
                        source: 'NEWEXPENSIFY',
                        successfulDate: '',
                    },
                },
            },
        });
        const buildItems = (isConnectionInProgress: boolean) =>
            getWorkspaceMenuItems({
                policy,
                policyID: policy.id,
                currentUserLogin,
                icons,
                isConnectionInProgress,
                convertToDisplayString: () => '',
            });

        expect(buildItems(false).find((item) => item.translationKey === 'workspace.common.accounting')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(buildItems(true).find((item) => item.translationKey === 'workspace.common.accounting')?.brickRoadIndicator).toBeUndefined();
    });

    it('shows an error indicator when receipt partner credentials require attention', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), receiptPartners: {enabled: true}});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            shouldShowEnterCredentialsError: true,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.receiptPartners')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when company cards require attention', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), areCompanyCardsEnabled: true});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            shouldShowRBR: true,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.companyCards')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when categories have errors', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), areCategoriesEnabled: true});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            policyCategories: {Food: {name: 'Food', enabled: true, errors: {error: 'Whoops'}}},
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.categories')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when tax rates have errors', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: '',
                defaultValue: '',
                foreignTaxDefault: '',
                taxes: {TAX: {name: 'Tax', value: '10', errors: {error: 'Whoops'}}},
            },
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.taxes')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when workflows have a reimburser error', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), areWorkflowsEnabled: true, errorFields: {reimburser: {error: 'Whoops'}}});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.workflows')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an error indicator when rules have errors', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            areRulesEnabled: true,
            rules: {
                codingRules: {
                    rule: {
                        ruleID: 'rule',
                        filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Acme'},
                        errors: {error: 'Whoops'},
                    },
                },
            },
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.rules')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('shows an information indicator when Merge HR setup is incomplete', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            isHREnabled: true,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                    config: {integration: 'workday'},
                    data: {groups: [{id: 'g1', name: 'Eng', type: 'Department'}]},
                    lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
                },
            },
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.hr')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.INFO);
    });

    it('shows an error indicator when the Merge HR connection has an authentication error', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            isHREnabled: true,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                    config: {integration: 'workday'},
                    lastSync: {isAuthenticationError: true},
                },
            },
        });

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.hr')?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('uses the existing Rules icon when the Rules revamp beta is disabled', () => {
        const policy = createMock<Policy>({...buildPolicy(CONST.POLICY.ROLE.ADMIN), areRulesEnabled: true});

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items.find((item) => item.translationKey === 'workspace.common.rules')?.icon).toBe(icons.Feed);
    });

    it('preserves the complete enabled Workspace menu order and presentation data', () => {
        const policy = createMock<Policy>({
            ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
            areConnectionsEnabled: true,
            isHREnabled: true,
            receiptPartners: {enabled: true},
            areCategoriesEnabled: true,
            areTagsEnabled: true,
            tax: {trackingEnabled: true},
            areWorkflowsEnabled: true,
            areRulesEnabled: true,
            areDistanceRatesEnabled: true,
            isTravelEnabled: true,
            areExpensifyCardsEnabled: true,
            areCompanyCardsEnabled: true,
            arePerDiemRatesEnabled: true,
            units: {time: {enabled: true}},
            areInvoicesEnabled: true,
            invoice: {bankAccount: {stripeConnectAccountBalance: 123}},
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                    config: {isConfigured: true},
                    data: {contacts: {vendor1: {id: 'vendor1', name: 'Acme', email: 'vendor@example.com'}}},
                },
            },
        });
        const convertToDisplayString = jest.fn(() => '$1.23');

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            isRulesRevampBetaEnabled: true,
            isVendorMatchingBetaEnabled: true,
            convertToDisplayString,
        });

        expect(items.map((item) => item.translationKey)).toEqual([
            'workspace.common.profile',
            'workspace.common.members',
            'workspace.common.rooms',
            'common.reports',
            'workspace.common.accounting',
            'workspace.common.hr',
            'workspace.common.receiptPartners',
            'workspace.common.categories',
            'workspace.common.vendors',
            'workspace.common.tags',
            'workspace.common.taxes',
            'workspace.common.workflows',
            'workspace.common.rules',
            'workspace.common.distanceRates',
            'workspace.common.travel',
            'workspace.common.expensifyCard',
            'workspace.common.companyCards',
            'common.perDiem',
            'iou.time',
            'workspace.common.invoices',
            'workspace.common.moreFeatures',
        ]);
        expect(items.map((item) => item.getRoute())).toEqual([
            ROUTES.WORKSPACE_OVERVIEW.getRoute(policy.id),
            ROUTES.WORKSPACE_MEMBERS.getRoute(policy.id),
            ROUTES.WORKSPACE_ROOMS.getRoute(policy.id),
            ROUTES.WORKSPACE_REPORTS.getRoute(policy.id),
            ROUTES.POLICY_ACCOUNTING.getRoute(policy.id),
            ROUTES.WORKSPACE_HR.getRoute(policy.id),
            ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policy.id),
            ROUTES.WORKSPACE_CATEGORIES.getRoute(policy.id),
            ROUTES.WORKSPACE_VENDORS.getRoute(policy.id),
            ROUTES.WORKSPACE_TAGS.getRoute(policy.id),
            ROUTES.WORKSPACE_TAXES.getRoute(policy.id),
            ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id),
            ROUTES.WORKSPACE_RULES.getRoute(policy.id),
            ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policy.id),
            ROUTES.WORKSPACE_TRAVEL.getRoute(policy.id),
            ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy.id),
            ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy.id),
            ROUTES.WORKSPACE_PER_DIEM.getRoute(policy.id),
            ROUTES.WORKSPACE_TIME_TRACKING.getRoute(policy.id),
            ROUTES.WORKSPACE_INVOICES.getRoute(policy.id),
            ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policy.id),
        ]);
        expect(items.map((item) => item.screenName)).toEqual([
            SCREENS.WORKSPACE.PROFILE,
            SCREENS.WORKSPACE.MEMBERS,
            SCREENS.WORKSPACE.ROOMS,
            SCREENS.WORKSPACE.REPORTS,
            SCREENS.WORKSPACE.ACCOUNTING.ROOT,
            SCREENS.WORKSPACE.HR,
            SCREENS.WORKSPACE.RECEIPT_PARTNERS,
            SCREENS.WORKSPACE.CATEGORIES,
            SCREENS.WORKSPACE.VENDORS,
            SCREENS.WORKSPACE.TAGS,
            SCREENS.WORKSPACE.TAXES,
            SCREENS.WORKSPACE.WORKFLOWS,
            SCREENS.WORKSPACE.RULES,
            SCREENS.WORKSPACE.DISTANCE_RATES,
            SCREENS.WORKSPACE.TRAVEL,
            SCREENS.WORKSPACE.EXPENSIFY_CARD,
            SCREENS.WORKSPACE.COMPANY_CARDS,
            SCREENS.WORKSPACE.PER_DIEM,
            SCREENS.WORKSPACE.TIME_TRACKING,
            SCREENS.WORKSPACE.INVOICES,
            SCREENS.WORKSPACE.MORE_FEATURES,
        ]);
        expect(items.find((item) => item.translationKey === 'workspace.common.rules')?.icon).toBe(icons.Bolt);
        expect(items.find((item) => item.translationKey === 'workspace.common.invoices')?.badgeText).toBe('$1.23');
        expect(convertToDisplayString).toHaveBeenCalledWith(123, policy.outputCurrency);
    });
});
