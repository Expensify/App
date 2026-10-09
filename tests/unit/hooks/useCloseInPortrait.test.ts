import {renderHook} from '@testing-library/react-native';

import useCloseInPortrait from '@hooks/useCloseInPortrait';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {StrictMode} from 'react';

let mockIsInLandscapeMode = true;
jest.mock('@hooks/useIsInLandscapeMode', () => () => mockIsInLandscapeMode);

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

const FORM_PATH = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, '1', '2');

describe('useCloseInPortrait', () => {
    beforeEach(() => {
        mockIsInLandscapeMode = true;
        mockIsFocused = true;
        jest.mocked(Navigation.goBack).mockClear();
    });

    it('goes back to the form once the phone is turned to portrait', () => {
        // Given a page the form opened in place of its list because the phone was in landscape
        const {rerender} = renderHook(() => useCloseInPortrait(true, FORM_PATH));
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When the phone is turned back to portrait
        mockIsInLandscapeMode = false;
        rerender({});

        // Then the page goes back to the form, which reopens its list there
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(FORM_PATH);
    });

    it('goes back only once, so it never closes the form behind it too', () => {
        // Given a page that opens already in portrait, e.g. the phone was turned while it was opening, under StrictMode,
        // which runs effects twice the way a remount or a repeated focus would
        mockIsInLandscapeMode = false;

        // When it renders
        renderHook(() => useCloseInPortrait(true, FORM_PATH), {wrapper: StrictMode});

        // Then it goes back once, not twice
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('stays open for a page that was not opened in place of a list', () => {
        // Given the full-page selector opened for any other reason, e.g. a wide layout with no room for the pop-over
        // When it renders in portrait
        mockIsInLandscapeMode = false;
        renderHook(() => useCloseInPortrait(undefined, FORM_PATH));

        // Then it stays, since the form has no list to return to
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('waits until it is on top again before going back', () => {
        // Given a page with another page opened on top of it, e.g. to add a category
        mockIsFocused = false;
        const {rerender} = renderHook(() => useCloseInPortrait(true, FORM_PATH));

        // When the phone is turned to portrait while that other page is on top
        mockIsInLandscapeMode = false;
        rerender({});

        // Then nothing happens yet, since going back now would close the page on top instead
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // And once the user is back on this page, it goes back to the form
        mockIsFocused = true;
        rerender({});
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });
});
