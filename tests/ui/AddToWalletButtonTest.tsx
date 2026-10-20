import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AddToWalletButton from '@components/AddToWalletButton';
import AddToWalletStatusText from '@components/AddToWalletButton/AddToWalletStatusText';

import {isCardInWallet as isCardInGoogleWallet} from '@libs/Wallet/index.android';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';
import type {AppStateStatus, View as ViewType} from 'react-native';

import {addCardToAppleWallet, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';
import React from 'react';
import {AppState} from 'react-native';

import {createRandomExpensifyCard} from '../utils/collections/card';
import createMock from '../utils/createMock';

jest.mock('@expensify/react-native-wallet', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return {
        AddToWalletButton: ({onPress}: {onPress: () => void}) => (
            <View
                testID="add-to-wallet-button"
                accessibilityRole="button"
                onTouchEnd={onPress}
            />
        ),
        checkWalletAvailability: jest.fn(() => Promise.resolve(true)),
        getCardStatusByIdentifier: jest.fn(),
        getCardStatusBySuffix: jest.fn(),
        addCardToAppleWallet: jest.fn(),
    };
});

jest.mock('@components/ActivityIndicator', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return () => <View testID="add-to-wallet-spinner" />;
});

jest.mock('@libs/actions/Wallet', () => ({issuerEncryptPayloadCallback: jest.fn()}));
jest.mock('@libs/actions/PaymentMethods', () => ({getPaymentMethods: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Render the raw translation keys so assertions don't depend on the copy.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

const mockGetCardStatus = jest.mocked(getCardStatusByIdentifier);
const mockAddCardToAppleWallet = jest.mocked(addCardToAppleWallet);
const mockGetCardStatusBySuffix = jest.mocked(getCardStatusBySuffix);

const card: Card = {
    ...createRandomExpensifyCard(1234, {state: CONST.EXPENSIFY_CARD.STATE.OPEN}),
    lastFourPAN: '3845',
    token: 'token',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    nameValuePairs: createMock<NonNullable<Card['nameValuePairs']>>({expensifyCard_panReferenceID: 'panReferenceID'}),
};

let addEventListenerSpy: jest.SpiedFunction<typeof AppState.addEventListener>;

function renderCardWalletSection() {
    return render(
        <>
            <AddToWalletButton
                card={card}
                cardHolderName="Card Holder"
                cardDescription="Expensify Card"
            />
            <AddToWalletStatusText card={card} />
        </>,
    );
}

/** Simulates the app returning to the foreground, e.g. after the native wallet sheet closes. */
function bringAppToForeground() {
    for (const [event, listener] of addEventListenerSpy.mock.calls) {
        if (event === 'change') {
            (listener as (state: AppStateStatus) => void)('active');
        }
    }
}

describe('AddToWalletButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    });

    it.each<CardStatus>(['requireActivation', 'pending'])('hides the button and shows the added status when the wallet pass is "%s"', async (status) => {
        // Given a card whose pass is in the wallet but still waits for issuer verification (yellow path / "Verify later")
        mockGetCardStatus.mockResolvedValue(status);

        // When the card page renders
        renderCardWalletSection();

        // Then the user is not offered to add the card again, which would fail with "already in wallet"
        expect(await screen.findByText('cardPage.cardAddedToWallet')).toBeOnTheScreen();
        expect(screen.queryByTestId('add-to-wallet-button')).not.toBeOnTheScreen();
    });

    it('shows the button when the card is not in the wallet', async () => {
        // Given a card that has never been added to the wallet
        mockGetCardStatus.mockResolvedValue('not found');

        // When the card page renders
        renderCardWalletSection();

        // Then the user can add the card
        expect(await screen.findByTestId('add-to-wallet-button')).toBeOnTheScreen();
        expect(screen.queryByText('cardPage.cardAddedToWallet')).not.toBeOnTheScreen();
    });

    it('brings the button back instead of a spinner when the wallet does not report the added card yet', async () => {
        // Given a card that is not in the wallet yet
        mockGetCardStatus.mockResolvedValue('not found');
        let resolveAdd: (status: TokenizationStatus) => void = () => {};
        mockAddCardToAppleWallet.mockReturnValue(
            new Promise((resolve) => {
                resolveAdd = resolve;
            }),
        );
        renderCardWalletSection();
        expect(await screen.findByTestId('add-to-wallet-button')).toBeOnTheScreen();

        // When the add succeeds but the wallet still reports the card as not found
        fireEvent(screen.getByTestId('add-to-wallet-button'), 'touchEnd');
        expect(screen.getByTestId('add-to-wallet-spinner')).toBeOnTheScreen();
        await act(async () => {
            resolveAdd('success');
        });

        // Then the card page does not get stuck on a spinner until it remounts
        expect(screen.queryByTestId('add-to-wallet-spinner')).not.toBeOnTheScreen();
        expect(screen.getByTestId('add-to-wallet-button')).toBeOnTheScreen();
    });

    it('does not flash the Add button after a successful add', async () => {
        // Given a card that is not in the wallet yet
        mockGetCardStatus.mockResolvedValue('not found');
        let resolveAdd: (status: TokenizationStatus) => void = () => {};
        mockAddCardToAppleWallet.mockReturnValue(
            new Promise((resolve) => {
                resolveAdd = resolve;
            }),
        );
        renderCardWalletSection();
        expect(await screen.findByTestId('add-to-wallet-button')).toBeOnTheScreen();

        // When the add succeeds and the wallet already has the card, without the app returning to the foreground (Android has no screen change after an add)
        fireEvent(screen.getByTestId('add-to-wallet-button'), 'touchEnd');
        mockGetCardStatus.mockResolvedValue('active');
        await act(async () => {
            resolveAdd('success');
        });

        // Then the button stays hidden, because the spinner is only cleared once the new wallet status is known
        expect(screen.queryByTestId('add-to-wallet-button')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('add-to-wallet-spinner')).not.toBeOnTheScreen();
    });

    it('does not leave a spinner on the card page after a successful add that still needs verification', async () => {
        // Given a card that is not in the wallet yet
        mockGetCardStatus.mockResolvedValue('not found');
        let resolveAdd: (status: TokenizationStatus) => void = () => {};
        mockAddCardToAppleWallet.mockReturnValue(
            new Promise((resolve) => {
                resolveAdd = resolve;
            }),
        );
        renderCardWalletSection();
        expect(await screen.findByTestId('add-to-wallet-button')).toBeOnTheScreen();

        // When the user adds it and picks "Verify later", which the wallet library still reports as a success
        fireEvent(screen.getByTestId('add-to-wallet-button'), 'touchEnd');
        expect(screen.getByTestId('add-to-wallet-spinner')).toBeOnTheScreen();
        mockGetCardStatus.mockResolvedValue('requireActivation');
        await act(async () => {
            resolveAdd('success');
        });
        act(() => {
            bringAppToForeground();
        });

        // Then the spinner is gone and the card shows as added instead of offering to add it again
        expect(await screen.findByText('cardPage.cardAddedToWallet')).toBeOnTheScreen();
        expect(screen.queryByTestId('add-to-wallet-spinner')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('add-to-wallet-button')).not.toBeOnTheScreen();
    });
});

describe('isCardInWallet on Android', () => {
    it.each<[CardStatus, boolean]>([
        ['active', true],
        ['requireActivation', true],
        ['pending', true],
        ['not found', false],
    ])('returns %s -> %s', async (status, expected) => {
        // Given a Google Wallet token in the given state, e.g. "requireActivation" after backing out of the yellow path
        mockGetCardStatusBySuffix.mockResolvedValue(status);

        // When checking whether the card is in the wallet
        const result = await isCardInGoogleWallet(card);

        // Then tokens waiting for verification count as added, so the Add button does not come back for them
        expect(result).toBe(expected);
    });
});
