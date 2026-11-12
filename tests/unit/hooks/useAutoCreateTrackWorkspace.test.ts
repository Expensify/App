import {renderHook} from '@testing-library/react-native';

import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import useAutoCreateTrackWorkspace from '@hooks/useAutoCreateTrackWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import usePreferredPolicy from '@hooks/usePreferredPolicy';

import * as navigateAfterOnboarding from '@libs/navigateAfterOnboarding';

import * as Policy from '@userActions/Policy/Policy';
import * as Report from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/SidePanel/isSidePanelReportSupported', () => ({
    __esModule: true,
    default: true,
}));
jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useHasActiveAdminPolicies');
jest.mock('@hooks/useLocalize');
jest.mock('@hooks/usePreferredPolicy');
jest.mock('@hooks/useOnboardingMessages');

const mockTranslate: LocalizedTranslate = (path, ...parameters) => {
    parameters.some(() => false);
    return path;
};

type MockSession = Session & Required<Pick<Session, 'accountID' | 'email'>>;

const MOCK_SESSION = createMock<MockSession>({
    accountID: 12345,
    email: 'test@expensify.com',
});

const MOCK_POLICY_ID = 'mock-policy-id';

function setupDefaultMocks() {
    jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
        accountID: MOCK_SESSION.accountID,
        login: MOCK_SESSION.email,
        localCurrencyCode: 'USD',
    });

    jest.mocked(useLocalize).mockReturnValue(
        createMock<ReturnType<typeof useLocalize>>({
            translate: mockTranslate,
            formatPhoneNumber: (phone: string) => phone,
        }),
    );

    jest.mocked(usePreferredPolicy).mockReturnValue({
        isRestrictedToPreferredPolicy: false,
        preferredPolicyID: undefined,
        isRestrictedPolicyCreation: false,
        isLoadingPreferredPolicy: false,
    });

    jest.mocked(useHasActiveAdminPolicies).mockReturnValue(false);

    jest.mocked(useOnboardingMessages).mockReturnValue(createMock<ReturnType<typeof useOnboardingMessages>>({onboardingMessages: {}}));
}

describe('useAutoCreateTrackWorkspace', () => {
    jest.spyOn(Policy, 'createWorkspace').mockReturnValue(
        createMock<ReturnType<typeof Policy.createWorkspace>>({
            policyID: MOCK_POLICY_ID,
            adminsChatReportID: 'mock-admins-chat-report-id',
        }),
    );
    const completeOnboardingSpy = jest.spyOn(Report, 'completeOnboarding').mockResolvedValue(undefined);
    const navigateSpy = jest.spyOn(navigateAfterOnboarding, 'navigateAfterOnboardingWithMicrotaskQueue').mockImplementation(jest.fn());

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: MOCK_SESSION,
            [ONYXKEYS.BETAS]: [],
        });
        await waitForBatchedUpdates();
        setupDefaultMocks();
    });

    it('falls back to the trackExpensesWithConcierge variant when the response has no variant', async () => {
        // Given a CompleteGuidedSetup response without an onboarding variant, which the backend doesn't always send for Track choices

        // When the Track onboarding finishes
        const {result} = renderHook(() => useAutoCreateTrackWorkspace());
        await result.current('Jane', 'Smith', CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);

        // Then navigation still gets the Track variant, so the user lands on Home with the side panel closed
        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy.mock.calls.at(0)?.at(5)).toBe(MOCK_POLICY_ID);
        expect(navigateSpy.mock.calls.at(0)?.at(8)).toEqual({variantOverride: CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE});
    });

    it('falls back to the trackExpensesWithConcierge variant when completing onboarding fails', async () => {
        // Given the CompleteGuidedSetup request fails, so there is no response to read a variant from
        completeOnboardingSpy.mockRejectedValueOnce(new Error('network'));

        // When the Track onboarding finishes
        const {result} = renderHook(() => useAutoCreateTrackWorkspace());
        await result.current('Jane', 'Smith', CONST.ONBOARDING_CHOICES.TRACK_PERSONAL);

        // Then the error path also uses the Track variant instead of falling through to the generic landing
        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy.mock.calls.at(0)?.at(8)).toEqual({variantOverride: CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE});
    });
});
