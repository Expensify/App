import {act, renderHook} from '@testing-library/react-native';

import useCreateNavigationSuggestions from '@components/Search/SearchRouter/useCreateNavigationSuggestions';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import {navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import {clearLastSearchParams} from '@userActions/ReportNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type MockUseCreateReportParams = {
    onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => void;
    groupPoliciesWithChatEnabled: unknown[] | readonly never[];
    onNavigateToWorkspaceSelection: () => void;
    shouldHandleNavigationBack: boolean;
    shouldSkipEmptyReportConfirmation?: boolean;
};

type MockOnyxOptions = {
    selector?: (value: unknown) => unknown;
};

const mockCreateReport = jest.fn();
let mockCreateReportIsVisible = true;
const mockUseCreateReport = jest.fn<{createReport: typeof mockCreateReport; isVisible: boolean}, [MockUseCreateReportParams]>(() => ({
    createReport: mockCreateReport,
    isVisible: mockCreateReportIsVisible,
}));
const mockUseOnyx = jest.fn<unknown[], [key: string, options?: MockOnyxOptions]>();
const mockIsBetaEnabled = jest.fn(() => true);
const mockCanSendInvoice = jest.fn<boolean, unknown[]>(() => false);
const mockGetDefaultChatEnabledPolicy = jest.fn((policies: unknown[]) => (policies.length === 1 ? policies.at(0) : undefined));
const mockGetGroupPoliciesWhereReportCanBeCreated = jest.fn<unknown[], [policies: unknown, currentUserLogin?: string]>();
const mockShouldShowPolicy = jest.fn<boolean, unknown[]>(() => true);
const mockHasAcceptedTravelTerms = jest.fn(() => false);
const mockIsPaidGroupPolicy = jest.fn(() => false);
const mockIsPermissionsBetaEnabled = jest.fn(() => false);
const mockIsOnSearchMoneyRequestReportPage = jest.fn(() => false);
const mockGetCurrencyDecimals = jest.fn();
let mockIsRestrictedPolicyCreation = false;
let mockOnyxValues = new Map<string, unknown>();
const mockIcon = () => null;

jest.mock('@hooks/useCreateReport', () => ({
    __esModule: true,
    default: (params: MockUseCreateReportParams) => mockUseCreateReport(params),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, login: 'test@example.com'}),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: mockGetCurrencyDecimals}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        Document: mockIcon,
        Location: mockIcon,
        ChatBubble: mockIcon,
        InvoiceGeneric: mockIcon,
        Suitcase: mockIcon,
        NewWorkspace: mockIcon,
    }),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => {
            const translations = new Map([
                ['homePage.gettingStartedSection.createExpense', 'Create an expense'],
                ['homePage.gettingStartedSection.createWorkspace', 'Create a workspace'],
                ['common.chat', 'Chat'],
                ['common.new', 'New'],
                ['iou.addExpense', 'Add expense'],
                ['iou.createExpense', 'Create expense'],
                ['iou.trackDistance', 'Track distance'],
                ['onboarding.workspace.createWorkspace', 'Create workspace'],
                ['report.newReport.createReport', 'Create report'],
                ['sidebarScreen.fabNewChat', 'Start chat'],
                ['travel.bookTravel', 'Book travel'],
                ['workspace.invoices.sendInvoice', 'Send invoice'],
                ['workspace.new.newWorkspace', 'New workspace'],
            ]);
            return translations.get(key) ?? key;
        },
    }),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: MockOnyxOptions) => mockUseOnyx(key, options),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: mockIsBetaEnabled}),
}));

jest.mock('@hooks/usePreferredPolicy', () => ({
    __esModule: true,
    default: () => ({isRestrictedPolicyCreation: mockIsRestrictedPolicyCreation}),
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    startDistanceRequest: jest.fn(),
    startMoneyRequest: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'created-report'})),
    startNewChat: jest.fn(),
}));

jest.mock('@libs/getIconForAction', () => ({
    __esModule: true,
    default: () => mockIcon,
}));

jest.mock('@libs/interceptAnonymousUser', () => ({
    __esModule: true,
    default: (action: () => void) => action(),
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: () => 'workspace-confirmation',
}));

jest.mock('@libs/Navigation/helpers/getCreateReportRoute', () => ({
    __esModule: true,
    default: ({reportID}: {reportID: string}) => `report/${reportID}`,
    getReportsRootRoute: () => 'reports',
    navigateToCreateReportWorkspaceSelection: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn((action: () => void) => action()),
    },
}));

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
}));

