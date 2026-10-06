import {act, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';

import DisablePage from '@pages/settings/Security/TwoFactorAuth/DisablePage';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: (callback: () => void) => {
            callback();
        },
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn(() => Promise.resolve({action: 'cancel'}))}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

// The wrapper only adds the screen chrome (header, offline and not-found views), which needs a navigator to render.
jest.mock('@pages/settings/Security/TwoFactorAuth/TwoFactorAuthWrapper', () => ({
    __esModule: true,
    default: ({children}: ChildrenProps) => children,
}));

const INVALID_CODE_ERROR = 'Invalid code';

const renderPage = () =>
    render(
        <OnyxListItemProvider>
            <DisablePage />
        </OnyxListItemProvider>,
    );

describe('DisablePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('clears a stale account error when the page opens', async () => {
        // Given a previous attempt to disable 2FA left an "Invalid code" error in the persisted account data
        await Onyx.set(ONYXKEYS.ACCOUNT, {
            requiresTwoFactorAuth: true,
            errors: getMicroSecondOnyxErrorWithMessage(INVALID_CODE_ERROR),
        });
        await waitForBatchedUpdates();

        // When the user opens the Disable 2FA page again
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the stale error is cleared from Onyx and is not shown on the page
        const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
        expect(account?.errors).toBeUndefined();
        expect(screen.queryByText(INVALID_CODE_ERROR)).toBeNull();
    });

    it('clears the account error when the page closes', async () => {
        // Given the Disable 2FA page is open
        await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await waitForBatchedUpdates();
        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        // And the server returned an "Invalid code" error for the code the user entered
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {errors: getMicroSecondOnyxErrorWithMessage(INVALID_CODE_ERROR)});
        });
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(INVALID_CODE_ERROR)).toBeTruthy();

        // When the user closes the page
        unmount();
        await waitForBatchedUpdates();

        // Then the error is cleared so it does not come back when the page opens again
        const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
        expect(account?.errors).toBeUndefined();
    });
});
