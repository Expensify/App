import {act, renderHook} from '@testing-library/react-native';

import useContinueJoinWorkspaceOnboarding from '@hooks/useContinueJoinWorkspaceOnboarding';

import type {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import Log from '@libs/Log';
import type * as NavigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';

import {completeOnboarding} from '@userActions/Report';
import type * as ReportActions from '@userActions/Report';
import type * as WelcomeActions from '@userActions/Welcome';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type HookParams = Parameters<typeof useContinueJoinWorkspaceOnboarding>[0];

const WORK_EMAIL = 'test@company.com';
const MERGED_WORK_EMAIL = 'merged@company.com';
const POLICY_ID = 'joined-policy';
const mockJoinWorkspaceMessages = createMock<ReturnType<typeof getOnboardingMessages>['joinWorkspaceMessages']>({
    addWorkEmail: {message: 'Add work email', tasks: [{type: CONST.ONBOARDING_TASK_TYPE.ADD_WORK_EMAIL}]},
    validateEmail: {message: 'Validate email', tasks: [{type: CONST.ONBOARDING_TASK_TYPE.VALIDATE_EMAIL}]},
    joinWorkspace: {message: 'Join workspace', tasks: [{type: CONST.ONBOARDING_TASK_TYPE.JOIN_WORKSPACE}]},
    empty: {message: 'No workspaces', tasks: []},
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 123}),
}));
jest.mock('@hooks/useOnboardingMessages', () => ({
    __esModule: true,
    default: () => ({joinWorkspaceMessages: mockJoinWorkspaceMessages}),
}));
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
}));
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({isSmallScreenWidth: false}),
}));
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportActions>('@userActions/Report'),
    completeOnboarding: jest.fn(),
}));
jest.mock('@userActions/Welcome', () => ({
    ...jest.requireActual<typeof WelcomeActions>('@userActions/Welcome'),
    setOnboardingAdminsChatReportID: jest.fn(),
    setOnboardingPolicyID: jest.fn(),
}));
jest.mock('@libs/navigateAfterOnboarding', () => ({
    ...jest.requireActual<typeof NavigateAfterOnboarding>('@libs/navigateAfterOnboarding'),
    navigateAfterOnboardingWithMicrotaskQueue: jest.fn(),
}));

const mockCompleteOnboarding = jest.mocked(completeOnboarding);
const mockNavigateAfterOnboarding = jest.mocked(navigateAfterOnboardingWithMicrotaskQueue);
const navigate = jest.spyOn(Navigation, 'navigate');

