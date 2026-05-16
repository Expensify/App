import {act, renderHook} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useCreateReport from '@hooks/useCreateReport';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn((key: string) => key)}));

jest.mock('@hooks/useOnyx', () => jest.fn());
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;

jest.mock('@hooks/useHasEmptyReportsForPolicy', () => jest.fn(() => false));

const mockUseHasEmptyReportsForPolicy = require('@hooks/useHasEmptyReportsForPolicy') as jest.Mock;

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () =>
    jest.fn(() => ({
        openCreateReportConfirmation: mockOpenCreateReportConfirmation,
        CreateReportConfirmationModal: null,
    })),
);

jest.mock('@libs/PolicyUtils', () => ({
    getDefaultChatEnabledPolicy: jest.fn((policies: Array<OnyxEntry<Policy>>, activePolicy: OnyxEntry<Policy>) => {
        // Mirror the real helper: prefer activePolicy if it's a paid group with chat enabled, otherwise the single non-personal candidate.
        if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && (activePolicy.type === 'team' || activePolicy.type === 'corporate')) {
            return activePolicy;
        }
        if (policies.length === 1) {
            return policies.at(0);
        }
        return undefined;
    }),
    isPaidGroupPolicy: jest.fn((policy: OnyxEntry<Policy>) => policy?.type === 'team' || policy?.type === 'corporate'),
}));

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((cb: () => void) => cb()));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const reportIDCounter = {value: 100};
jest.mock('@libs/ReportUtils', () => ({
    generateReportID: jest.fn(() => String(++reportIDCounter.value)),
}));

const mockShouldRestrictUserBillableActions = jest.fn(() => false);
jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: (...args: Parameters<typeof mockShouldRestrictUserBillableActions>) => mockShouldRestrictUserBillableActions(...args),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const POLICY_ID = 'policy-123';

function makePaidPolicy(id = POLICY_ID): OnyxEntry<Policy> {
    return {
        id,
        name: 'Test Workspace',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        isPolicyExpenseChatEnabled: true,
        owner: 'test@test.com',
        ownerAccountID: 1,
        outputCurrency: 'USD',
        employeeList: {},
    } as OnyxEntry<Policy>;
}

