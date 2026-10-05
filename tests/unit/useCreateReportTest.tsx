import {act, renderHook} from '@testing-library/react-native';

import useCreateReport from '@hooks/useCreateReport';
import useOnyx from '@hooks/useOnyx';
import useShouldShowEmptyReportConfirmation from '@hooks/useShouldShowEmptyReportConfirmation';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import createMock from '../utils/createMock';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@hooks/useLocalize', () => () => ({
    translate: jest.fn((key: string) => key),
}));

jest.mock('@hooks/useOnyx', () => jest.fn());
const mockUseOnyx = jest.mocked(useOnyx);

// The hook reads policies through the snapshot-free useOnyx from react-native-onyx; serve them from the same mock.
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('react-native-onyx'),
    useOnyx: (...args: Parameters<typeof mockUseOnyx>) => mockUseOnyx(...args),
}));

jest.mock('@hooks/useShouldShowEmptyReportConfirmation', () => jest.fn(() => false));

const mockUseShouldShowEmptyReportConfirmation = jest.mocked(useShouldShowEmptyReportConfirmation);

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () =>
    jest.fn(() => ({
        openCreateReportConfirmation: mockOpenCreateReportConfirmation,
        CreateReportConfirmationModal: null,
    })),
);

jest.mock('@libs/PolicyUtils', () => {
    // `requireActual` inside the factory because jest hoists `jest.mock` above the top-level `CONST` import.
    const CONSTANTS = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;
    return {
        isPaidGroupPolicy: jest.fn((policy: OnyxEntry<Policy>) => policy?.type === CONSTANTS.POLICY.TYPE.TEAM || policy?.type === CONSTANTS.POLICY.TYPE.CORPORATE),
        isGroupPolicy: jest.fn(
            (policy: OnyxEntry<Policy>) => policy?.type === CONSTANTS.POLICY.TYPE.TEAM || policy?.type === CONSTANTS.POLICY.TYPE.CORPORATE || policy?.type === CONSTANTS.POLICY.TYPE.SUBMIT,
        ),
        canCreateReportOnPolicy: jest.fn(
            (policy: OnyxEntry<Policy>) => policy?.type === CONSTANTS.POLICY.TYPE.TEAM || policy?.type === CONSTANTS.POLICY.TYPE.CORPORATE || policy?.type === CONSTANTS.POLICY.TYPE.SUBMIT,
        ),
    };
});

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((cb: () => void) => cb()));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

const reportIDCounter = {value: 100};
jest.mock('@libs/ReportUtils', () => ({
    generateReportID: jest.fn(() => String(++reportIDCounter.value)),
}));

const mockShouldRestrictUserBillableActions = jest.fn(() => false);
jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: (...args: Parameters<typeof mockShouldRestrictUserBillableActions>) => mockShouldRestrictUserBillableActions(...args),
}));

const mockUsePreferredPolicy = jest.fn(() => ({
    isRestrictedToPreferredPolicy: false,
    preferredPolicyID: undefined as string | undefined,
    isRestrictedPolicyCreation: false,
    isLoadingPreferredPolicy: false,
}));
jest.mock('@hooks/usePreferredPolicy', () => () => mockUsePreferredPolicy());

// ── Helpers ────────────────────────────────────────────────────────────────────

const POLICY_ID = 'policy-123';

function makePaidPolicy(id = POLICY_ID): Policy {
    return createMock<Policy>({
        id,
        name: 'Test Workspace',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'test@test.com',
        ownerAccountID: 1,
        outputCurrency: 'USD',
        employeeList: {},
    });
}

function makeSubmitPolicy(id = POLICY_ID): Policy {
    const policy = makePaidPolicy(id);
    return {...policy, type: CONST.POLICY.TYPE.SUBMIT};
}

/** Report-eligible workspaces the mocked policy collection selector resolves over; reset per test */
const eligiblePolicies = {value: [] as Array<OnyxEntry<Policy>>};

function setEligiblePolicies(policies: Array<OnyxEntry<Policy>>) {
    eligiblePolicies.value = policies;
}

