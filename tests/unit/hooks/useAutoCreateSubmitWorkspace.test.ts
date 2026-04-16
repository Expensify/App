import {renderHook} from '@testing-library/react-native';
import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import * as navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
// eslint-disable-next-line no-restricted-syntax
import * as Policy from '@userActions/Policy/Policy';
// eslint-disable-next-line no-restricted-syntax
import * as Report from '@userActions/Report';
// eslint-disable-next-line no-restricted-syntax
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';

jest.mock('@hooks/useOnyx', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {__esModule: true, default: jest.fn(() => [undefined])};
});

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useHasActiveAdminPolicies');
jest.mock('@hooks/useLocalize');
jest.mock('@hooks/usePreferredPolicy');
jest.mock('@hooks/useOnboardingMessages');

const mockTranslate = jest.fn((key: string) => key);
const mockFormatPhoneNumber = jest.fn((phone: string) => phone);

const MOCK_SESSION = {
    accountID: 12345,
    email: 'test@expensify.com',
};

const MOCK_POLICY_ID = 'mock-policy-id';
const MOCK_ADMINS_CHAT_REPORT_ID = 'mock-admins-chat-report-id';
const MOCK_ONBOARDING_MESSAGE = {message: 'Welcome!', video: undefined, tasks: []};

function setupDefaultMocks() {
    const mockUseOnyx = useOnyx as jest.Mock;
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === 'session') {
            return [MOCK_SESSION];
        }
        if (key === 'betas') {
            return [[]];
        }
        if (key.startsWith('policy_')) {
            return [false];
        }
        return [undefined];
    });

    (useCurrentUserPersonalDetails as jest.Mock).mockReturnValue({
        accountID: MOCK_SESSION.accountID,
        login: MOCK_SESSION.email,
        localCurrencyCode: 'USD',
    });

    (useLocalize as jest.Mock).mockReturnValue({
        translate: mockTranslate,
        formatPhoneNumber: mockFormatPhoneNumber,
    });

    (usePreferredPolicy as jest.Mock).mockReturnValue({
        isRestrictedToPreferredPolicy: false,
        preferredPolicyID: undefined,
        isRestrictedPolicyCreation: false,
    });

    (useHasActiveAdminPolicies as jest.Mock).mockReturnValue(false);

    (useOnboardingMessages as jest.Mock).mockReturnValue({
        onboardingMessages: {
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: MOCK_ONBOARDING_MESSAGE,
        },
    });
}

