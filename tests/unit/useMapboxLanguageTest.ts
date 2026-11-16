import {renderHook, waitFor} from '@testing-library/react-native';

import useMapboxLanguage from '@components/MapView/useMapboxLanguage';

import Log from '@libs/Log';

import type {Locale} from '@src/CONST/LOCALES';

import {setLanguage} from '@rnmapbox/maps';

jest.mock('@rnmapbox/maps', () => ({
    setLanguage: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/Log', () => ({warn: jest.fn()}));

describe('useMapboxLanguage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each<[Locale, string]>([
        ['en', 'en'],
        ['es', 'es'],
        ['fr', 'fr'],
        ['de', 'de'],
        ['it', 'it'],
        ['ja', 'ja'],
        ['nl', 'nl'],
        ['pl', 'pl'],
        ['el', 'el'],
        ['pt-BR', 'pt'],
        ['zh-hans', 'zh-Hans'],
    ])('sets the native tile language for %s to %s', (locale, language) => {
        // Given an app locale, including those with different Mapbox language codes
        // When a native map mounts
        renderHook(() => useMapboxLanguage(locale));

        // Then the SDK requests tiles in the app's language rather than the device's language
        expect(setLanguage).toHaveBeenCalledWith(language);
    });

    it('updates the language when the app locale changes without resetting it on unmount', () => {
        // Given a map that has already selected English tiles
        const {rerender, unmount} = renderHook(({locale}) => useMapboxLanguage(locale), {initialProps: {locale: 'en' as Locale}});

        // When the app changes language while the map is mounted
        rerender({locale: 'ja'});

        // Then the SDK updates its persistent language, including maps that are already mounted
        expect(setLanguage).toHaveBeenNthCalledWith(1, 'en');
        expect(setLanguage).toHaveBeenNthCalledWith(2, 'ja');

        // When this map unmounts while another map may still be visible
        unmount();

        // Then the shared native language is not reset to the device's locale
        expect(setLanguage).toHaveBeenCalledTimes(2);
    });

    it('does not request a language update on an unrelated render', () => {
        // Given a map that has already selected Japanese tiles
        const {rerender} = renderHook(() => useMapboxLanguage('ja'));

        // When the map renders again without a locale change
        rerender({});

        // Then it does not repeat the native settings update
        expect(setLanguage).toHaveBeenCalledTimes(1);
    });

    it('clears a persisted language when the app locale is unavailable', () => {
        // Given a native language persisted by an earlier map
        const {rerender} = renderHook(({locale}: {locale: Locale | undefined}) => useMapboxLanguage(locale), {initialProps: {locale: 'ja'}});

        // When no app locale is available
        rerender({locale: undefined});

        // Then Mapbox falls back to the device locale instead of keeping the earlier language
        expect(setLanguage).toHaveBeenLastCalledWith(null);
    });

    it('logs a native settings failure without rejecting the map render', async () => {
        // Given a native settings update that cannot be applied
        const error = new Error('Settings unavailable');
        const warnSpy = jest.spyOn(Log, 'warn');
        jest.mocked(setLanguage).mockRejectedValueOnce(error);

        // When the map attempts to select its language
        renderHook(() => useMapboxLanguage('ja'));

        // Then the rejection is handled and includes the language needed to diagnose it
        await waitFor(() => expect(warnSpy).toHaveBeenCalledWith('Failed to set Mapbox language', {language: 'ja', error}));
    });
});
