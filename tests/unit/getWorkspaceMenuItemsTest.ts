import Log from '@libs/Log';

import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
        const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined);

        const items = getWorkspaceMenuItems({
            policy: undefined,
            policyID: undefined,
            icons,
            convertToDisplayString: () => '',
        });

        expect(items).toHaveLength(3);
        expect(warnSpy).not.toHaveBeenCalled();

        items.at(0)?.getRoute();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
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
        });
        const convertToDisplayString = jest.fn(() => '$1.23');

        const items = getWorkspaceMenuItems({
            policy,
            policyID: policy.id,
            currentUserLogin,
            icons,
            isRulesRevampBetaEnabled: true,
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
        expect(items.find((item) => item.translationKey === 'workspace.common.rules')?.icon).toBe(icons.Bolt);
        expect(items.find((item) => item.translationKey === 'workspace.common.invoices')?.badgeText).toBe('$1.23');
        expect(convertToDisplayString).toHaveBeenCalledWith(123, policy.outputCurrency);
    });
});