describe('useAutoCreateSubmitWorkspace', () => {
    const createWorkspaceSpy = jest.spyOn(Policy, 'createWorkspace').mockReturnValue({
        policyID: MOCK_POLICY_ID,
        adminsChatReportID: MOCK_ADMINS_CHAT_REPORT_ID,
    } as ReturnType<typeof Policy.createWorkspace>);
    const completeOnboardingSpy = jest.spyOn(Report, 'completeOnboarding').mockImplementation(jest.fn());
    const setOnboardingAdminsChatReportIDSpy = jest.spyOn(Welcome, 'setOnboardingAdminsChatReportID').mockImplementation(jest.fn());
    const setOnboardingPolicyIDSpy = jest.spyOn(Welcome, 'setOnboardingPolicyID').mockImplementation(jest.fn());
    const navigateSpy = jest.spyOn(navigateAfterOnboarding, 'navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue').mockImplementation(jest.fn());

    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('creates a Submit workspace with the correct parameters for a new EMPLOYER user', () => {
        // Given a new user going through onboarding with no existing workspace (onboardingPolicyID is undefined,
        // hasPaidGroupAdminPolicy is false, and policy creation is not restricted)

        // When the autoCreateSubmitWorkspace function is invoked during onboarding
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then a Submit workspace should be created because EMPLOYER users without an existing
        // workspace need one auto-created to land on after onboarding
        expect(createWorkspaceSpy).toHaveBeenCalledTimes(1);
        expect(createWorkspaceSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                makeMeAdmin: true,
                engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                currency: 'USD',
                shouldAddOnboardingTasks: false,
                shouldAddGuideWelcomeMessage: false,
                type: CONST.POLICY.TYPE.SUBMIT,
                currentUserAccountIDParam: MOCK_SESSION.accountID,
                currentUserEmailParam: MOCK_SESSION.email,
            }),
        );
    });

    it('completes onboarding with the newly created workspace and admins chat IDs', () => {
        // Given a new user with no pre-existing onboarding workspace

        // When the hook creates a workspace and finishes the onboarding flow
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then completeOnboarding should receive the IDs returned by createWorkspace so the backend
        // can associate the guided setup data with the correct workspace and admins chat
        expect(completeOnboardingSpy).toHaveBeenCalledTimes(1);
        expect(completeOnboardingSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                onboardingMessage: MOCK_ONBOARDING_MESSAGE,
                firstName: 'John',
                lastName: 'Doe',
                adminsChatReportID: MOCK_ADMINS_CHAT_REPORT_ID,
                onboardingPolicyID: MOCK_POLICY_ID,
            }),
        );
    });

    it('clears onboarding state after the flow completes', () => {
        // Given a user completing the onboarding flow

        // When autoCreateSubmitWorkspace finishes
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then the transient onboarding Onyx keys should be cleared so the onboarding
        // flow is not re-triggered on subsequent app launches
        expect(setOnboardingAdminsChatReportIDSpy).toHaveBeenCalledTimes(1);
        expect(setOnboardingPolicyIDSpy).toHaveBeenCalledTimes(1);
    });

    it('navigates to the submit workspace page after completing onboarding', () => {
        // Given a user completing the EMPLOYER onboarding flow

        // When autoCreateSubmitWorkspace finishes setting up the workspace
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then the user should be navigated to the newly created Submit workspace
        // so they land on their workspace immediately after onboarding
        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(MOCK_POLICY_ID);
    });

    it('reuses the existing onboarding workspace instead of creating a new one', () => {
        // Given a user who already has an onboardingPolicyID set (e.g. assigned by an admin
        // or from a previous partial onboarding attempt)
        const existingPolicyID = 'existing-policy-id';
        const existingAdminsReportID = 'existing-admins-report-id';

        (useOnyx as jest.Mock).mockImplementation((key: string) => {
            if (key === 'onboardingPolicyID') {
                return [existingPolicyID];
            }
            if (key === 'onboardingAdminsChatReportID') {
                return [existingAdminsReportID];
            }
            if (key === 'session') {
                return [MOCK_SESSION];
            }
            if (key === 'betas') {
                return [[]];
            }
            if (key.startsWith('policy_')) {
                return [false];
            }
            return [undefined];
        });

        // When the onboarding flow runs
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('Jane', 'Smith');

        // Then no new workspace should be created, and completeOnboarding should use
        // the pre-existing IDs to avoid creating duplicate workspaces
        expect(createWorkspaceSpy).not.toHaveBeenCalled();
        expect(completeOnboardingSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                adminsChatReportID: existingAdminsReportID,
                onboardingPolicyID: existingPolicyID,
            }),
        );
    });

    it('skips workspace creation when the user is already a paid group policy admin', () => {
        // Given a user who is already an admin of a paid group policy
        (useOnyx as jest.Mock).mockImplementation((key: string) => {
            if (key === 'session') {
                return [MOCK_SESSION];
            }
            if (key === 'betas') {
                return [[]];
            }
            if (key === 'onboardingPolicyID') {
                return [undefined];
            }
            if (key === 'onboardingAdminsChatReportID') {
                return [undefined];
            }
            if (key.startsWith('policy_')) {
                return [true];
            }
            return [undefined];
        });

        // When onboarding completes
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('Jane', 'Smith');

        // Then no Submit workspace should be created because the user already has
        // a paid group workspace and creating another would be redundant
        expect(createWorkspaceSpy).not.toHaveBeenCalled();
    });

    it('skips workspace creation when the user domain restricts policy creation', () => {
        // Given a user whose domain security group has enableRestrictedPolicyCreation set to true
        (usePreferredPolicy as jest.Mock).mockReturnValue({
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
            isRestrictedPolicyCreation: true,
        });

        // When the onboarding flow runs
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('Jane', 'Smith');

        // Then workspace creation should be skipped because the domain admin has
        // restricted users from creating their own policies
        expect(createWorkspaceSpy).not.toHaveBeenCalled();
        expect(completeOnboardingSpy).toHaveBeenCalledTimes(1);
    });

    it('still completes onboarding and navigates even when workspace creation is skipped', () => {
        // Given a user who cannot create a workspace due to domain restrictions
        (usePreferredPolicy as jest.Mock).mockReturnValue({
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
            isRestrictedPolicyCreation: true,
        });

        // When the onboarding flow runs
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('Jane', 'Smith');

        // Then onboarding should still be completed and navigation should still occur
        // because the user needs to finish onboarding regardless of workspace creation
        expect(completeOnboardingSpy).toHaveBeenCalledTimes(1);
        expect(setOnboardingAdminsChatReportIDSpy).toHaveBeenCalledTimes(1);
        expect(setOnboardingPolicyIDSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledTimes(1);
    });

    it('uses the localCurrencyCode from personal details for workspace currency', () => {
        // Given a user whose personal details have localCurrencyCode set to GBP
        (useCurrentUserPersonalDetails as jest.Mock).mockReturnValue({
            accountID: MOCK_SESSION.accountID,
            login: MOCK_SESSION.email,
            localCurrencyCode: 'GBP',
        });

        // When a workspace is created during onboarding
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then the workspace should use GBP as its currency so it matches the user's locale
        expect(createWorkspaceSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                currency: 'GBP',
            }),
        );
    });

    it('falls back to USD when localCurrencyCode is not available', () => {
        // Given a user whose personal details do not have a localCurrencyCode set
        (useCurrentUserPersonalDetails as jest.Mock).mockReturnValue({
            accountID: MOCK_SESSION.accountID,
            login: MOCK_SESSION.email,
            localCurrencyCode: undefined,
        });

        // When a workspace is created during onboarding
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('John', 'Doe');

        // Then the workspace should default to USD as a safe fallback currency
        expect(createWorkspaceSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                currency: CONST.CURRENCY.USD,
            }),
        );
    });

    it('forwards firstName and lastName to completeOnboarding for display name setup', () => {
        // Given a user providing their name during the onboarding personal details step

        // When the onboarding flow completes
        const {result} = renderHook(() => useAutoCreateSubmitWorkspace());
        result.current('Alice', 'Wonderland');

        // Then the provided name should be passed through to completeOnboarding so the
        // backend can set up the user's display name as part of the guided setup
        expect(completeOnboardingSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'Alice',
                lastName: 'Wonderland',
            }),
        );
    });
});
