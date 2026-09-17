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
    default: () => ({isBetaEnabled: jest.fn(() => false)}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'report-1'})),
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

jest.mock('@libs/PolicyUtils', () => {
    const CONSTANTS = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;

    return {
        getDefaultChatEnabledPolicy: jest.fn((policies: Policy[]) => policies.at(0)),
        getGroupPoliciesWhereReportCanBeCreated: jest.fn((policies: Record<string, Policy> | undefined) =>
            Object.values(policies ?? {}).filter(
                (policy): policy is Policy =>
                    !!policy &&
                    !policy.isJoinRequestPending &&
                    (policy.type === CONSTANTS.POLICY.TYPE.TEAM || policy.type === CONSTANTS.POLICY.TYPE.CORPORATE || policy.type === CONSTANTS.POLICY.TYPE.SUBMIT),
            ),
        ),
    };
});

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
    const personalPolicy = makePolicy('personal-1', CONST.POLICY.TYPE.PERSONAL);
    const groupPolicy = makePolicy('team-1', CONST.POLICY.TYPE.TEAM);
    const submitPolicy = makePolicy('submit-1', CONST.POLICY.TYPE.SUBMIT);
    const values = new Map<string, unknown>([
        [ONYXKEYS.NVP_ACTIVE_POLICY_ID, personalPolicy.id],
        [`${ONYXKEYS.COLLECTION.POLICY}${personalPolicy.id}`, personalPolicy],
        [
            ONYXKEYS.COLLECTION.POLICY,
            {
                [`${ONYXKEYS.COLLECTION.POLICY}${personalPolicy.id}`]: personalPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${groupPolicy.id}`]: groupPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`]: submitPolicy,
            },
        ],
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

    it('passes only report-creation workspaces to useCreateReport', () => {
        render(<CreateReportMenuItem />);

        const params = mockUseCreateReport.mock.calls.at(0)?.at(0);
        expect(params?.groupPoliciesWithChatEnabled).toHaveLength(2);
        expect(params?.groupPoliciesWithChatEnabled).toEqual([
            expect.objectContaining({id: 'team-1', type: CONST.POLICY.TYPE.TEAM}),
            expect.objectContaining({id: 'submit-1', type: CONST.POLICY.TYPE.SUBMIT}),
        ]);
    });
});