jest.mock('@libs/Permissions', () => ({
    __esModule: true,
    default: {
        isBetaEnabled: () => mockIsPermissionsBetaEnabled(),
    },
}));

jest.mock('@libs/PolicyUtils', () => ({
    canSendInvoice: (...args: unknown[]) => mockCanSendInvoice(...args),
    getDefaultChatEnabledPolicy: (policies: unknown[]) => mockGetDefaultChatEnabledPolicy(policies),
    getGroupPoliciesWhereReportCanBeCreated: (policies: unknown, currentUserLogin?: string) => mockGetGroupPoliciesWhereReportCanBeCreated(policies, currentUserLogin),
    hasAcceptedTravelTerms: () => mockHasAcceptedTravelTerms(),
    isPaidGroupPolicy: () => mockIsPaidGroupPolicy(),
    shouldShowPolicy: (...args: unknown[]) => mockShouldShowPolicy(...args),
}));

jest.mock('@libs/ReportUtils', () => ({
    generateReportID: jest.fn(() => 'draft-report'),
}));

jest.mock('@navigation/helpers/isOnSearchMoneyRequestReportPage', () => ({
    __esModule: true,
    default: () => mockIsOnSearchMoneyRequestReportPage(),
}));

jest.mock('@userActions/ReportNavigation', () => ({
    clearLastSearchParams: jest.fn(),
}));

