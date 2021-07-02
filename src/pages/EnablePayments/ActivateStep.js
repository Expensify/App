import React from 'react';
import {View, Text} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import userWalletPropTypes from './userWalletPropTypes';
import CONST from '../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
    ...userWalletPropTypes,
};

const defaultProps = {
    userWallet: {},
};

const ActivateStep = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('activateStep.headerTitle')}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
        <View style={[styles.mh5, styles.flex1]}>
            {props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD && (
                <Text>{props.translate('activateStep.activated')}</Text>
            )}
            {props.userWallet.tierName === CONST.WALLET.TIER_NAME.SILVER && (
                <Text>{props.translate('activateStep.checkBackLater')}</Text>
            )}
        </View>
    </ScreenWrapper>
);

ActivateStep.propTypes = propTypes;
ActivateStep.defaultProps = defaultProps;
ActivateStep.displayName = 'ActivateStep';
export default withLocalize(ActivateStep);
