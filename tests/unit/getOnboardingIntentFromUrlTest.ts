import {getOnboardingIntentFromUrl} from '@hooks/useOnboardingDeeplinkIntent';

import CONST from '@src/CONST';

describe('getOnboardingIntentFromUrl', () => {
    const encodedOnboardingRoute = encodeURIComponent('onboarding?intent=submit');

    it('reads the intent from a direct onboarding link', () => {
        expect(getOnboardingIntentFromUrl('https://new.expensify.com/onboarding?intent=submit')).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from a custom scheme link, where the route sits where a host would', () => {
        expect(getOnboardingIntentFromUrl('new-expensify://onboarding?intent=submit')).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from a custom scheme link with a placeholder host', () => {
        expect(getOnboardingIntentFromUrl('app://-/onboarding?intent=submit')).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from the exitTo of a custom scheme magic link', () => {
        expect(getOnboardingIntentFromUrl(`new-expensify://v/12345/678910?exitTo=${encodedOnboardingRoute}`)).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from a link served on a port, as the dev server does', () => {
        expect(getOnboardingIntentFromUrl('https://dev.new.expensify.com:8082/onboarding?intent=submit')).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from an in-app path without an origin', () => {
        expect(getOnboardingIntentFromUrl('/onboarding?intent=submit')).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    // HybridApp hands NewDot the deeplink as a bare path rather than a full URL, which is the shape the emailed
    // magic link arrives in on mobile.
    it('reads the intent from the exitTo of a magic link passed as a bare path', () => {
        expect(getOnboardingIntentFromUrl(`v/12345/678910?exitTo=${encodedOnboardingRoute}`)).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from the exitTo of an OldDot transition link', () => {
        const url = `https://new.expensify.com/transition?email=${encodeURIComponent('me@example.com')}&shortLivedAuthToken=abc123&exitTo=${encodedOnboardingRoute}`;

        expect(getOnboardingIntentFromUrl(url)).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from the exitTo of a magic link', () => {
        const url = `https://new.expensify.com/v/12345/678910?exitTo=${encodedOnboardingRoute}`;

        expect(getOnboardingIntentFromUrl(url)).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from an unencoded exitTo, which OldDot mobile does not encode', () => {
        const url = 'https://new.expensify.com/transition?shortLivedAuthToken=abc123&exitTo=onboarding?intent=submit';

        expect(getOnboardingIntentFromUrl(url)).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it.each([
        ['no url', undefined],
        ['an empty url', ''],
        ['an onboarding link without an intent', 'https://new.expensify.com/onboarding'],
        ['an unknown intent value', 'https://new.expensify.com/onboarding?intent=notARealIntent'],
        ['an intent on a non-onboarding route', 'https://new.expensify.com/settings/profile?intent=submit'],
        ['an intent on a route that merely starts with onboarding', 'https://new.expensify.com/onboarding/work-email?intent=submit'],
        ['an intent on a non-onboarding exitTo', `https://new.expensify.com/transition?exitTo=${encodeURIComponent('workspace/new?intent=submit')}`],
    ])('returns undefined for %s', (_description, url) => {
        expect(getOnboardingIntentFromUrl(url)).toBeUndefined();
    });
});