function isCreateReportPolicyType(policy: OnyxEntry<Policy>) {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE || policy?.type === CONST.POLICY.TYPE.SUBMIT;
}

/** Mirrors getDefaultChatEnabledPolicySelection: prefer a group active policy, otherwise the only eligible workspace */
function getMockSelection(activePolicy: OnyxEntry<Policy>) {
    const policies = eligiblePolicies.value;
    let defaultPolicy: OnyxEntry<Policy>;
    if (isCreateReportPolicyType(activePolicy)) {
        defaultPolicy = activePolicy;
    } else if (policies.length === 1) {
        defaultPolicy = policies.at(0);
    }
    return {
        defaultChatEnabledPolicyID: defaultPolicy?.id,
        hasChatEnabledPolicies: policies.length > 0,
        hasMultipleChatEnabledPolicies: policies.length > 1,
    };
}

type SetupUseCreateReportOnyxParams = {
    activePolicy?: OnyxEntry<Policy>;
    /** Served under its own `policy_<id>` key, the way the hook reads the domain's preferred workspace */
    preferredPolicy?: OnyxEntry<Policy>;
    /** Load status reported for the preferred workspace key */
    preferredPolicyLoadStatus?: 'loaded' | 'loading';
    emptyReportsConfirmationDismissed?: boolean;
};

