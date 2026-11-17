import ActivityIndicator from '@components/ActivityIndicator';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationMainContext';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import {isUkEuExpensifyCard} from '@libs/CardUtils';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areAddressAndPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {handleAddCardToWallet} from '@libs/Wallet/index';
import {beginWalletEnrollment, cancelWalletEnrollment} from '@libs/WalletEnrollment';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

import {AddToWalletButton as RNAddToWalletButton} from '@expensify/react-native-wallet';
import React, {useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';

import type AddToWalletButtonProps from './types';

import useIsCardInWallet from './useIsCardInWallet';

const isIOS = getPlatform() === CONST.PLATFORM.IOS;

function AddToWalletButton({card, cardHolderName, cardDescription, style}: AddToWalletButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [areDetailsMissing] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: areAddressAndPersonalDetailsMissing});
    const enrollmentIDRef = useRef<string | undefined>(undefined);
    const styles = useThemeStyles();
    const {executeScenario} = useMultifactorAuthentication();
    const {isInWallet, isLoading: isCardLoading, isCardAvailable, isWalletAvailable, refreshWalletStatus} = useIsCardInWallet(card);

    useEffect(() => () => cancelWalletEnrollment(enrollmentIDRef.current), [card.cardID]);

    const handleOnPress = () => {
        if (isUkEuExpensifyCard(card)) {
            if (areDetailsMissing) {
                const cardID = String(card.cardID);
                const enrollmentID = beginWalletEnrollment(cardID, () => {
                    executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, {card, cardHolderName, cardDescription});
                });
                enrollmentIDRef.current = enrollmentID;
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute(cardID, undefined, undefined, enrollmentID)));
                return;
            }
            executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, {card, cardHolderName, cardDescription});
            return;
        }
        setIsLoading(true);
        handleAddCardToWallet(card, cardHolderName, cardDescription)
            .then((status: TokenizationStatus) => {
                if (status === 'success') {
                    Log.info('Card added to wallet');
                    getPaymentMethods();

                    // Keep the spinner until the new wallet status is known, so the Add button does not flash back in the meantime
                    refreshWalletStatus().finally(() => setIsLoading(false));
                    if (isIOS) {
                        Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ADDED_TO_WALLET.getRoute(String(card.cardID)));
                    }
                } else {
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                Log.warn(`Error while adding card to wallet: ${error}`);
                Alert.alert('Failed to add card to wallet', 'Please try again later.');
            });
    };

    if (!isWalletAvailable || isInWallet == null || isInWallet || !isCardAvailable) {
        return null;
    }

    if (isLoading || isCardLoading) {
        // The spinner takes the place of the button, so it needs the same outer spacing to avoid the surrounding rows shifting
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={style}
            />
        );
    }

    // The system provides control over the correct appearance and language
    return (
        <RNAddToWalletButton
            style={[styles.addToWalletButtonStyles, style]}
            buttonType="badge"
            buttonStyle="blackOutline"
            onPress={handleOnPress}
        />
    );
}

export default AddToWalletButton;
