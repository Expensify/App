import {act, cleanup, render, screen} from '@testing-library/react-native';

import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import PlaidConnectionStep from '@pages/workspace/companyCards/addNew/PlaidConnectionStep';

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
jest.mock('@userActions/CompanyCards', () => ({
    setAddNewCompanyCardStepAndData: jest.fn(),
    setAssignCardStepAndData: jest.fn(),
}));

const readSpy = jest.mocked(API.read);
const TOO_MANY_ATTEMPTS_KEY = 'bankAccount.error.tooManyAttempts';
const STALE_ERROR_TIMESTAMP = '1700000000000';
const STALE_THROTTLE_ERROR = {[STALE_ERROR_TIMESTAMP]: 'Sorry, you have attempted this action too many times in a short period. Please try again later, thanks!'};

describe('PlaidConnectionStep (company cards)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data: {selectedCountry: CONST.COUNTRY.US}});
        });
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
                [ONYXKEYS.IS_PLAID_DISABLED]: true,
                [ONYXKEYS.PLAID_DATA]: {...CONST.PLAID.DEFAULT_DATA, errors: STALE_THROTTLE_ERROR},
            });
        });

        // When the user enters the Plaid step again
        render(<PlaidConnectionStep />);
        await waitForBatchedUpdatesWithAct();

        // Then the step asks the server for a fresh link token and throttle state
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN, expect.objectContaining({country: CONST.COUNTRY.US}), expect.anything());

        // And the saved throttle message is not shown while the server has not answered
        expect(screen.queryByText(TOO_MANY_ATTEMPTS_KEY)).toBeNull();
    });

    it('shows the throttle message once the server reports the account as blocked', async () => {
        // Given the user entered the Plaid step with no saved throttle state
        render(<PlaidConnectionStep />);
        await waitForBatchedUpdatesWithAct();
        expect(readSpy).toHaveBeenCalledTimes(1);

        // When the server answers a credential submission with the throttle error
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.IS_PLAID_DISABLED]: true,
                [ONYXKEYS.PLAID_DATA]: {...CONST.PLAID.DEFAULT_DATA, errors: STALE_THROTTLE_ERROR},
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the throttle message is shown and the step does not request another token
        expect(screen.getByText(TOO_MANY_ATTEMPTS_KEY)).toBeTruthy();
        expect(readSpy).toHaveBeenCalledTimes(1);
    });

    it('requests a link token even when a bank account flow left Plaid accounts in Onyx', async () => {
        // Given plaidData still lists the accounts selected in an earlier bank account flow
        await act(async () => {
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                ...CONST.PLAID.DEFAULT_DATA,
                bankAccounts: [
                    {
                        accountNumber: '1111',
                        addressName: 'Checking',
                        isSavings: false,
                        mask: '1111',
                        plaidAccountID: 'plaid-account-1',
                        plaidAccessToken: 'token',
                        routingNumber: '011401533',
                    },
                ],
            });
        });

        // When the user enters the company card Plaid step
        render(<PlaidConnectionStep />);
        await waitForBatchedUpdatesWithAct();

        // Then the step still requests a company card link token
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN, expect.anything(), expect.anything());
    });
});