const submitPolicy = {id: 'submit-policy', type: CONST.POLICY.TYPE.SUBMIT};
const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`]: submitPolicy};
const session = {accountID: 1, email: 'test@example.com'};

function setupUseOnyx() {
    mockOnyxValues = new Map<string, unknown>([
        [ONYXKEYS.COLLECTION.POLICY, policies],
        [ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {}],
        [ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP],
        [ONYXKEYS.ACCOUNT, {primaryLogin: session.email}],
        [ONYXKEYS.SESSION, session],
        [ONYXKEYS.BETAS, []],
        [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {}],
        [ONYXKEYS.NVP_ACTIVE_POLICY_ID, submitPolicy.id],
        [`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`, submitPolicy],
        [ONYXKEYS.NVP_TRAVEL_SETTINGS, undefined],
        [ONYXKEYS.NVP_INTRO_SELECTED, false],
        [ONYXKEYS.IS_LOADING_APP, false],
    ]);

    mockUseOnyx.mockImplementation((key, options) => {
        const value = mockOnyxValues.get(key);
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    });
}

describe('useCreateNavigationSuggestions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupUseOnyx();
        mockCanSendInvoice.mockReturnValue(false);
        mockShouldShowPolicy.mockReturnValue(true);
        mockHasAcceptedTravelTerms.mockReturnValue(false);
        mockIsPaidGroupPolicy.mockReturnValue(false);
        mockIsPermissionsBetaEnabled.mockReturnValue(false);
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([]);
        mockIsOnSearchMoneyRequestReportPage.mockReturnValue(false);
        mockIsRestrictedPolicyCreation = false;
        mockCreateReportIsVisible = true;
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(false);
    });

    it('uses shared report policy eligibility and renders only available Create actions', () => {
        mockCreateReportIsVisible = false;
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(mockGetGroupPoliciesWhereReportCanBeCreated).toHaveBeenCalledWith(policies, session.email);
        expect(mockUseCreateReport).toHaveBeenCalledWith(
            expect.objectContaining({
                groupPoliciesWithChatEnabled: [],
                shouldHandleNavigationBack: false,
            }),
        );
        expect(result.current.map((item) => item.keyForList)).toEqual(['create_expense', 'create_trackDistance', 'create_chat']);
    });

    it('uses localized aliases for Create action matching', () => {
        mockCanSendInvoice.mockReturnValue(true);
        mockShouldShowPolicy.mockReturnValue(false);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(result.current.find((item) => item.keyForList === 'create_expense')?.matchTerms).toEqual(['Create expense', 'Add expense', 'Create an expense']);
        expect(result.current.find((item) => item.keyForList === 'create_chat')).toMatchObject({
            text: 'Start chat',
            matchTerms: ['Start chat', 'New Chat'],
        });
        expect(result.current.find((item) => item.keyForList === 'create_workspace')?.matchTerms).toEqual(['New workspace', 'Create workspace', 'Create a workspace']);
    });

    it('skips empty-report confirmation scans until the query can match Create rows', () => {
        renderHook(() => useCreateNavigationSuggestions('reports'));
        expect(mockUseCreateReport).toHaveBeenLastCalledWith(expect.objectContaining({shouldSkipEmptyReportConfirmation: true}));

        for (const query of ['new chat', 'add expense', 'go to']) {
            renderHook(() => useCreateNavigationSuggestions(query));
            expect(mockUseCreateReport).toHaveBeenLastCalledWith(expect.objectContaining({shouldSkipEmptyReportConfirmation: false}));
        }
    });

    it('dismisses an existing RHP before running the Create report action', () => {
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_report')?.action?.());

        expect(mockCreateReport).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);

        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        act(() => afterTransition?.());
        expect(mockCreateReport).toHaveBeenCalledTimes(1);
    });

    it('does not create a report without a default policy', () => {
        renderHook(() => useCreateNavigationSuggestions());

        const onCreateReport = mockUseCreateReport.mock.calls.at(0)?.at(0)?.onCreateReport;
        act(() => onCreateReport?.());

        expect(createNewReport).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([
        ['policy creation is restricted', true, false],
        ['the app is loading', false, true],
    ])('hides New workspace when %s', (_condition, isRestrictedPolicyCreation, isLoading) => {
        mockIsRestrictedPolicyCreation = isRestrictedPolicyCreation;
        mockOnyxValues.set(ONYXKEYS.IS_LOADING_APP, isLoading);
        mockShouldShowPolicy.mockReturnValue(false);

        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(result.current.some((item) => item.keyForList === 'create_workspace')).toBe(false);
    });

    it('controls invoice and workspace visibility independently', () => {
        mockCanSendInvoice.mockReturnValue(true);
        mockShouldShowPolicy.mockReturnValue(true);

        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(result.current.some((item) => item.keyForList === 'create_invoice')).toBe(true);
        expect(result.current.some((item) => item.keyForList === 'create_workspace')).toBe(false);
    });

    it('uses only the active workspace to control Book travel visibility', () => {
        const otherTravelPolicy = {id: 'other-travel-policy', type: CONST.POLICY.TYPE.TEAM, isTravelEnabled: true};
        mockOnyxValues.set(ONYXKEYS.COLLECTION.POLICY, {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}${otherTravelPolicy.id}`]: otherTravelPolicy,
        });

        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(result.current.some((item) => item.keyForList === 'create_travel')).toBe(false);
    });

    it('shows Book travel when Travel is enabled on the active workspace', () => {
        mockOnyxValues.set(`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`, {...submitPolicy, isTravelEnabled: true});

        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(result.current.find((item) => item.keyForList === 'create_travel')).toMatchObject({text: 'Book travel', singleIcon: mockIcon, matchTerms: ['Book travel']});
    });

    it('opens TravelDot when the active workspace is ready for travel', () => {
        mockOnyxValues.set(`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`, {...submitPolicy, isTravelEnabled: true});
        mockIsPaidGroupPolicy.mockReturnValue(true);
        mockHasAcceptedTravelTerms.mockReturnValue(true);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_travel')?.action?.());

        expect(openTravelDotLink).toHaveBeenCalledWith(submitPolicy.id);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.TRAVEL_MY_TRIPS.getRoute(submitPolicy.id));
    });

    it('uses the session email when the primary login is unavailable', () => {
        mockOnyxValues.set(`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`, {...submitPolicy, isTravelEnabled: true});
        mockOnyxValues.set(ONYXKEYS.ACCOUNT, {primaryLogin: undefined});
        mockIsPaidGroupPolicy.mockReturnValue(true);
        mockHasAcceptedTravelTerms.mockReturnValue(true);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_travel')?.action?.());

        expect(openTravelDotLink).toHaveBeenCalledWith(submitPolicy.id);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.TRAVEL_MY_TRIPS.getRoute(submitPolicy.id));
    });

    it.each([
        ['Travel is blocked', true, session.email, session.email, true, true],
        ['the primary login is an SMS login', false, '+15555550123', session.email, true, true],
        ['the active workspace is not paid', false, session.email, session.email, false, true],
        ['Travel terms are not accepted', false, session.email, session.email, true, false],
        ['there is no primary contact method', false, '', '', true, true],
    ])('opens the Travel page when %s', (_condition, isBlocked, primaryLogin, sessionEmail, isPaid, hasAcceptedTerms) => {
        mockOnyxValues.set(`${ONYXKEYS.COLLECTION.POLICY}${submitPolicy.id}`, {...submitPolicy, isTravelEnabled: true});
        mockOnyxValues.set(ONYXKEYS.ACCOUNT, {primaryLogin});
        mockOnyxValues.set(ONYXKEYS.SESSION, {...session, email: sessionEmail});
        mockIsPermissionsBetaEnabled.mockReturnValue(isBlocked);
        mockIsPaidGroupPolicy.mockReturnValue(isPaid);
        mockHasAcceptedTravelTerms.mockReturnValue(hasAcceptedTerms);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_travel')?.action?.());

        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TRAVEL_MY_TRIPS.getRoute(submitPolicy.id));
    });

    it('passes Submit eligibility and exposes permission-gated actions', () => {
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([submitPolicy]);
        mockCanSendInvoice.mockReturnValue(true);
        mockShouldShowPolicy.mockReturnValue(false);

        const {result} = renderHook(() => useCreateNavigationSuggestions());

        expect(mockGetGroupPoliciesWhereReportCanBeCreated).toHaveBeenCalledWith(policies, session.email);
        expect(mockUseCreateReport).toHaveBeenCalledWith(expect.objectContaining({groupPoliciesWithChatEnabled: [submitPolicy]}));
        expect(result.current.map((item) => item.keyForList)).toEqual(['create_expense', 'create_report', 'create_trackDistance', 'create_chat', 'create_invoice', 'create_workspace']);

        act(() => result.current.find((item) => item.keyForList === 'create_invoice')?.action?.());
        act(() => result.current.find((item) => item.keyForList === 'create_workspace')?.action?.());

        expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.INVOICE, 'draft-report', expect.anything(), undefined, undefined, undefined, true);
        expect(Navigation.navigate).toHaveBeenCalledWith('workspace-confirmation');
    });

    it('reuses the generated report ID and saved distance type for Create actions', () => {
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_expense')?.action?.());
        act(() => result.current.find((item) => item.keyForList === 'create_trackDistance')?.action?.());
        act(() => result.current.find((item) => item.keyForList === 'create_chat')?.action?.());

        expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, 'draft-report', expect.anything(), undefined, undefined, undefined, true);
        expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, 'draft-report', expect.anything(), CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, undefined, undefined, true);
        expect(startNewChat).toHaveBeenCalledTimes(1);
    });

    it('starts a distance request without a type when no saved type exists', () => {
        mockOnyxValues.set(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, undefined);
        const {result} = renderHook(() => useCreateNavigationSuggestions());

        act(() => result.current.find((item) => item.keyForList === 'create_trackDistance')?.action?.());

        expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, 'draft-report', expect.anything(), undefined, undefined, undefined, true);
    });

    it('creates a report and navigates through the Reports root', () => {
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([submitPolicy]);
        renderHook(() => useCreateNavigationSuggestions());

        const onCreateReport = mockUseCreateReport.mock.calls.at(0)?.at(0)?.onCreateReport;
        act(() => onCreateReport?.(true));

        expect(createNewReport).toHaveBeenCalledWith(expect.anything(), false, true, submitPolicy, [], false, mockGetCurrencyDecimals, false, true);
        expect(clearLastSearchParams).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, 'reports', {forceReplace: false});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, 'report/created-report', {forceReplace: false});
    });

    it('reads the underlying search report route when Create report actions run', () => {
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([submitPolicy]);
        renderHook(() => useCreateNavigationSuggestions());

        expect(mockIsOnSearchMoneyRequestReportPage).not.toHaveBeenCalled();
        mockIsOnSearchMoneyRequestReportPage.mockReturnValue(true);

        const createReportParams = mockUseCreateReport.mock.calls.at(0)?.at(0);
        act(() => createReportParams?.onCreateReport());
        act(() => createReportParams?.onNavigateToWorkspaceSelection());

        expect(clearLastSearchParams).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, 'reports', {forceReplace: true});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, 'report/created-report', {forceReplace: true});
        expect(navigateToCreateReportWorkspaceSelection).toHaveBeenCalledWith({forceReplace: true});
    });
});
