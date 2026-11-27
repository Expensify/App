import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import AccountAvatarButton from '@components/Navigation/AccountAvatarButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseAccountTabIndicatorStatus = jest.fn();

jest.mock('@hooks/useResponsiveLayout', () => (): {shouldUseNarrowLayout: boolean} => ({shouldUseNarrowLayout: true}));
jest.mock('@hooks/useAccountTabIndicatorStatus', () => () => mockUseAccountTabIndicatorStatus() as unknown);
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => ({shouldShowProductTrainingTooltip: false, renderProductTrainingTooltip: () => null, hideProductTrainingTooltip: jest.fn()}),
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({key: 'Home', name: 'Home'}),
    };
});

function renderButton() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <AccountAvatarButton />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('AccountAvatarButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('names the button "Account" without trailing punctuation when nothing needs review', async () => {
        // Given an account with no pending item to review
        mockUseAccountTabIndicatorStatus.mockReturnValue({indicatorColor: undefined, status: undefined});

        // When the narrow layout renders the account avatar
        renderButton();
        await waitForBatchedUpdatesWithAct();

        // Then a screen reader reads just the tab name, with no stray period after it
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('initialSettingsPage.account')})).toBeOnTheScreen();
    });

    it('adds the review notice to the name when something needs review', async () => {
        // Given an account with an item that needs the user's attention
        mockUseAccountTabIndicatorStatus.mockReturnValue({indicatorColor: 'red', status: CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS});

        // When the narrow layout renders the account avatar
        renderButton();
        await waitForBatchedUpdatesWithAct();

        // Then a screen reader hears the same notice the navigation tabs announce
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: `${translateLocal('initialSettingsPage.account')}. ${translateLocal('common.yourReviewIsRequired')}`})).toBeOnTheScreen();
    });
});
