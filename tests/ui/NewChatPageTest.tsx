import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import NewChatPage from '@pages/NewChatPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports -- ScrollView is imported directly to spy on its prototype in tests
import {ScrollView} from 'react-native';
import Onyx from 'react-native-onyx';

import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';

import {fakePersonalDetails} from '../utils/LHNTestUtils';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');
jest.mock('@src/libs/Navigation/navigationRef');
jest.mock('react-native-permissions', () => ({
    __esModule: true,
    RESULTS: {
        UNAVAILABLE: 'unavailable',
        GRANTED: 'granted',
        LIMITED: 'limited',
        DENIED: 'denied',
        BLOCKED: 'blocked',
    },
    check: jest.fn(() => Promise.resolve('unavailable')),
    request: jest.fn(() => Promise.resolve('unavailable')),
    PERMISSIONS: {
        IOS: {
            CONTACTS: 'ios.permission.CONTACTS',
        },
        ANDROID: {
            READ_CONTACTS: 'android.permission.READ_CONTACTS',
        },
    },
}));

const triggerTransitionEnd = () => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <HTMLEngineProvider>
            <LocaleContextProvider>
                <ScreenWrapper testID="test">{children}</ScreenWrapper>
            </LocaleContextProvider>
        </HTMLEngineProvider>
    </OnyxListItemProvider>
);

describe('NewChatPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should not auto-scroll when adding a user to the group selection', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });
        const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo');
        const addButton = await waitFor(() => screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0));
        if (addButton) {
            fireEvent.press(addButton);
            expect(scrollToSpy).not.toHaveBeenCalled();
        }
    });

    it('should not move a selected user to the top of the list', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        const getRenderedNames = () => screen.getAllByText(/^Email /).map((node) => String(node.props.children));

        // Wait until the contacts list has rendered more than one selectable user.
        const namesBefore = await waitFor(() => {
            const names = getRenderedNames();
            expect(names.length).toBeGreaterThan(2);
            return names;
        });

        // Select a user that is not first in the list by pressing its "Add to group" button.
        const addButtons = screen.getAllByText(translateLocal('newChatPage.addToGroup'));
        const targetIndex = 2;
        const targetName = namesBefore.at(targetIndex);
        const targetButton = addButtons.at(targetIndex);
        if (targetButton) {
            fireEvent.press(targetButton);
        }
        await waitForBatchedUpdatesWithAct();

        // The selected user should stay in place rather than jumping to the top of the list.
        const namesAfter = getRenderedNames();
        expect(namesAfter.at(0)).toBe(namesBefore.at(0));
        expect(namesAfter.indexOf(targetName ?? '')).toBe(targetIndex);
    });

    it('should keep a selected non-existing user visible in the top section after the search is cleared', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        const invitedEmail = 'nonexistinguser@example.com';

        // Search for a user that doesn't exist yet so the invite option is generated.
        const input = screen.getByTestId('selection-list-text-input');
        fireEvent.changeText(input, invitedEmail);

        // Wait for the invite row to appear — this confirms the debounce has fired and regular
        // contacts are filtered out, so the only "Add to group" button is the invite row's.
        await waitFor(() => {
            expect(screen.getAllByText(invitedEmail).length).toBeGreaterThan(0);
        });

        // Select the invite option via its "Add to group" button.
        const addButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (addButton) {
            fireEvent.press(addButton);
        }
        await waitForBatchedUpdatesWithAct();

        // Clear the search. The regular contacts reappearing confirms the debounced search has settled and the invite row is gone.
        fireEvent.changeText(input, '');
        await waitFor(() => {
            expect(screen.getAllByText(/^Email /).length).toBeGreaterThan(2);
        });

        // The selected non-existing user has no row in recents/contacts, so it must remain visible in the top section.
        await waitFor(() => {
            expect(screen.getAllByText(invitedEmail).length).toBeGreaterThan(0);
        });
    });

    it('should not auto-scroll when selecting multiple users in sequence', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo');

        // Wait until more than one selectable user is rendered.
        await waitFor(() => {
            expect(screen.getAllByText(translateLocal('newChatPage.addToGroup')).length).toBeGreaterThan(2);
        });

        // Select two users one after another. The viewport must stay put between selections so multi-selection isn't interrupted.
        const firstButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (firstButton) {
            fireEvent.press(firstButton);
        }
        await waitForBatchedUpdatesWithAct();

        const secondButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (secondButton) {
            fireEvent.press(secondButton);
        }
        await waitForBatchedUpdatesWithAct();

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    describe('should not display "Add to group" button on expensify emails', () => {
        const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE && value !== CONST.EMAIL.NOTIFICATIONS).map((email) => [email]);

        it.each(excludedGroupEmails)('%s', async (email) => {
            // Given that a personal details list is initialized in Onyx
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {accountID: 1, login: email},
                });
            });

            // And NewChatPage is opened
            render(<NewChatPage />, {wrapper});
            await waitForBatchedUpdatesWithAct();
            act(() => {
                triggerTransitionEnd();
            });

            // And email is entered into the search input
            const input = screen.getByTestId('selection-list-text-input');
            fireEvent.changeText(input, email);

            // And waited for the user option to appear
            await waitFor(() => {
                expect(screen.getByLabelText(email)).toBeOnTheScreen();
            });

            // Then "Add to group" button should not appear
            const userOption = screen.getByLabelText(email);
            const addButton = within(userOption).queryByText(translateLocal('newChatPage.addToGroup'));
            expect(addButton).not.toBeOnTheScreen();
        });
    });
});
