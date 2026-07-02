import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import AccountManagerBookCallButton from '@components/AccountManagerBookCallButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {openExternalLink} from '@libs/actions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Link', () => ({
    openExternalLink: jest.fn(),
}));

const mockOpenExternalLink = jest.mocked(openExternalLink);

const CALENDAR_LINK = 'https://calendly.com/account-manager/expensify';
const ACCOUNT_MANAGER_ACCOUNT_ID = '42';

function renderButton(props: {calendarLink: string; accountManagerAccountID?: string}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <AccountManagerBookCallButton
                calendarLink={props.calendarLink}
                accountManagerAccountID={props.accountManagerAccountID}
            />
        </ComposeProviders>,
    );
}

describe('AccountManagerBookCallButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('renders the button and opens the calendar link when pressed', async () => {
        renderButton({calendarLink: CALENDAR_LINK});
        await waitForBatchedUpdatesWithAct();

        const button = screen.getByText(translateLocal('videoChatButtonAndMenu.tooltip'));
        expect(button).toBeOnTheScreen();

        fireEvent.press(button);
        expect(mockOpenExternalLink).toHaveBeenCalledWith(CALENDAR_LINK);
    });

    it('renders nothing when there is no calendar link', async () => {
        renderButton({calendarLink: ''});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(translateLocal('videoChatButtonAndMenu.tooltip'))).not.toBeOnTheScreen();
    });

    it('renders the account manager avatar variant when an account ID is provided', async () => {
        renderButton({calendarLink: CALENDAR_LINK, accountManagerAccountID: ACCOUNT_MANAGER_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();

        const button = screen.getByText(translateLocal('videoChatButtonAndMenu.tooltip'));
        expect(button).toBeOnTheScreen();

        fireEvent.press(button);
        expect(mockOpenExternalLink).toHaveBeenCalledWith(CALENDAR_LINK);
    });
});
