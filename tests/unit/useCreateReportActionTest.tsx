import {act, renderHook} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useCreateReportAction from '@hooks/useCreateReportAction';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn((key: string) => key)}));

const mockShowConfirmModal = jest.fn(() => Promise.resolve({action: ModalActions.CLOSE}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));

jest.mock('@hooks/useOnyx', () => jest.fn());
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;

jest.mock('@hooks/useHasEmptyReportsForPolicy', () => jest.fn(() => false));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockUseHasEmptyReportsForPolicy = require('@hooks/useHasEmptyReportsForPolicy') as jest.Mock;

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () =>
    jest.fn(() => ({
        openCreateReportConfirmation: mockOpenCreateReportConfirmation,
        CreateReportConfirmationModal: null,
    })),
);

const mockAreAllGroupPoliciesExpenseChatDisabled = jest.fn(() => false);
jest.mock('@libs/PolicyUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    areAllGroupPoliciesExpenseChatDisabled: (...args: Parameters<typeof mockAreAllGroupPoliciesExpenseChatDisabled>) => mockAreAllGroupPoliciesExpenseChatDisabled(...args),
    getDefaultChatEnabledPolicy: jest.fn((policies: Array<OnyxEntry<Policy>>) => policies.at(0) ?? undefined),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    shouldRestrictUserBillableActions: (...args: Parameters<typeof mockShouldRestrictUserBillableActions>) => mockShouldRestrictUserBillableActions(...args),
}));

jest.mock('@libs/actions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@libs/actions/HybridApp', () => ({closeReactNativeApp: jest.fn()}));
jest.mock('@src/selectors/GPSDraftDetails', () => ({isTrackingSelector: jest.fn(() => false)}));

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
    const impl = ((key: string) => {
        if (key in overrides) {
            return [overrides[key], {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    }) as typeof useOnyx;
    mockUseOnyx.mockImplementation(impl);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useCreateReportAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        reportIDCounter.value = 100;
        mockAreAllGroupPoliciesExpenseChatDisabled.mockReturnValue(false);
        mockShouldRestrictUserBillableActions.mockReturnValue(false);
        mockUseHasEmptyReportsForPolicy.mockReturnValue(false);
        setupUseOnyx();
    });

    describe('upgrade path (no policies)', () => {
        it('navigates to upgrade path when user has no group policies', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0) as string;
            expect(navigateArg).toContain('upgrade');
            expect(navigateArg).toContain(CONST.UPGRADE_PATHS.REPORTS);
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('redirect to Expensify Classic', () => {
        it('shows classic redirect modal when all group policies have chat disabled', async () => {
            mockAreAllGroupPoliciesExpenseChatDisabled.mockReturnValue(true);
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            await act(async () => {
                result.current.createReportAction();
            });

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('workspace selection', () => {
        it('navigates to workspace selector when default policy ID is not available', () => {
            const onCreateReport = jest.fn();
            // Pass array with undefined so getDefaultChatEnabledPolicy returns undefined
            const policies = [undefined] as Array<OnyxEntry<Policy>>;

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).not.toHaveBeenCalled();
        });

        it('navigates to workspace selector when restricted with multiple workspaces', () => {
            mockShouldRestrictUserBillableActions.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
        });
    });

    describe('direct report creation', () => {
        it('calls onCreateReport directly when workspace is valid and no confirmation needed', () => {
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            expect(onCreateReport).toHaveBeenCalledWith(false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('opens empty report confirmation when policy has empty reports', () => {
            mockUseHasEmptyReportsForPolicy.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReportAction();
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
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: policies,
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(POLICY_ID));
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('decision flow priority', () => {
        it('classic redirect takes priority over upgrade path', async () => {
            mockAreAllGroupPoliciesExpenseChatDisabled.mockReturnValue(true);
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            await act(async () => {
                result.current.createReportAction();
            });

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            // Should NOT navigate to upgrade
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('upgrade path takes priority over workspace selection when no policies exist', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            act(() => {
                result.current.createReportAction();
            });

            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0) as string;
            expect(navigateArg).toContain('upgrade');
        });
    });

    describe('returns', () => {
        it('returns createReportAction function and CreateReportConfirmationModal', () => {
            const onCreateReport = jest.fn();

            const {result} = renderHook(() =>
                useCreateReportAction({
                    onCreateReport,
                    groupPoliciesWithChatEnabled: [],
                }),
            );

            expect(typeof result.current.createReportAction).toBe('function');
            expect(result.current).toHaveProperty('CreateReportConfirmationModal');
        });
    });
});