function setupUseCreateReportOnyx({activePolicy, preferredPolicy, preferredPolicyLoadStatus = 'loaded', emptyReportsConfirmationDismissed}: SetupUseCreateReportOnyxParams = {}) {
    mockUseOnyx.mockImplementation((key) => {
        if (key === ONYXKEYS.NVP_ACTIVE_POLICY_ID) {
            return [activePolicy?.id, {status: 'loaded'}];
        }
        if (activePolicy && key === `${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`) {
            return [activePolicy, {status: 'loaded'}];
        }
        if (preferredPolicy && key === `${ONYXKEYS.COLLECTION.POLICY}${preferredPolicy.id}`) {
            return [preferredPolicy, {status: preferredPolicyLoadStatus}];
        }
        if (key === ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED) {
            return [emptyReportsConfirmationDismissed, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.COLLECTION.POLICY) {
            return [getMockSelection(activePolicy), {status: 'loaded'}];
        }
        const eligiblePolicy = eligiblePolicies.value.find((policy) => !!policy && key === `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
        if (eligiblePolicy) {
            return [eligiblePolicy, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
}

function setPreferredPolicyRestriction(preferredPolicyID: string | undefined, isLoadingPreferredPolicy = false) {
    mockUsePreferredPolicy.mockReturnValue({
        isRestrictedToPreferredPolicy: true,
        preferredPolicyID,
        isRestrictedPolicyCreation: false,
        isLoadingPreferredPolicy,
    });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useCreateReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        reportIDCounter.value = 100;
        setEligiblePolicies([]);
        mockShouldRestrictUserBillableActions.mockReturnValue(false);
        mockUsePreferredPolicy.mockReturnValue({
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
            isRestrictedPolicyCreation: false,
            isLoadingPreferredPolicy: false,
        });
        mockUseShouldShowEmptyReportConfirmation.mockReturnValue(false);
        setupUseCreateReportOnyx();
    });

    describe('domain preferred workspace restriction', () => {
        const personalPolicy: OnyxEntry<Policy> = {
            ...makePaidPolicy('personal-1'),
            type: CONST.POLICY.TYPE.PERSONAL,
        };
        const preferredPolicy = makePaidPolicy('preferred-1');
        // What the backend sends for a preferred workspace the user is not a member of: no type, no role.
        const preferredPolicyStub = createMock<Policy>({
            id: 'preferred-1',
            name: 'Preferred',
        });

        it.each([
            ['creates on the preferred workspace instead of the active one', makePaidPolicy('p1'), preferredPolicy, false, 'create'],
            ['creates on the preferred workspace when the active one is personal and multiple workspaces exist', personalPolicy, preferredPolicy, false, 'create'],
            ['shows the billing restriction page instead of the selector when the preferred workspace is billing-restricted', makePaidPolicy('p1'), preferredPolicy, true, 'restricted'],
            ['falls back to the normal rules when the preferred workspace is only a membership-less stub', personalPolicy, preferredPolicyStub, false, 'selector'],
            ['falls back to the normal rules when the preferred workspace is not in Onyx at all', personalPolicy, undefined, false, 'selector'],
        ])('%s', (_description, activePolicy, restrictedPolicy, isBillingRestricted, expected) => {
            // Given a domain lock on `preferred-1` and the active workspace / preferred workspace data in Onyx
            setupUseCreateReportOnyx({
                activePolicy,
                preferredPolicy: restrictedPolicy,
            });
            setPreferredPolicyRestriction('preferred-1');
            mockShouldRestrictUserBillableActions.mockReturnValue(isBillingRestricted);
            const onCreateReport = jest.fn();
            // The caller's eligible list never contains the preferred workspace, so the hook must resolve it by key on its own
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            // When the user presses "Create report"
            act(() => {
                result.current.createReport();
            });

            // Then an eligible preferred workspace wins without a selector, and anything else falls back to the normal rules
            const selectorRoute = DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute();
            if (expected === 'create') {
                expect(onCreateReport).toHaveBeenCalledWith(expect.objectContaining({id: 'preferred-1'}), false);
                expect(Navigation.navigate).not.toHaveBeenCalled();
            } else if (expected === 'restricted') {
                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute('preferred-1'));
                expect(Navigation.navigate).not.toHaveBeenCalledWith(selectorRoute);
                expect(onCreateReport).not.toHaveBeenCalled();
            } else {
                expect(Navigation.navigate).toHaveBeenCalledWith(selectorRoute);
                expect(onCreateReport).not.toHaveBeenCalled();
            }
        });

        it.each([
            ['the security group is still loading', true, 'loaded'],
            ['the preferred workspace is still loading', false, 'loading'],
        ] as const)('hides the entry point and does nothing on press while %s', (_description, isLoadingPreferredPolicy, preferredPolicyLoadStatus) => {
            // Given the domain lock cannot be evaluated yet because its Onyx inputs have not resolved
            setupUseCreateReportOnyx({
                activePolicy: makePaidPolicy('p1'),
                preferredPolicy,
                preferredPolicyLoadStatus,
            });
            setPreferredPolicyRestriction('preferred-1', isLoadingPreferredPolicy);
            const onCreateReport = jest.fn();

            setEligiblePolicies([makePaidPolicy('p1'), makePaidPolicy('p2')]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            // When the user presses "Create report" anyway
            act(() => {
                result.current.createReport();
            });

            // Then nothing is created or navigated, instead of silently falling back to the active workspace
            expect(result.current.isVisible).toBe(false);
            expect(onCreateReport).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describe('upgrade path (no policies)', () => {
        it('navigates to upgrade path when user has no group policies', () => {
            const onCreateReport = jest.fn();

            setEligiblePolicies([]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
            expect(navigateArg).toEqual(expect.stringContaining('upgrade'));
            expect(navigateArg).toEqual(expect.stringContaining(CONST.UPGRADE_PATHS.REPORTS));
            expect(onCreateReport).not.toHaveBeenCalled();
        });
    });

    describe('workspace selection', () => {
        it('navigates to workspace selector when default policy ID is not available', () => {
            const onCreateReport = jest.fn();
            // One unresolvable eligible entry: the selection has workspaces but no default workspace ID
            const policies = [undefined];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).not.toHaveBeenCalled();
        });

        it('navigates to workspace selector when restricted with multiple workspaces', () => {
            // Set activePolicy to a non-personal paid policy so isDefaultPersonal is false; the selector
            // should fire purely on the billing-restricted safety net branch.
            setupUseCreateReportOnyx({activePolicy: makePaidPolicy('p1')});
            mockShouldRestrictUserBillableActions.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
        });

        it('navigates to workspace selector when default is personal and there are 2+ non-personal workspaces', () => {
            // Per spec: selector shows iff default workspace is personal AND user has 2+ non-personal options.
            const personalPolicy: OnyxEntry<Policy> = {
                ...makePaidPolicy('personal-1'),
                type: CONST.POLICY.TYPE.PERSONAL,
            };
            setupUseCreateReportOnyx({activePolicy: personalPolicy});
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).not.toHaveBeenCalled();
        });

        it('does NOT show selector when default is non-personal, even with multiple non-personal workspaces', () => {
            // Per spec: if default is already non-personal, just create in default — no selector.
            setupUseCreateReportOnyx({activePolicy: makePaidPolicy('p1')});
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1'), makePaidPolicy('p2'), makePaidPolicy('p3')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
        });

        it('does NOT show selector when default is a Submit workspace, even with 2+ Submit workspaces', () => {
            // Regression: a Submit workspace is a valid non-personal default, so creating a report
            // should go straight to it instead of opening the workspace selector.
            setupUseCreateReportOnyx({activePolicy: makeSubmitPolicy('p1')});
            const onCreateReport = jest.fn();
            const policies = [makeSubmitPolicy('p1'), makeSubmitPolicy('p2')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
        });

        it('does NOT show selector when default is personal but only 1 non-personal workspace exists', () => {
            // Per spec: with a single non-personal candidate, just create there — no selector.
            const personalPolicy: OnyxEntry<Policy> = {
                ...makePaidPolicy('personal-1'),
                type: CONST.POLICY.TYPE.PERSONAL,
            };
            setupUseCreateReportOnyx({activePolicy: personalPolicy});
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy('p1')];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(Navigation.navigate).not.toHaveBeenCalledWith(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
        });
    });

    describe('direct report creation', () => {
        it('calls onCreateReport directly when workspace is valid and no confirmation needed', () => {
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('opens empty report confirmation when policy has empty reports', () => {
            mockUseShouldShowEmptyReportConfirmation.mockReturnValue(true);
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
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

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
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

            setEligiblePolicies([]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            const navigateArg = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
            expect(navigateArg).toEqual(expect.stringContaining('upgrade'));
        });
    });

    describe('policies loaded with valid workspace', () => {
        it('does not navigate to upgrade path when user has a workspace', () => {
            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            // Should call onCreateReport directly, not navigate to upgrade
            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
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
            mockUseShouldShowEmptyReportConfirmation.mockReturnValue(false);
            setupUseCreateReportOnyx({emptyReportsConfirmationDismissed: true});

            const onCreateReport = jest.fn();
            const policies = [makePaidPolicy()];

            setEligiblePolicies(policies);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            act(() => {
                result.current.createReport();
            });

            expect(onCreateReport).toHaveBeenCalledWith(expect.anything(), false);
            expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('returns', () => {
        it('returns createReport function and isVisible flag', () => {
            const onCreateReport = jest.fn();

            setEligiblePolicies([]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            expect(typeof result.current.createReport).toBe('function');
            expect(typeof result.current.isVisible).toBe('boolean');
        });

        it('isVisible is true when policies exist', () => {
            const onCreateReport = jest.fn();

            setEligiblePolicies([makePaidPolicy()]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            expect(result.current.isVisible).toBe(true);
        });
    });

    describe('policy hydration gate', () => {
        it('isVisible is false while the policy collection is still loading', () => {
            mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

            const onCreateReport = jest.fn();

            setEligiblePolicies([]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
                }),
            );

            expect(result.current.isVisible).toBe(false);
        });

        it('does not navigate to upgrade path when the user actually has policies but Onyx is still loading', () => {
            // Simulates cold start: the policy selection reports no workspaces because Onyx
            // hasn't hydrated yet. The hook should NOT treat this as "no policies" and navigate to upgrade.
            mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

            const onCreateReport = jest.fn();

            setEligiblePolicies([]);
            const {result} = renderHook(() =>
                useCreateReport({
                    onCreateReport,
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
