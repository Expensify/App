import {act, cleanup, render, screen} from '@testing-library/react-native';

import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import PlaidConnectionStep from '@pages/settings/Wallet/PersonalCards/steps/PlaidConnectionStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The real API layer applies optimisticData before the request is sent, so the mock has to do the same for the
// component to observe the optimistic state. The server response is never simulated here.
jest.mock('@libs/API', () => ({
    read: jest.fn((_command: string, _params: unknown, onyxData?: OnyxData<OnyxKey>) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {default: OnyxInstance} = require('react-native-onyx');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        OnyxInstance.update(onyxData?.optimisticData ?? []);
    }),
    write: jest.fn(),
}));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(),
    },
}));
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/PlaidLink', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/getPlaidOAuthReceivedRedirectURI', () => jest.fn(() => undefined));
jest.mock('@libs/KeyboardShortcut', () => ({
    __esModule: true,
    default: {subscribe: jest.fn(() => jest.fn())},
}));
jest.mock('@navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@userActions/App', () => ({handleRestrictedEvent: jest.fn()}));
jest.mock('@userActions/BankAccounts', () => ({setPlaidEvent: jest.fn()}));
jest.mock('@libs/actions/PersonalCards', () => ({setAddNewPersonalCardStepAndData: jest.fn()}));

const readSpy = jest.mocked(API.read);
const STALE_ERROR_TIMESTAMP = '1700000000000';

describe('PlaidConnectionStep (personal cards)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('re-checks with the server instead of trusting a throttle error saved by an earlier attempt', async () => {
        // Given the browser still holds the throttle state persisted by a throttled attempt on a previous day
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.ADD_NEW_PERSONAL_CARD]: {data: {selectedCountry: CONST.COUNTRY.US}},
                [ONYXKEYS.IS_PLAID_DISABLED]: true,
                [ONYXKEYS.PLAID_DATA]: {...CONST.PLAID.DEFAULT_DATA, errors: {[STALE_ERROR_TIMESTAMP]: 'Sorry, you have attempted this action too many times in a short period.'}},
            });
        });

        // When the user enters the personal card Plaid step again
        render(<PlaidConnectionStep />);
        await waitForBatchedUpdatesWithAct();

        // Then the step asks the server for a fresh personal card link token
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN, expect.objectContaining({country: CONST.COUNTRY.US, isPersonal: true}), expect.anything());

        // And the saved throttle message is not shown while the server has not answered
        expect(screen.queryByText('bankAccount.error.tooManyAttempts')).toBeNull();
    });
});
