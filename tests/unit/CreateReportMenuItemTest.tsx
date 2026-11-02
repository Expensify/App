import {render} from '@testing-library/react-native';

import useCreateReport from '@hooks/useCreateReport';
import useOnyx from '@hooks/useOnyx';

import CreateReportMenuItem from '@pages/inbox/sidebar/FABPopoverContent/menuItems/CreateReportMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';

jest.mock('@hooks/useCreateReport', () => jest.fn(() => ({createReport: jest.fn(), isVisible: false})));
const mockUseCreateReport = jest.mocked(useCreateReport);

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: jest.fn()}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, login: 'user@test.com'}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Document: 'Document'}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => jest.fn());
const mockUseOnyx: jest.Mock = jest.mocked(useOnyx);

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

const mockCreateNewReport = jest.fn<{reportID: string}, unknown[]>(() => ({reportID: 'report-1'}));
jest.mock('@libs/actions/Report', () => ({
    createNewReport: (...args: unknown[]) => mockCreateNewReport(...args),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/getCreateReportRoute', () => ({
    __esModule: true,
    default: () => 'report/1',
    getReportsRootRoute: () => 'reports',
    navigateToCreateReportWorkspaceSelection: jest.fn(),
}));

jest.mock('@navigation/helpers/isOnSearchMoneyRequestReportPage', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem', () => jest.fn(() => null));

function makePolicy(id: string, type: Policy['type']): Policy {
    return {
        id,
        name: `${id} workspace`,
        role: CONST.POLICY.ROLE.ADMIN,
        type,
        outputCurrency: CONST.CURRENCY.USD,
        owner: 'user@test.com',
        ownerAccountID: 1,
        employeeList: {},
        isJoinRequestPending: false,
    } as Policy;
}

function setupUseOnyx() {
    const values = new Map<string, unknown>([
        [ONYXKEYS.SESSION, {accountID: 1, email: 'user@test.com'}],
        [ONYXKEYS.BETAS, []],
        [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {}],
        [ONYXKEYS.NVP_INTRO_SELECTED, false],
    ]);

    mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = values.get(key);
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    });
}

describe('CreateReportMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupUseOnyx();
    });

    it('lets useCreateReport resolve the workspace instead of handing it a pre-filtered list', () => {
        // Given the FAB item renders for a user with several report-eligible workspaces
        render(<CreateReportMenuItem />);

        // When it wires up useCreateReport
        const params = mockUseCreateReport.mock.calls.at(0)?.at(0);

        // Then it passes no candidate list, so a truncated or unfiltered list can never decide the default (the old `.slice(0, 2)` bug)
        expect(Object.keys(params ?? {}).sort()).toEqual(['onCreateReport', 'onNavigateToWorkspaceSelection', 'shouldHandleNavigationBack']);
        expect(params?.shouldHandleNavigationBack).toBe(false);
    });

    it.each([
        ['the active workspace', 'team-1'],
        ['the domain preferred workspace', 'corporate-1'],
    ])('creates the report on %s that useCreateReport resolved', (_description, policyID) => {
        // Given the FAB item is rendered and useCreateReport has resolved a workspace
        render(<CreateReportMenuItem />);
        const policy = makePolicy(policyID, CONST.POLICY.TYPE.TEAM);

        // When useCreateReport asks the item to create the report
        mockUseCreateReport.mock.calls.at(0)?.at(0)?.onCreateReport(policy, false);

        // Then the report is created on exactly that workspace, not on one the item looked up itself
        expect(mockCreateNewReport).toHaveBeenCalledTimes(1);
        expect(mockCreateNewReport.mock.calls.at(0)?.at(3)).toBe(policy);
    });
});
