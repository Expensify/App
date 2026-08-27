import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import Navigation from '@libs/Navigation/Navigation';

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
// Use the web (passthrough) variant; the .native one has an in-flight guard that swallows the rapid re-presses.
jest.mock('@hooks/useSingleExecution', (): unknown => jest.requireActual('@hooks/useSingleExecution/index.ts'));
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

const {triggerTransitionEnd} = jest.requireMock<NativeNavigationMock>('@react-navigation/native');

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <CurrentUserPersonalDetailsProvider>
            <HTMLEngineProvider>
                <LocaleContextProvider>
                    <ScreenWrapper testID="test">{children}</ScreenWrapper>
                </LocaleContextProvider>
            </HTMLEngineProvider>
        </CurrentUserPersonalDetailsProvider>
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

    it('should toggle selection correctly via the row checkbox with the deferred selection update', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        // Enter group-selection mode by selecting one user.
        const addButton = await waitFor(() => {
            const button = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
            expect(button).toBeTruthy();
            return button;
        });
        if (!addButton) {
            return;
        }
        fireEvent.press(addButton);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(translateLocal('common.next'))).toBeVisible();

        // Uncheck the selected row's checkbox; deferring the update must still unselect and exit group mode.
        const checkedCheckbox = screen.getAllByTestId(new RegExp(`^${CONST.SELECTION_BUTTON_TEST_ID}`)).at(0);
        expect(checkedCheckbox).toBeTruthy();
        if (!checkedCheckbox) {
            return;
        }
        fireEvent.press(checkedCheckbox);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(translateLocal('common.next'))).toBeNull();
        expect(screen.queryAllByTestId(new RegExp(`^${CONST.SELECTION_BUTTON_TEST_ID}`))).toHaveLength(0);

        // And selecting again from the empty state still works.
        const buttonAfter = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (buttonAfter) {
            fireEvent.press(buttonAfter);
        }
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(translateLocal('common.next'))).toBeVisible();
    });

    it('should keep the user selected when the still-visible "Add to group" button is pressed twice before the deferred update commits', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        const addButton = await waitFor(() => {
            const button = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
            expect(button).toBeTruthy();
            return button;
        });
        if (!addButton) {
            return;
        }

        // One act() batch so nothing commits between the presses: the second hits the same Add button (double-tap).
        // eslint-disable-next-line testing-library/no-unnecessary-act -- the shared act batch is the point: it keeps the deferred update from committing between the two presses
        act(() => {
            fireEvent.press(addButton);
            fireEvent.press(addButton);
        });
        await waitForBatchedUpdatesWithAct();

        // The retry press must stay an add (idempotent), not silently cancel the pending one.
        expect(screen.getByText(translateLocal('common.next'))).toBeVisible();
        expect(screen.getAllByTestId(new RegExp(`^${CONST.SELECTION_BUTTON_TEST_ID}`))).toHaveLength(1);
    });

    it('should not open the group confirmation when the last member was removed just before pressing Next', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'email1@test.com'});
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        // Enter group-selection mode by selecting one user.
        const addButton = await waitFor(() => {
            const button = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
            expect(button).toBeTruthy();
            return button;
        });
        if (!addButton) {
            return;
        }
        fireEvent.press(addButton);
        await waitForBatchedUpdatesWithAct();
        const nextButton = screen.getByText(translateLocal('common.next'));
        expect(nextButton).toBeVisible();

        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        const checkedCheckbox = screen.getAllByTestId(new RegExp(`^${CONST.SELECTION_BUTTON_TEST_ID}`)).at(0);
        expect(checkedCheckbox).toBeTruthy();
        if (!checkedCheckbox) {
            return;
        }

        // One act() batch so nothing commits between the presses: Next is still shown after removing the last member.
        // eslint-disable-next-line testing-library/no-unnecessary-act -- the shared act batch is the point: it keeps the deferred update from committing between the two presses
        act(() => {
            fireEvent.press(checkedCheckbox);
            fireEvent.press(nextButton);
        });
        expect(navigateSpy).not.toHaveBeenCalled();

        // Once the deferred update commits the removal, group-selection mode is exited.
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(translateLocal('common.next'))).toBeNull();
        expect(navigateSpy).not.toHaveBeenCalled();
        navigateSpy.mockRestore();
    });

    it('should add a row-pressed user to the group instead of opening a 1:1 chat when the row is pressed before the deferred selection commits', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'email1@test.com'});
        });
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => {
            triggerTransitionEnd();
        });

        // Wait for more than one selectable user so we have a first to add and a second row to press.
        await waitFor(() => {
            expect(screen.getAllByText(translateLocal('newChatPage.addToGroup')).length).toBeGreaterThan(1);
        });

        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const dismissModalSpy = jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});

        // The Add button is the first user's; the rows map to each user in order.
        const addButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        const secondRow = screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`)).at(1);
        expect(addButton).toBeTruthy();
        expect(secondRow).toBeTruthy();
        if (!addButton || !secondRow) {
            return;
        }

        // One act() batch so nothing commits between the presses: the second row is pressed while selectedOptions is
        // still empty and only the ref holds the first member, so selectOption must add it, not open a 1:1 chat.
        // eslint-disable-next-line testing-library/no-unnecessary-act -- the shared act batch is the point: it keeps the deferred update from committing between the two presses
        act(() => {
            fireEvent.press(addButton);
            fireEvent.press(secondRow);
        });
        await waitForBatchedUpdatesWithAct();

        // Both users are selected (two checkboxes) and no 1:1 chat navigation happened.
        expect(screen.getByText(translateLocal('common.next'))).toBeVisible();
        expect(screen.getAllByTestId(new RegExp(`^${CONST.SELECTION_BUTTON_TEST_ID}`))).toHaveLength(2);
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(dismissModalSpy).not.toHaveBeenCalled();
        navigateSpy.mockRestore();
        dismissModalSpy.mockRestore();
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
