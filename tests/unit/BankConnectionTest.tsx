import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import useCardFeeds from '@hooks/useCardFeeds';

import Navigation from '@libs/Navigation/Navigation';

import type * as BankConnectionModule from '@pages/workspace/companyCards/BankConnection/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Popups opened in the current test only
const mockPopups: Array<{close: jest.Mock}> = [];
const mockOpenBankConnection = jest.fn(() => {
    const popup = {close: jest.fn()};
    mockPopups.push(popup);
    return popup;
});

jest.mock('@pages/workspace/companyCards/BankConnection/openBankConnection', () => ({
    __esModule: true,
    default: mockOpenBankConnection,
}));

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// New function each render, like a cardFeedErrors recompute, so every render reruns the effect
jest.mock('@hooks/useUpdateFeedBrokenConnection', () => ({
    __esModule: true,
    default: () => ({updateBrokenConnection: () => {}, isFeedConnectionBroken: false}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

// Jest resolves the folder to index.native.tsx, and the popup logic is web-only
const BankConnection = jest.requireActual<typeof BankConnectionModule>('@pages/workspace/companyCards/BankConnection/index.tsx').default;

const mockUseCardFeeds = jest.mocked(useCardFeeds);
const mockCloseRHPFlow = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
const FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE}#99999` as const;
const NOW = Math.floor(Date.now() / 1000);
const EXPIRED = NOW - CONST.DATE.SECONDS_PER_DAY;
const VALID = NOW + CONST.DATE.SECONDS_PER_DAY;
const RENEWED = VALID + CONST.DATE.SECONDS_PER_DAY;

function mockFeedExpiration(expiration: number) {
    mockUseCardFeeds.mockReturnValue([
        {[FEED]: {feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE, accountList: ['card'], credentials: '', expiration}},
        {status: 'loaded'},
        undefined,
        {},
        0,
    ]);
}

function getBankConnection() {
    return (
        <BankConnection
            policyID="policy1"
            feed={FEED}
        />
    );
}

function getPopupCloseCount() {
    return mockPopups.reduce((count, popup) => count + popup.close.mock.calls.length, 0);
}

describe('BankConnection (web)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockPopups.length = 0;
    });

    it.each([
        {description: 'a healthy feed refresh rerenders mid-login', expiration: VALID, isRefreshing: true, nextExpiration: VALID, openCount: 1, closeCount: 0, shouldCloseRHP: false},
        {description: 'a healthy feed refresh completes', expiration: VALID, isRefreshing: true, nextExpiration: RENEWED, openCount: 1, closeCount: 1, shouldCloseRHP: false},
        {description: 'an expired feed refresh completes', expiration: EXPIRED, isRefreshing: true, nextExpiration: VALID, openCount: 1, closeCount: 1, shouldCloseRHP: false},
        {description: 'an expired feed reconnect rerenders mid-login', expiration: EXPIRED, isRefreshing: false, nextExpiration: EXPIRED, openCount: 1, closeCount: 0, shouldCloseRHP: false},
        {description: 'an expired feed reconnect completes', expiration: EXPIRED, isRefreshing: false, nextExpiration: VALID, openCount: 1, closeCount: 1, shouldCloseRHP: true},
        {description: 'a healthy feed is opened outside a refresh', expiration: VALID, isRefreshing: false, nextExpiration: VALID, openCount: 0, closeCount: 0, shouldCloseRHP: true},
    ])('when $description', async ({expiration, isRefreshing, nextExpiration, openCount, closeCount, shouldCloseRHP}) => {
        // Given the bank connection step with the feed at its initial expiration
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION, isRefreshing});
        mockFeedExpiration(expiration);
        const {rerender} = render(getBankConnection());

        // When it rerenders mid-login or after the login updates the expiration
        mockFeedExpiration(nextExpiration);
        rerender(getBankConnection());

        // Then the popup opens once and closes only when the login completes, and the panel closes only outside a refresh
        expect(mockOpenBankConnection).toHaveBeenCalledTimes(openCount);
        expect(getPopupCloseCount()).toBe(closeCount);
        expect(mockCloseRHPFlow.mock.calls.length > 0).toBe(shouldCloseRHP);
    });

    it('opens the bank popup again when the admin presses the retry link', async () => {
        // Given a refresh whose popup auto-opened
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION, isRefreshing: true});
        mockFeedExpiration(VALID);
        render(getBankConnection());

        // When the admin presses the retry link
        fireEvent.press(screen.getByText('workspace.moreFeatures.companyCards.pendingBankLink'), {preventDefault: jest.fn()});

        // Then the popup opens again
        expect(mockOpenBankConnection).toHaveBeenCalledTimes(2);
    });
});
