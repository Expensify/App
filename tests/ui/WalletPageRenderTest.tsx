import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import WalletPage from '@pages/settings/Wallet/WalletPage';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentProps} from 'react';
import type ReactNative from 'react-native';
import type {OnyxKey, OnyxMergeInput} from 'react-native-onyx';

import React, {Profiler} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import {BANK_ACCOUNT_COUNT, CARD_COUNT, FIRST_BANK_ACCOUNT_ID, seedWalletPageOnyx, waitForWalletPageContent, WalletPageProviders} from '../utils/WalletPageTestUtils';

type PaymentMethodListProps = ComponentProps<typeof PaymentMethodList>;
type PaymentMethodListRenderCounts = {bankAccounts: number; assignedCards: number};
type PaymentMethodListMock = {
    default: (props: PaymentMethodListProps) => React.ReactElement | null;
    renderCounts: PaymentMethodListRenderCounts;
};

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

jest.mock('@components/ScreenWrapper', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({children, testID}: {children: React.ReactNode; testID?: string}) => <View testID={testID}>{children}</View>;
});
jest.mock('@components/HeaderWithBackButton', () => () => null);

jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({html}: {html: string}) => <Text>{html.replaceAll(/<[^>]*>/g, '')}</Text>;
});

// Counts how often each of the two PaymentMethodList instances (bank accounts vs assigned cards) renders. The
// wrapper calls the real component as a function so hooks and React Compiler memoization behave as in production.
jest.mock('@pages/settings/Wallet/PaymentMethodList', () => {
    const actual = jest.requireActual<PaymentMethodListMock>('@pages/settings/Wallet/PaymentMethodList');
    const renderCounts: PaymentMethodListRenderCounts = {bankAccounts: 0, assignedCards: 0};
    return {
        __esModule: true,
        renderCounts,
        default: (props: PaymentMethodListProps) => {
            if (props.shouldShowAssignedCards) {
                renderCounts.assignedCards++;
            } else {
                renderCounts.bankAccounts++;
            }
            return actual.default(props);
        },
    };
});

const {renderCounts: paymentMethodListRenderCounts} = jest.requireMock<PaymentMethodListMock>('@pages/settings/Wallet/PaymentMethodList');

type CommitStats = {
    /** Number of React commits inside the WalletPage subtree */
    commits: number;

    /** How many times each PaymentMethodList instance rendered */
    paymentMethodListRenders: PaymentMethodListRenderCounts;
};

// Only commit counts are tracked: Jest's fake timers zero the Profiler durations, and durations are covered by
// tests/perf-test/WalletPage.perf-test.tsx.
let commitCount = 0;

function onRender() {
    commitCount++;
}

function resetCounters() {
    commitCount = 0;
    paymentMethodListRenderCounts.bankAccounts = 0;
    paymentMethodListRenderCounts.assignedCards = 0;
}

function collectStats(): CommitStats {
    return {
        commits: commitCount,
        paymentMethodListRenders: {...paymentMethodListRenderCounts},
    };
}

function ProfiledWalletPage() {
    return (
        <WalletPageProviders>
            <Profiler
                id="WalletPage"
                onRender={onRender}
            >
                <WalletPage />
            </Profiler>
        </WalletPageProviders>
    );
}

async function mergeAndSettle<TKey extends OnyxKey>(key: TKey, value: OnyxMergeInput<TKey>) {
    await act(async () => {
        await Onyx.merge(key, value);
        await waitForBatchedUpdates();
    });
}

/**
 * Mounts the page, waits for it to settle, then runs `action` and returns only the commits it caused.
 */
async function measureAction(action: () => Promise<void>): Promise<CommitStats> {
    render(<ProfiledWalletPage />);
    await waitForWalletPageContent();
    await act(async () => {
        await waitForBatchedUpdates();
    });
    resetCounters();
    await action();
    await act(async () => {
        await waitForBatchedUpdates();
    });
    const stats = collectStats();
    if (process.env.WALLET_PAGE_RENDER_REPORT) {
        process.stdout.write(`[WalletPage render report] ${expect.getState().currentTestName ?? ''} ${JSON.stringify(stats)}\n`);
    }
    return stats;
}

describe('WalletPage re-renders', () => {
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

    it('should mount both payment method lists once the page settles', async () => {
        resetCounters();
        render(<ProfiledWalletPage />);
        await waitForWalletPageContent();
        await act(async () => {
            await waitForBatchedUpdates();
        });
        const stats = collectStats();

        expect(stats.commits).toBeGreaterThan(0);
        expect(stats.paymentMethodListRenders.bankAccounts).toBeGreaterThan(0);
        expect(stats.paymentMethodListRenders.assignedCards).toBeGreaterThan(0);
    });

    it('should not re-render the payment method lists when an unrelated transaction and report change', async () => {
        const stats = await measureAction(async () => {
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {amount: 999});
            await mergeAndSettle(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastMessageText: 'updated'});
        });

        expect(stats).toEqual({commits: 2, paymentMethodListRenders: {bankAccounts: 0, assignedCards: 0}});
    });

    // Both lists subscribe to USER_WALLET themselves (default badge), so one render each is the floor.
    it('should re-render each payment method list only once when the wallet balance changes', async () => {
        const stats = await measureAction(async () => {
            await mergeAndSettle(ONYXKEYS.USER_WALLET, {currentBalance: 54321});
        });

        expect(stats).toEqual({commits: 1, paymentMethodListRenders: {bankAccounts: 1, assignedCards: 1}});
    });

    // Both lists subscribe to BANK_ACCOUNT_LIST themselves, so one render each is the floor.
    it('should re-render each payment method list only once when the bank account list changes', async () => {
        const stats = await measureAction(async () => {
            await mergeAndSettle(ONYXKEYS.BANK_ACCOUNT_LIST, {[String(FIRST_BANK_ACCOUNT_ID)]: {accountData: {addressName: 'Renamed account'}}});
        });

        expect(stats).toEqual({commits: 2, paymentMethodListRenders: {bankAccounts: 1, assignedCards: 1}});
    });

    it('should only re-render the bank accounts list when its three-dots menu opens', async () => {
        const stats = await measureAction(async () => {
            const [firstBankAccountMenuButton] = screen.getAllByLabelText('More');
            fireEvent.press(firstBankAccountMenuButton);
        });

        expect(stats).toEqual({commits: 5, paymentMethodListRenders: {bankAccounts: 1, assignedCards: 0}});
    });

    it('should only re-render the assigned cards list when a card three-dots menu opens', async () => {
        const stats = await measureAction(async () => {
            // Bank account rows come first in the tree, so the first card's menu button follows them.
            const menuButtons = screen.getAllByLabelText('More');
            expect(menuButtons).toHaveLength(BANK_ACCOUNT_COUNT + CARD_COUNT);
            const firstCardMenuButton = menuButtons.at(BANK_ACCOUNT_COUNT);
            if (!firstCardMenuButton) {
                throw new Error('Expected the first assigned card row to render a three-dots menu button');
            }
            fireEvent.press(firstCardMenuButton);
        });

        expect(stats).toEqual({commits: 5, paymentMethodListRenders: {bankAccounts: 0, assignedCards: 1}});
    });
});
