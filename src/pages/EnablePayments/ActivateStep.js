import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import userWalletPropTypes from './userWalletPropTypes';
import CONST from '../../CONST';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import * as Illustrations from '../../components/Icon/Illustrations';
import defaultTheme from '../../styles/themes/default';
import FixedFooter from '../../components/FixedFooter';
import Button from '../../components/Button';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import walletTermsPropTypes from './walletTermsPropTypes';

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
    const illustration = isGoldWallet ? Illustrations.TadaBlue : Illustrations.ReceiptsSearchYellow;
    const continueButtonText = props.walletTerms.chatReportID ? props.translate('activateStep.continueToPayment') : props.translate('activateStep.continueToTransfer');

    return (
        <>
            <HeaderWithCloseButton
                title={props.translate('activateStep.headerTitle')}
                onCloseButtonPress={() => Navigation.dismissModal()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={styles.flex1}>
                <View style={[styles.pageWrapper, styles.flex1, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={illustration}
                        height={100}
                        width={100}
                        fill={defaultTheme.iconSuccessFill}
                    />
                    <View style={[styles.ph5]}>
                        <Text style={[styles.mt5, styles.h1, styles.textAlignCenter, styles.textNewKansas]}>
                            {props.translate(`activateStep.${isGoldWallet ? 'activated' : 'checkBackLater'}Title`)}
                        </Text>
                        <Text style={[styles.mt3, styles.textAlignCenter]}>
                            {props.translate(`activateStep.${isGoldWallet ? 'activated' : 'checkBackLater'}Message`)}
                        </Text>
                    </View>
                </View>
                {isGoldWallet && (
                    <FixedFooter>
                        <Button
                            text={continueButtonText}
                            onPress={PaymentMethods.continueSetup}
                            style={[styles.mt4]}
                            iconStyles={[styles.mr5]}
                            success
                        />
                    </FixedFooter>
                )}
            </View>
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
