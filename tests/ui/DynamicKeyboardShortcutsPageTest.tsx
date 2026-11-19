import {act, fireEvent, render, screen, userEvent, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DynamicKeyboardShortcutsPage from '@pages/settings/DynamicKeyboardShortcutsPage';

import CONST from '@src/CONST';
import el from '@src/languages/el';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useDynamicBackPath', () => jest.fn());

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();
const DESCRIPTIONS = [
    'Mark all messages as read',
    'Open search dialog',
    'New chat screen',
    'Opens the keyboard shortcuts dialog',
    'Escape dialogs',
    'Copy comment',
    'Open testing preferences dialog',
    'Search expense reports',
    "Go to the current report's workspace",
];

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS}
                            component={DynamicKeyboardShortcutsPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('DynamicKeyboardShortcutsPage', () => {
    beforeEach(async () => {
        jest.mocked(useDynamicBackPath).mockReturnValue(ROUTES.SETTINGS_ABOUT);
        jest.spyOn(KeyboardShortcut, 'getPlatformEquivalentForKeys').mockImplementation((keys) => keys.map((key) => (key === 'CTRL' ? 'CONTROL' : key)));
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'isNavigationReady').mockResolvedValue(undefined);
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        jest.restoreAllMocks();
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each([
        {controlKey: 'CONTROL', displayModifier: 'CTRL'},
        {controlKey: 'META', displayModifier: 'CMD'},
    ])('lists only the documented shortcuts in order with $displayModifier modifiers', async ({controlKey, displayModifier}) => {
        // Given a controlled platform mapping so the reference must use the helper's modifier rather than assume macOS
        jest.spyOn(KeyboardShortcut, 'getPlatformEquivalentForKeys').mockImplementation((keys) => keys.map((key) => (key === 'CTRL' ? controlKey : key)));
        const titles = [
            'Shift + ESC',
            `${displayModifier} + K`,
            `${displayModifier} + Shift + K`,
            `${displayModifier} + J`,
            'ESC',
            `${displayModifier} + C`,
            `${displayModifier} + D`,
            `${displayModifier} + Shift + G`,
            `${displayModifier} + Shift + P`,
        ];

        // When the actual reference page renders, including its real MenuItem rows and header
        renderPage();
        await screen.findByText(DESCRIPTIONS.at(-1) ?? '');

        // Then every described shortcut is present once, with its title before its description in both text and accessible name
        const page = within(screen.getByTestId('KeyboardShortcutsPage'));
        expect(page.getByText('Keyboard shortcuts')).toBeOnTheScreen();
        expect(page.getByText('Save time with these handy keyboard shortcuts:')).toBeOnTheScreen();
        const rows = page.getAllByLabelText(/, /);
        expect(rows).toHaveLength(DESCRIPTIONS.length);
        for (const [index, row] of rows.entries()) {
            const description = DESCRIPTIONS.at(index) ?? '';
            const title = titles.at(index) ?? '';
            expect(row).toHaveProp('accessibilityLabel', `${title}, ${description}`);
            const text = within(row);
            expect(text.getAllByText(/.+/)).toEqual([text.getByText(title), text.getByText(description)]);
            expect(text.getByText(title)).toHaveProp('numberOfLines', 1);
            expect(text.getByText(description)).toHaveProp('numberOfLines', 2);
        }
        expect(page.queryByText('ENTER')).not.toBeOnTheScreen();
        expect(page.queryByText('ARROWUP')).not.toBeOnTheScreen();
    });

    it('keeps the shortcut rows informational instead of exposing shortcut actions', async () => {
        // Given the loaded reference, where the only action should be the header's back button
        renderPage();
        await screen.findByText(DESCRIPTIONS.at(-1) ?? '');
        const page = within(screen.getByTestId('KeyboardShortcutsPage'));
        const rows = page.getAllByLabelText(/, /);

        // When someone presses each reference row with a real event so an accidental action cannot hide behind a missing event
        for (const row of rows) {
            await userEvent.press(row);
        }
        await waitForBatchedUpdatesWithAct();

        // Then the rows remain readable and enabled without becoming buttons or navigating anywhere
        expect(page.getAllByRole('button')).toEqual([page.getByRole('button', {name: 'Back'})]);
        for (const row of rows) {
            expect(row).not.toHaveProp('role', CONST.ROLE.BUTTON);
            expect(row).toHaveProp('tabIndex', -1);
            expect(row).not.toBeDisabled();
            expect(row).toBeOnTheScreen();
        }
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('updates the reference text and accessible labels when the preferred language changes', async () => {
        // Given a mounted English reference so switching locale must update the actual rows, not a separate test composition
        renderPage();
        await screen.findByText(DESCRIPTIONS.at(-1) ?? '');

        // When the preferred locale changes to a language with longer reference text
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EL);
        });

        // Then the translated last row keeps its title first and its two-line description limit
        const description = el.keyboardShortcutsPage.shortcuts.goToWorkspace;
        expect(await screen.findByLabelText(`CTRL + Shift + P, ${description}`)).toBeOnTheScreen();
        expect(screen.getByText(el.keyboardShortcutsPage.title)).toBeOnTheScreen();
        expect(screen.getByText(description)).toHaveProp('numberOfLines', 2);
        expect(screen.queryByText(DESCRIPTIONS.at(-1) ?? '')).not.toBeOnTheScreen();
        expect(screen.getAllByLabelText(/, /)).toHaveLength(DESCRIPTIONS.length);
    });

    it('returns to the dynamic origin when the real header back button is pressed', async () => {
        // Given the reference was opened from About and the dynamic route helper supplies that origin
        renderPage();
        await screen.findByText(DESCRIPTIONS.at(-1) ?? '');

        // When the user chooses the header action rather than an informational shortcut row
        fireEvent.press(screen.getByRole('button', {name: 'Back'}));

        // Then the page passes its dynamic back path to navigation exactly once
        expect(useDynamicBackPath).toHaveBeenCalledWith(DYNAMIC_ROUTES.KEYBOARD_SHORTCUTS.path);
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_ABOUT);
    });
});
