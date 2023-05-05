import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FireworksAnimation from '../../../assets/animations/Fireworks.json';
import ReviewingBankInfoAnimation from '../../../assets/animations/ReviewingBankInfo.json';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import userWalletPropTypes from './userWalletPropTypes';
import CONST from '../../CONST';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import walletTermsPropTypes from './walletTermsPropTypes';
import ConfirmationPage from '../../components/ConfirmationPage';

const propTypes = {
    ...withLocalizePropTypes,

    /** The user's wallet */
    userWallet: userWalletPropTypes,

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,
};

const defaultProps = {
    userWallet: {},
    walletTerms: {
        chatReportID: 0,
    },
};

const ActivateStep = (props) => {
    const isGoldWallet = props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD;
    const animation = isGoldWallet ? FireworksAnimation : ReviewingBankInfoAnimation;
    const continueButtonText = props.walletTerms.chatReportID ? props.translate('activateStep.continueToPayment') : props.translate('activateStep.continueToTransfer');

    return (
        <>
            <HeaderWithCloseButton
                title={props.translate('activateStep.headerTitle')}
                onCloseButtonPress={() => Navigation.dismissModal()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ConfirmationPage
                animation={animation}
                heading={props.translate(`activateStep.${isGoldWallet ? 'activated' : 'checkBackLater'}Title`)}
                description={props.translate(`activateStep.${isGoldWallet ? 'activated' : 'checkBackLater'}Message`)}
                shouldShowButton={isGoldWallet}
                buttonText={continueButtonText}
                onButtonPress={PaymentMethods.continueSetup}
            />
        </>
    );
};

ActivateStep.propTypes = propTypes;
ActivateStep.defaultProps = defaultProps;
ActivateStep.displayName = 'ActivateStep';

export default compose(
    withLocalize,
    withOnyx({
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
    }),
)(ActivateStep);
