import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import NewChatConfirmPage from '@pages/NewChatConfirmPage';

import ONYXKEYS from '@src/ONYXKEYS';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');
jest.mock('@src/libs/Navigation/navigationRef');

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'current@test.com';
const OPTIMISTIC_ACCOUNT_ID = 999;
const REAL_ACCOUNT_ID = 12345;
const PHONE_NUMBER = '+15005550006';
const RECIPIENT_NAME = 'Phone Recipient';

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <CurrentUserPersonalDetailsProvider>
            <HTMLEngineProvider>
                <LocaleContextProvider>{children}</LocaleContextProvider>
            </HTMLEngineProvider>
        </CurrentUserPersonalDetailsProvider>
    </OnyxListItemProvider>
);

describe('NewChatConfirmPage', () => {
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

    it('removes a recipient created offline after their optimistic accountID is replaced', async () => {
        // Given a group draft that still holds the recipient's optimistic accountID and the phone number as typed in search,
        // and personal details that only hold the real account, whose login has the SMS domain
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Current User'},
                [REAL_ACCOUNT_ID]: {accountID: REAL_ACCOUNT_ID, login: `${PHONE_NUMBER}@expensify.sms`, displayName: RECIPIENT_NAME},
            });
            await Onyx.set(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {
                participants: [
                    {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN},
                    {accountID: OPTIMISTIC_ACCOUNT_ID, login: PHONE_NUMBER},
                ],
            });
        });
        render(<NewChatConfirmPage />, {wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the user presses the recipient's row, which shows the real account
        fireEvent.press(await screen.findByText(RECIPIENT_NAME));
        await waitForBatchedUpdatesWithAct();

        // Then the draft drops the recipient, because the row still matches the login saved in the draft
        await waitFor(async () => {
            const draft = await getOnyxValue(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
            expect(draft?.participants).toEqual([{accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN}]);
        });
    });
});
