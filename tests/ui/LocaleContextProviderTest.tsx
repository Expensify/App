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
        // The provider's own Onyx reads settle first, so the pre-load render captured below is the steady state.
        await waitForBatchedUpdatesWithAct();

        const beforeLoad = seen.at(-1);
        expect(beforeLoad?.translate('common.close')).toBe('common.close');

        act(() => {
            IntlStore.seedForTests(CONST.LOCALES.EN, flattenObject(enTranslations));
        });

        const afterLoad = seen.at(-1);
        // The locale never moved off `en`, so a callback keyed on it alone would still be the pre-load one.
        expect(afterLoad?.translate).not.toBe(beforeLoad?.translate);
        expect(afterLoad?.translate('common.close')).toBe('Close');
    });
});
