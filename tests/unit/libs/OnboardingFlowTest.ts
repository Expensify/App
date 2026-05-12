import Onyx from 'react-native-onyx';
import {getOnboardingInitialPath} from '@libs/actions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Onboarding} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const baseOnboarding: Pick<Onboarding, 'hasCompletedGuidedSetupFlow'> = {
    hasCompletedGuidedSetupFlow: false,
};

const baseParams = {
    isUserFromPublicDomain: false,
    hasAccessiblePolicies: false,
    currentOnboardingPurposeSelected: undefined,
    currentOnboardingCompanySize: undefined,
    onboardingInitialPath: '',
    onboardingValues: undefined,
};

describe('getOnboardingInitialPath', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('pre-sets MICRO_SMALL ("1-4") company size for the granular VSB_1_4 qualifier', async () => {
        const onboardingValues = {
            ...baseOnboarding,
            signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4,
        } as Onboarding;

        getOnboardingInitialPath({...baseParams, onboardingValuesParam: onboardingValues});
        await waitForBatchedUpdates();

        const companySize = await new Promise<unknown>((resolve) => {
            const id = Onyx.connect({
                key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
                callback: (value) => {
                    Onyx.disconnect(id);
                    resolve(value);
                },
            });
        });

        expect(companySize).toBe(CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL);
    });

    it('pre-sets the legacy MICRO ("1-10") company size for the legacy VSB qualifier', async () => {
        const onboardingValues = {
            ...baseOnboarding,
            signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
        } as Onboarding;

        getOnboardingInitialPath({...baseParams, onboardingValuesParam: onboardingValues});
        await waitForBatchedUpdates();

        const companySize = await new Promise<unknown>((resolve) => {
            const id = Onyx.connect({
                key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
                callback: (value) => {
                    Onyx.disconnect(id);
                    resolve(value);
                },
            });
        });

        expect(companySize).toBe(CONST.ONBOARDING_COMPANY_SIZE.MICRO);
    });

    it('sets MANAGE_TEAM purpose for the granular SMB_5_PLUS qualifier without pre-setting a company size', async () => {
        const onboardingValues = {
            ...baseOnboarding,
            signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS,
        } as Onboarding;

        getOnboardingInitialPath({...baseParams, onboardingValuesParam: onboardingValues});
        await waitForBatchedUpdates();

        const purpose = await new Promise<unknown>((resolve) => {
            const id = Onyx.connect({
                key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
                callback: (value) => {
                    Onyx.disconnect(id);
                    resolve(value);
                },
            });
        });

        const companySize = await new Promise<unknown>((resolve) => {
            const id = Onyx.connect({
                key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
                callback: (value) => {
                    Onyx.disconnect(id);
                    resolve(value);
                },
            });
        });

        expect(purpose).toBe(CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        // SMB_5_PLUS users still need to choose a specific size on the employees step (5-10, 11-50, etc.).
        expect(companySize).toBeFalsy();
    });

    it('routes the granular SMB_5_PLUS qualifier to the employees step', () => {
        const onboardingValues = {
            ...baseOnboarding,
            signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS,
        } as Onboarding;

        const path = getOnboardingInitialPath({...baseParams, onboardingValuesParam: onboardingValues});
        expect(path).toContain('employees');
    });

    it('routes the granular VSB_1_4 qualifier to the accounting step', () => {
        const onboardingValues = {
            ...baseOnboarding,
            signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4,
        } as Onboarding;

        const path = getOnboardingInitialPath({...baseParams, onboardingValuesParam: onboardingValues});
        expect(path).toContain('accounting');
    });
});