function setupUseOnyx(overrides: Record<string, unknown> = {}) {
    const impl = ((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const rawValue = key in overrides ? overrides[key] : undefined;
        const value = options?.selector ? options.selector(rawValue) : rawValue;
        return [value, {status: 'loaded'}];
    }) as typeof useOnyx;
    mockUseOnyx.mockImplementation(impl);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useCreateReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        reportIDCounter.value = 100;
        mockShouldRestrictUserBillableActions.mockReturnValue(false);
        mockUseHasEmptyReportsForPolicy.mockReturnValue(false);
        setupUseOnyx();
    });

    describe('upgrade path (no policies)', () => {
        it('navigates to upgrade path when user has no group policies', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0) as string;
            expect(navigateArg).toContain('upgrade');
            expect(navigateArg).toContain(CONST.UPGRADE_PATHS.REPORTS);
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('workspace selection', () => {
        it('navigates to workspace selector when default policy ID is not available', () => {
            const onCreateReport = jest.fn();
            // Pass array with undefined so getDefaultChatEnabledPolicy returns undefined
            const policies = [undefined] as Array<OnyxEntry<Policy>>;

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).not.toHaveBeenCalled();
        });

        it('navigates to workspace selector when restricted with multiple workspaces', () => {
            // Set activePolicy to a non-personal paid policy so isDefaultPersonal is false; the selector
            // should fire purely on the billing-restricted safety net branch.
            setupUseOnyx({
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'p1',
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: makePaidPolicy('p1'),
            });
            mockShouldRestrictUserBillableActions.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
        });

        it('navigates to workspace selector when default is personal and there are 2+ non-personal workspaces', () => {
            // Per spec: selector shows iff default workspace is personal AND user has 2+ non-personal options.
            const personalPolicy = {
                ...makePaidPolicy('personal-1'),
                type: CONST.POLICY.TYPE.PERSONAL,
            } as OnyxEntry<Policy>;
            setupUseOnyx({
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'personal-1',
                [`${ONYXKEYS.COLLECTION.POLICY}personal-1`]: personalPolicy,
            });
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).not.toHaveBeenCalled();
        });

        it('does NOT show selector when default is non-personal, even with multiple non-personal workspaces', () => {
            // Per spec: if default is already non-personal, just create in default — no selector.
            setupUseOnyx({
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'p1',
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: makePaidPolicy('p1'),
            });
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2'), makePaidPolicy('p3')];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).toHaveBeenCalledWith(false);
        });

        it('does NOT show selector when default is personal but only 1 non-personal workspace exists', () => {
            // Per spec: with a single non-personal candidate, just create there — no selector.
            const personalPolicy = {
                ...makePaidPolicy('personal-1'),
                type: CONST.POLICY.TYPE.PERSONAL,
            } as OnyxEntry<Policy>;
            setupUseOnyx({
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'personal-1',
                [`${ONYXKEYS.COLLECTION.POLICY}personal-1`]: personalPolicy,
            });
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1')];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).toHaveBeenCalledWith(false);
        });
    });

    describe('direct report creation', () => {
        it('calls onCreateReport directly when workspace is valid and no confirmation needed', () => {
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(onCreateReport).toHaveBeenCalledWith(false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('opens empty report confirmation when policy has empty reports', () => {
            mockUseHasEmptyReportsForPolicy.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(mockOpenCreateReportConfirmation).toHaveBeenCalledTimes(1);
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('restricted action', () => {
        it('navigates to restricted action when single workspace is billing-restricted', () => {
            mockShouldRestrictUserBillableActions.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(POLICY_ID));
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('decision flow priority', () => {
        it('upgrade path takes priority over workspace selection when no policies exist', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            act(() => {
                result.current.createReport();
            });

            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0) as string;
            expect(navigateArg).toContain('upgrade');
        });
    });

    describe('policies loaded with valid workspace', () => {
        it('does not navigate to upgrade path when user has a workspace', () => {
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            // Should call onCreateReport directly, not navigate to upgrade
            expect(onCreateReport).toHaveBeenCalledWith(false);
            const calls = jest.mocked(Navigation.navigate).mock.calls;
            const navigatedToUpgrade = calls.some((call) => {
                const firstArg = call.at(0);
                return typeof firstArg === 'string' && firstArg.includes('upgrade');
            });
            expect(navigatedToUpgrade).toBe(false);
        });
    });

    describe('empty report confirmation dismissed', () => {
        it('calls onCreateReport directly when confirmation was previously dismissed', () => {
            mockUseHasEmptyReportsForPolicy.mockReturnValue(true);
            setupUseOnyx({
                [ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED]: true,
            });

            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(onCreateReport).toHaveBeenCalledWith(false);
            expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('returns', () => {
        it('returns createReport function and isVisible flag', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            expect(typeof result.current.createReport).toBe('function');
            expect(typeof result.current.isVisible).toBe('boolean');
        });

        it('isVisible is true when policies exist', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [makePaidPolicy()],
                }),
            );

            expect(result.current.isVisible).toBe(true);
        });
    });

    describe('policy hydration gate', () => {
        it('isVisible is false while the policy collection is still loading', () => {
            const impl = ((_key: string, options?: {selector?: (value: unknown) => unknown}) => {
                const value = options?.selector ? options.selector(undefined) : undefined;
                return [value, {status: 'loading'}];
            }) as typeof useOnyx;
            mockUseOnyx.mockImplementation(impl);

            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            expect(result.current.isVisible).toBe(false);
        });

        it('does not navigate to upgrade path when the user actually has policies but Onyx is still loading', () => {
            // Simulates cold start: consumer defaulted groupPoliciesWithChatEnabled to [] because Onyx
            // hasn't hydrated yet. The hook should NOT treat this as "no policies" and navigate to upgrade.
            const impl = ((_key: string, options?: {selector?: (value: unknown) => unknown}) => {
                const value = options?.selector ? options.selector(undefined) : undefined;
                return [value, {status: 'loading'}];
            }) as typeof useOnyx;
            mockUseOnyx.mockImplementation(impl);

            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });
});
