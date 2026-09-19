import {act, render} from '@testing-library/react-native';

import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {LocaleContext, LocaleContextProvider} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import enTranslations from '@src/languages/en';
import flattenObject from '@src/languages/flattenObject';
import IntlStore from '@src/languages/IntlStore';

import React, {useContext} from 'react';

import type {createColdIntlStoreMock} from '../utils/createIntlStoreMock';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/languages/IntlStore', () => ({
    __esModule: true,
    default: jest.requireActual<{createColdIntlStoreMock: typeof createColdIntlStoreMock}>('../utils/createIntlStoreMock').createColdIntlStoreMock(),
}));

describe('LocaleContextProvider', () => {
    it('rebuilds translate when the translations land on a cold start in the same locale', async () => {
        // Given a provider on a cold start, settled after its own Onyx reads, whose translate still returns raw keys
        const seen: LocaleContextProps[] = [];
        function Capture() {
            seen.push(useContext(LocaleContext));
            return null;
        }

        render(
            <LocaleContextProvider>
                <Capture />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        const beforeLoad = seen.at(-1);
        expect(beforeLoad?.translate('common.close')).toBe('common.close');

        // When the English translations land without the locale changing
        act(() => {
            IntlStore.seedForTests(CONST.LOCALES.EN, flattenObject(enTranslations));
        });

        // Then translate is a new callback that translates, because the locale never left `en` and one keyed on it alone would still be the pre-load one
        const afterLoad = seen.at(-1);
        expect(afterLoad?.translate).not.toBe(beforeLoad?.translate);
        expect(afterLoad?.translate('common.close')).toBe('Close');
    });
});
