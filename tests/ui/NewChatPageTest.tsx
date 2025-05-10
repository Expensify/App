import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';
import React from 'react';
import {SectionList} from 'react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {translateLocal} from '@libs/Localize';
import NewChatPage from '@pages/NewChatPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');
jest.mock('@src/libs/Navigation/navigationRef');

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxProvider>
        <LocaleContextProvider>
            <OptionsListContextProvider>
                <ScreenWrapper testID="test">{children}</ScreenWrapper>
            </OptionsListContextProvider>
        </LocaleContextProvider>
    </OnyxProvider>
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
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should scroll to top when adding a user to the group selection', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        render(<NewChatPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();
        await act(() => {
            (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
        });
        const spy = jest.spyOn(SectionList.prototype, 'scrollToLocation');

        const addButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (addButton) {
            fireEvent.press(addButton);
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({itemIndex: 0}));
        }
    });

    describe('should not display "Add to group" button on expensify emails', () => {
        const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE && value !== CONST.EMAIL.NOTIFICATIONS).map((email) => [email]);

        it.each(excludedGroupEmails)('%s', async (email) => {
            // Given that a personal details list is initialized in Onyx
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {accountID: 1, login: email},
            });

            // And NewChatPage is opened
            render(<NewChatPage />, {wrapper});
            await waitForBatchedUpdatesWithAct();
            await act(() => {
                (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
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
