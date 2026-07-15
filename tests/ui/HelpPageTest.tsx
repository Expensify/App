import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {openExternalLink} from '@libs/actions/Link';

import HelpPage from '@pages/settings/HelpPage/HelpPage';

import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/actions/Help', () => ({openHelpPage: jest.fn()}));
jest.mock('@libs/actions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('@hooks/useOpenConciergeAnywhere', () => () => ({openConciergeAnywhere: jest.fn()}));
jest.mock('@hooks/useIsPaidPolicyAdmin', () => () => true);
jest.mock('@hooks/useCurrentUserPersonalDetails');

const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockOpenExternalLink = jest.mocked(openExternalLink);

const ACCOUNT_MANAGER_ACCOUNT_ID = 42;
const ACCOUNT_MANAGER_NAME = 'Account Manager';
const CALENDAR_LINK = 'https://calendly.com/account-manager/expensify';

describe('HelpPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    function renderPage() {
        return render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <HelpPage />
                </ComposeProviders>
            </NavigationContainer>,
        );
    }

    it('shows the Book a call button on the account manager row and opens the calendar link when pressed', async () => {
        // Given an account manager with a calendar link
        await Onyx.merge(ONYXKEYS.ACCOUNT, {accountManagerAccountID: String(ACCOUNT_MANAGER_ACCOUNT_ID), accountManagerCalendarLink: CALENDAR_LINK});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_MANAGER_ACCOUNT_ID]: {accountID: ACCOUNT_MANAGER_ACCOUNT_ID, login: 'am@example.com', displayName: ACCOUNT_MANAGER_NAME}});
        await waitForBatchedUpdates();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the nested Book a call button is shown
        const bookCallButton = screen.getByText(translateLocal('videoChatButtonAndMenu.tooltip'));
        expect(bookCallButton).toBeOnTheScreen();

        // And pressing it opens the account manager's calendar link
        fireEvent.press(bookCallButton);
        expect(mockOpenExternalLink).toHaveBeenCalledWith(CALENDAR_LINK);
    });
});
