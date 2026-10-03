import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import useOnboardingMessages from '@hooks/useOnboardingMessages';

import CONST from '@src/CONST';
import enTranslations from '@src/languages/en';
import flattenObject from '@src/languages/flattenObject';
import IntlStore from '@src/languages/IntlStore';

import type {createColdIntlStoreMock} from '../utils/createIntlStoreMock';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/languages/IntlStore', () => ({
    __esModule: true,
    default: jest.requireActual<{createColdIntlStoreMock: typeof createColdIntlStoreMock}>('../utils/createIntlStoreMock').createColdIntlStoreMock(),
}));

describe('useOnboardingMessages', () => {
    it('rebuilds the eagerly translated messages when the translations land on a cold start', async () => {
        // Given a cold start in English, where the hook first runs before the table has landed and so reads raw keys
        const {result} = renderHook(() => useOnboardingMessages(), {wrapper: LocaleContextProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current.testDrive.EMBEDDED_DEMO_IFRAME_TITLE).toBe('onboarding.testDrive.embeddedDemoIframeTitle');

        // When the English translations land without the locale changing
        act(() => {
            IntlStore.seedForTests(CONST.LOCALES.EN, flattenObject(enTranslations));
        });

        // Then the messages are rebuilt with real text. The locale reads `en` on both sides of the load, so a memo keyed
        // on it alone keeps the raw keys, and these are the strings onboarding sends to the server
        expect(result.current.testDrive.EMBEDDED_DEMO_IFRAME_TITLE).toBe('Test Drive');
    });
});
