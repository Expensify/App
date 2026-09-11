import {act, fireEvent, render, screen} from '@testing-library/react-native';

import WalletPage from '@pages/settings/Wallet/WalletPage';

import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';
import type {OnyxKey, OnyxMergeInput} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureRenders} from 'reassure';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import {BANK_ACCOUNT_COUNT, FIRST_BANK_ACCOUNT_ID, seedWalletPageOnyx, waitForWalletPageContent, WalletPageProviders} from '../utils/WalletPageTestUtils';

jest.mock('@react-navigation/native');

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    isActiveRoute: jest.fn(() => false),
    getTopmostReportId: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

// The page shell (ScreenWrapper + header) needs a navigator; it is not part of what this test measures.
jest.mock('@components/ScreenWrapper', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({children, testID}: {children: React.ReactNode; testID?: string}) => <View testID={testID}>{children}</View>;
});
jest.mock('@components/HeaderWithBackButton', () => () => null);

// RenderHTML needs a TRenderEngineProvider that only the app root mounts.
jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({html}: {html: string}) => <Text>{html.replaceAll(/<[^>]*>/g, '')}</Text>;
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
    }),
);

beforeEach(async () => {
    await seedWalletPageOnyx();
});

afterEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

function WalletPageWrapper() {
    return (
        <WalletPageProviders>
            <WalletPage />
        </WalletPageProviders>
    );
}

async function mergeAndSettle<TKey extends OnyxKey>(key: TKey, value: OnyxMergeInput<TKey>) {
    await act(async () => {
        await Onyx.merge(key, value);
        await waitForBatchedUpdates();
    });
}

describe('[WalletPage] mount + action', () => {
    test('should render bank accounts, assigned cards and wallet sections', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });

    test('should open the three-dots menu of a bank account', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
            const [firstBankAccountMenuButton] = screen.getAllByLabelText('More');
            fireEvent.press(firstBankAccountMenuButton);
            await waitForBatchedUpdates();
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });

    test('should open the three-dots menu of an assigned card', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
            // Bank account rows come first in the tree, so the first card's menu button follows them.
            const firstCardMenuButton = screen.getAllByLabelText('More').at(BANK_ACCOUNT_COUNT);
            if (!firstCardMenuButton) {
                throw new Error('Expected the first assigned card row to render a three-dots menu button');
            }
            fireEvent.press(firstCardMenuButton);
            await waitForBatchedUpdates();
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });

    test('should handle an unrelated transaction update', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {amount: 999});
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastMessageText: 'updated'});
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });

    test('should handle a wallet balance update', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
            await mergeAndSettle(ONYXKEYS.USER_WALLET, {currentBalance: 54321});
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });

    test('should handle a bank account list update', async () => {
        const scenario = async () => {
            await waitForWalletPageContent();
            await mergeAndSettle(ONYXKEYS.BANK_ACCOUNT_LIST, {[String(FIRST_BANK_ACCOUNT_ID)]: {accountData: {addressName: 'Renamed account'}}});
        };
        await measureRenders(<WalletPageWrapper />, {scenario});
    });
});

// The measureRenders numbers above are dominated by the initial mount. These time only the update itself on an
// already-mounted page, which is where isolating Onyx subscriptions and local state per section pays off.
describe('[WalletPage] update on mounted page', () => {
    let updateIndex = 0;

    beforeEach(async () => {
        updateIndex = 0;
        render(<WalletPageWrapper />);
        await waitForWalletPageContent();
    });

    test('should re-render after an unrelated transaction and report update', async () => {
        await measureAsyncFunction(async () => {
            updateIndex++;
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.TRANSACTION}${updateIndex}`, {amount: updateIndex});
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.REPORT}${updateIndex}`, {lastMessageText: `updated ${updateIndex}`});
        });
    });

    test('should re-render after a wallet balance update', async () => {
        await measureAsyncFunction(async () => {
            updateIndex++;
            await mergeAndSettle(ONYXKEYS.USER_WALLET, {currentBalance: 10000 + updateIndex});
        });
    });

    test('should re-render after a bank account list update', async () => {
        await measureAsyncFunction(async () => {
            updateIndex++;
            await mergeAndSettle(ONYXKEYS.BANK_ACCOUNT_LIST, {[String(FIRST_BANK_ACCOUNT_ID)]: {accountData: {addressName: `Renamed account ${updateIndex}`}}});
        });
    });

    test('should re-render after a workspace update', async () => {
        await measureAsyncFunction(async () => {
            updateIndex++;
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.POLICY}1`, {name: `Workspace ${updateIndex}`});
        });
    });
});
