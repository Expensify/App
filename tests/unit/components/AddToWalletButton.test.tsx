/** Explicit native entrypoint: the web component intentionally renders nothing. */
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import AddToWalletButton from '@components/AddToWalletButton/index.native';
import useIsCardInWallet from '@components/AddToWalletButton/useIsCardInWallet';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationMainContext';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet/index';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';
import {Alert} from 'react-native';

import createMock from '../../utils/createMock';

jest.mock('@expensify/react-native-wallet', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        AddToWalletButton: ({onPress}: {onPress: () => void}) => (
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
            >
                <Text>Add to wallet</Text>
            </Pressable>
        ),
    };
});
jest.mock('@components/ActivityIndicator', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return () => <Text>Loading wallet</Text>;
});
jest.mock('@components/AddToWalletButton/useIsCardInWallet');
jest.mock('@components/MultifactorAuthentication/Context/MultifactorAuthenticationMainContext');
jest.mock('@libs/Wallet/index', () => ({handleAddCardToWallet: jest.fn()}));
jest.mock('@libs/actions/PaymentMethods', () => ({getPaymentMethods: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/getPlatform', () => ({__esModule: true, default: () => 'ios'}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({addToWalletButtonStyles: {}})}));

const card = createMock<Card>({cardID: 123, bank: CONST.EXPENSIFY_CARD.BANK, nameValuePairs: {feedCountry: CONST.COUNTRY.GB}});
const mockExecuteScenario = jest.fn().mockResolvedValue(undefined);
const available = {isInWallet: false, isLoading: false, isCardAvailable: true, isWalletAvailable: true};

describe('Native AddToWalletButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useIsCardInWallet).mockReturnValue(available);
        jest.mocked(useMultifactorAuthentication).mockReturnValue(createMock<ReturnType<typeof useMultifactorAuthentication>>({executeScenario: mockExecuteScenario}));
    });

    it('starts MFA for the actual UK/EU program card without latching a button spinner', () => {
        // Given a GB-feed Expensify card with display metadata.
        render(
            <AddToWalletButton
                card={card}
                cardHolderName="Jane"
                cardDescription="Virtual card"
            />,
        );

        // When its native badge is pressed (initialization is not authorization completion).
        fireEvent.press(screen.getByText('Add to wallet'));

        // Then MFA owns native launch and success, while the badge stays usable after initialization.
        expect(mockExecuteScenario).toHaveBeenCalledWith(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, {card, cardHolderName: 'Jane', cardDescription: 'Virtual card'});
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(screen.queryByText('Loading wallet')).toBeNull();
    });

    it.each([createMock<Card>({...card, nameValuePairs: {feedCountry: CONST.COUNTRY.US}}), createMock<Card>({...card, bank: CONST.PERSONAL_CARDS.BANK_NAME.CHASE})])(
        'keeps unsigned provisioning for cards outside the UK/EU program',
        async (legacyCard) => {
            // Given a US-feed or non-Expensify card, irrespective of user location/currency.
            jest.mocked(handleAddCardToWallet).mockResolvedValue('success');
            render(
                <AddToWalletButton
                    card={legacyCard}
                    cardHolderName="Jane"
                    cardDescription="Card"
                />,
            );

            // When its badge is pressed.
            fireEvent.press(screen.getByText('Add to wallet'));

            // Then the legacy helper and success side effects stay unchanged.
            await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
            expect(handleAddCardToWallet).toHaveBeenCalledWith(legacyCard, 'Jane', 'Card');
            expect(mockExecuteScenario).not.toHaveBeenCalled();
            expect(Navigation.navigate).toHaveBeenCalled();
        },
    );

    it.each(['canceled', 'error'] as const)('restores the legacy badge after native %s', async (status) => {
        // Given native legacy tokenization did not succeed.
        jest.mocked(handleAddCardToWallet).mockResolvedValue(status);
        render(
            <AddToWalletButton
                card={createMock<Card>({...card, nameValuePairs: {feedCountry: CONST.COUNTRY.US}})}
                cardHolderName="Jane"
                cardDescription="Card"
            />,
        );

        // When that attempt finishes.
        fireEvent.press(screen.getByText('Add to wallet'));

        // Then retry is available without refresh or added-card navigation.
        expect(await screen.findByText('Add to wallet')).toBeTruthy();
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('retains the legacy rejection alert and retry', async () => {
        // Given the unsigned native flow rejects.
        const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        jest.mocked(handleAddCardToWallet).mockRejectedValue(new Error('failed'));
        render(
            <AddToWalletButton
                card={createMock<Card>({...card, nameValuePairs: {feedCountry: CONST.COUNTRY.US}})}
                cardHolderName="Jane"
                cardDescription="Card"
            />,
        );

        // When the attempt ends.
        fireEvent.press(screen.getByText('Add to wallet'));

        // Then the existing alert remains and the badge is restored.
        await waitFor(() => expect(alert).toHaveBeenCalled());
        expect(screen.getByText('Add to wallet')).toBeTruthy();
        alert.mockRestore();
    });

    it.each([
        {...available, isWalletAvailable: false},
        {...available, isInWallet: null},
        {...available, isInWallet: true},
        {...available, isCardAvailable: false},
    ])('retains wallet/card visibility rules', (status) => {
        // Given a card or wallet that is not eligible to show a badge.
        jest.mocked(useIsCardInWallet).mockReturnValue(status);
        // When the native component renders.
        render(
            <AddToWalletButton
                card={card}
                cardHolderName="Jane"
                cardDescription="Card"
            />,
        );
        // Then neither a new MFA entry nor a legacy badge is exposed.
        expect(screen.queryByText('Add to wallet')).toBeNull();
    });
});