function createParams(overrides: Partial<HookParams> = {}): HookParams {
    return createMock<HookParams>({
        session: {email: WORK_EMAIL, accountID: 123},
        loginList: {[WORK_EMAIL]: {validatedDate: '2026-09-12 00:00:00'}},
        onboardingValues: {selfTourViewed: true},
        onboardingPersonalDetails: {firstName: '  Test  ', lastName: '  User  '},
        introSelected: {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE},
        conciergeReportID: '12345',
        conciergeChat: {reportID: '12345'},
        reportNameValuePairs: {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}12345`]: {private_isArchived: ''}},
        delegateAccountID: 456,
        ...overrides,
    });
}

describe('useContinueJoinWorkspaceOnboarding', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockCompleteOnboarding.mockReset().mockResolvedValue(undefined);
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([undefined, '', '   '])('opens personal details when the saved first name is %p', async (firstName) => {
        // Given no usable first name, even though the optional last name is present.
        const params = createParams({onboardingPersonalDetails: createMock<NonNullable<HookParams['onboardingPersonalDetails']>>({firstName, lastName: 'User'})});
        const {result} = renderHook(() => useContinueJoinWorkspaceOnboarding(params));
        await waitForBatchedUpdatesWithAct();

        // When continuing with replacement navigation requested by the calling screen.
        act(() => result.current({forceReplace: true}));

        // Then the required name step opens without prematurely completing or clearing onboarding state.
        expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
        expect(setOnboardingPolicyID).not.toHaveBeenCalled();
        expect(setOnboardingAdminsChatReportID).not.toHaveBeenCalled();
        expect(mockNavigateAfterOnboarding).not.toHaveBeenCalled();
    });

    it.each([false, true])('completes with the trimmed saved name and caller-provided onboarding data (anonymous: %s)', async (isAnonymousUser) => {
        // Given a saved name and an admins chat that completion must receive before state is cleared.
        const params = createParams({session: createMock({email: WORK_EMAIL, authTokenType: isAnonymousUser ? CONST.AUTH_TOKEN_TYPES.ANONYMOUS : undefined})});
        await Onyx.set(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, '67890');
        const {result} = renderHook(() => useContinueJoinWorkspaceOnboarding(params));
        await waitForBatchedUpdatesWithAct();

        // When the user continues without needing to re-enter their name.
        act(() => result.current());
        await waitForBatchedUpdatesWithAct();

        // Then completion gets the current caller data and successful completion clears the saved destinations.
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(mockCompleteOnboarding).toHaveBeenCalledWith({
            engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
            onboardingMessage: mockJoinWorkspaceMessages.empty,
            firstName: 'Test',
            lastName: 'User',
            adminsChatReportID: '67890',
            introSelected: params.introSelected,
            isSelfTourViewed: true,
            conciergeChat: params.conciergeChat,
            companyDomain: 'company.com',
            workEmail: WORK_EMAIL,
            currentUserAccountID: 123,
            delegateAccountID: 456,
        });
        expect(setOnboardingAdminsChatReportID).toHaveBeenCalledWith();
        expect(setOnboardingPolicyID).toHaveBeenCalledWith();
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledTimes(1);
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledWith(false, false, params.conciergeReportID, params.reportNameValuePairs, isAnonymousUser, undefined, undefined, false);
        expect(navigate).not.toHaveBeenCalled();
    });

    it.each([
        {scenario: 'public email', email: 'test@gmail.com', isValidated: true, policyState: 'none', expectedMessage: 'addWorkEmail'},
        {scenario: 'unvalidated work email', email: WORK_EMAIL, isValidated: false, policyState: 'none', expectedMessage: 'validateEmail'},
        {scenario: 'validated work email with no workspace', email: WORK_EMAIL, isValidated: true, policyState: 'none', expectedMessage: 'empty'},
        {scenario: 'pending workspace request', email: WORK_EMAIL, isValidated: true, policyState: 'pending', expectedMessage: 'joinWorkspace'},
        {scenario: 'joined workspace', email: WORK_EMAIL, isValidated: true, policyState: 'joined', expectedMessage: 'joinWorkspace'},
    ] as const)('selects the completion message and destination for $scenario', async ({email, isValidated, policyState, expectedMessage}) => {
        // Given the email and workspace state that determines which onboarding task remains outstanding.
        const params = createParams({session: createMock({email}), loginList: {[email]: {validatedDate: isValidated ? '2026-09-12 00:00:00' : ''}}});
        if (policyState !== 'none') {
            await Onyx.set(ONYXKEYS.ONBOARDING_POLICY_ID, POLICY_ID);
        }
        if (policyState === 'joined') {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID});
        }
        const {result} = renderHook(() => useContinueJoinWorkspaceOnboarding(params));
        await waitForBatchedUpdatesWithAct();

        // When completion uses the saved name rather than the personal-details screen.
        act(() => result.current());
        await waitForBatchedUpdatesWithAct();

        // Then only an already-joined workspace drops the task and becomes the navigation destination.
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({
                onboardingMessage: policyState === 'joined' ? {...mockJoinWorkspaceMessages.joinWorkspace, tasks: []} : mockJoinWorkspaceMessages[expectedMessage],
            }),
        );
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledWith(
            false,
            false,
            params.conciergeReportID,
            params.reportNameValuePairs,
            false,
            policyState === 'joined' ? POLICY_ID : undefined,
            undefined,
            false,
        );
        expect(mockJoinWorkspaceMessages.joinWorkspace.tasks).toHaveLength(1);
    });

    it('waits for completion and ignores repeated calls before and after success', async () => {
        // Given a pending completion request that must not enqueue another guided-setup write.
        let resolveCompletion = () => {};
        mockCompleteOnboarding.mockReturnValueOnce(
            new Promise<void>((resolve) => {
                resolveCompletion = resolve;
            }),
        );
        const params = createParams();
        const {result, rerender} = renderHook((props: HookParams) => useContinueJoinWorkspaceOnboarding(props), {initialProps: params});
        await waitForBatchedUpdatesWithAct();

        // When multiple effects continue onboarding, including after a render with fresh caller data.
        act(() => result.current());
        rerender({...params});
        act(() => result.current());

        // Then completion starts once, and cleanup/navigation wait until that request resolves.
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(setOnboardingPolicyID).not.toHaveBeenCalled();
        expect(setOnboardingAdminsChatReportID).not.toHaveBeenCalled();
        expect(mockNavigateAfterOnboarding).not.toHaveBeenCalled();
        await act(async () => resolveCompletion());
        await waitForBatchedUpdatesWithAct();
        act(() => result.current());
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledTimes(1);
    });

    it('preserves onboarding state after failure and allows a retry', async () => {
        // Given a request rejection, so the user must be able to retry without losing their destination.
        const error = new Error('Completion failed');
        const warn = jest.spyOn(Log, 'warn').mockImplementation(() => {});
        mockCompleteOnboarding.mockRejectedValueOnce(error);
        const {result} = renderHook(() => useContinueJoinWorkspaceOnboarding(createParams()));
        await waitForBatchedUpdatesWithAct();

        // When the first completion attempt fails.
        act(() => result.current());
        await waitForBatchedUpdatesWithAct();

        // Then failure is logged without clearing state, and the next attempt can complete successfully.
        expect(warn).toHaveBeenCalledWith(expect.any(String), {error});
        expect(setOnboardingPolicyID).not.toHaveBeenCalled();
        expect(setOnboardingAdminsChatReportID).not.toHaveBeenCalled();
        expect(mockNavigateAfterOnboarding).not.toHaveBeenCalled();
        act(() => result.current());
        await waitForBatchedUpdatesWithAct();
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(2);
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    it.each([false, true])('uses the latest merged-account data (redirect to Classic: %s)', async (shouldRedirectToClassicAfterMerge) => {
        // Given a mounted screen whose props still refer to the original account before a merge.
        const {result, rerender} = renderHook((props: HookParams) => useContinueJoinWorkspaceOnboarding(props), {initialProps: createParams()});
        await waitForBatchedUpdatesWithAct();
        const mergedParams = createParams({
            session: createMock({email: MERGED_WORK_EMAIL}),
            loginList: {[MERGED_WORK_EMAIL]: {validatedDate: '2026-09-12 00:00:00'}},
            onboardingPersonalDetails: createMock({firstName: 'Merged', lastName: ''}),
            onboardingValues: createMock<NonNullable<HookParams['onboardingValues']>>({shouldValidate: true, shouldRedirectToClassicAfterMerge}),
            conciergeReportID: '99999',
            conciergeChat: createMock({reportID: '99999'}),
        });

        // When the caller receives the merged account and then continues onboarding.
        rerender(mergedParams);
        act(() => result.current());
        await waitForBatchedUpdatesWithAct();

        // Then completion uses fresh props, with the merged Concierge destination only for the NewDot merge flow.
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({firstName: 'Merged', lastName: '', workEmail: MERGED_WORK_EMAIL, conciergeChat: mergedParams.conciergeChat}),
        );
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledWith(
            false,
            false,
            '99999',
            mergedParams.reportNameValuePairs,
            false,
            undefined,
            shouldRedirectToClassicAfterMerge ? undefined : '99999',
            false,
        );
    });
});
