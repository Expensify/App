// cspell:ignore Enviar
import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

function ActionBadgeLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('common.actionBadge.submit')}</Text>;
}

async function renderActionBadgeLabelInEnglish() {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <ActionBadgeLabel />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function switchToSpanish() {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('LocaleContextProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await IntlStore.load(CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('re-translates rendered strings when the preferred locale changes', async () => {
        // Given a component rendered with English translations
        await renderActionBadgeLabelInEnglish();
        expect(screen.getByText('Submit')).toBeOnTheScreen();

        // When the user switches the app language to Spanish
        await switchToSpanish();

        // Then the rendered string is re-translated
        expect(screen.getByText('Enviar')).toBeOnTheScreen();
    });

    it('re-translates rendered strings even when React never observes the translations loading flag', async () => {
        // Given a component rendered with English translations
        await renderActionBadgeLabelInEnglish();
        expect(screen.getByText('Submit')).toBeOnTheScreen();

        // When the user switches to Spanish and the locale module resolves before React renders with
        // RAM_ONLY_ARE_TRANSLATIONS_LOADING set to true, which happens on native where there is no chunk to fetch.
        // We model that by keeping the flag at false for the whole switch.
        const originalSet = Onyx.set.bind(Onyx);
        jest.spyOn(Onyx, 'set').mockImplementation((key, value) => {
            if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                return Promise.resolve();
            }
            return originalSet(key, value);
        });
        await switchToSpanish();

        // Then the rendered string is still re-translated, because the context follows IntlStore's current locale
        // value instead of the loading flag's true -> false transition
        expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.ES);
        expect(screen.getByText('Enviar')).toBeOnTheScreen();
    });
});
