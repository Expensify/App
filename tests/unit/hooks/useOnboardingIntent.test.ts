import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useOnboardingIntent', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns undefined when neither key is set', () => {
        const {result} = renderHook(() => useOnboardingIntent());
        expect(result.current).toBeUndefined();
    });

    it('returns the value from NVP_INTRO_SELECTED.choice when only that key is set', async () => {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useOnboardingIntent());

        expect(result.current).toBe(CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
    });

    it('returns the value from ONBOARDING_PURPOSE_SELECTED when only that key is set', async () => {
        await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useOnboardingIntent());

        expect(result.current).toBe(CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);
    });

    it('prefers NVP_INTRO_SELECTED.choice over ONBOARDING_PURPOSE_SELECTED when both are set', async () => {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useOnboardingIntent());

        expect(result.current).toBe(CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
    });

    it('falls back to ONBOARDING_PURPOSE_SELECTED when NVP_INTRO_SELECTED has no choice field', async () => {
        // IntroSelected present but choice is undefined (e.g. invited user who never picked a purpose)
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE});
        await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.PERSONAL_SPEND);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useOnboardingIntent());

        expect(result.current).toBe(CONST.ONBOARDING_CHOICES.PERSONAL_SPEND);
    });

    it('returns undefined when NVP_INTRO_SELECTED has no choice field and ONBOARDING_PURPOSE_SELECTED is not set', async () => {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useOnboardingIntent());

        expect(result.current).toBeUndefined();
    });
});
