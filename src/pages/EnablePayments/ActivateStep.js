import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as LottieAnimations from '../../components/LottieAnimations';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
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
        source: '',
        chatReportID: 0,
    },
};

function ActivateStep(props) {
    const isActivatedWallet = _.contains([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM], props.userWallet.tierName);
    const animation = isActivatedWallet ? LottieAnimations.Fireworks : LottieAnimations.ReviewingBankInfo;
    let continueButtonText = '';

    if (props.walletTerms.chatReportID) {
        continueButtonText = props.translate('activateStep.continueToPayment');
    } else if (props.walletTerms.source === CONST.KYC_WALL_SOURCE.ENABLE_WALLET) {
        continueButtonText = props.translate('common.continue');
    } else {
        continueButtonText = props.translate('activateStep.continueToTransfer');
    }

    return (
        <>
            <HeaderWithBackButton title={props.translate('activateStep.headerTitle')} />
            <ConfirmationPage
                animation={animation}
                heading={props.translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Title`)}
                description={props.translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Message`)}
                shouldShowButton={isActivatedWallet}
                buttonText={continueButtonText}
                onButtonPress={() => PaymentMethods.continueSetup()}
            />
        </>
    );
}

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
