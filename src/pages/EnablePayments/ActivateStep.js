import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../../components/ScreenWrapper';
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

const propTypes = {
    ...withLocalizePropTypes,

    /** The user's wallet */
    userWallet: PropTypes.objectOf(userWalletPropTypes),
};

const defaultProps = {
    userWallet: {},
};

class ActivateStep extends React.Component {
    constructor(props) {
        super(props);

        this.renderGoldWalletActivationStep = this.renderGoldWalletActivationStep.bind(this);
    }

    renderGoldWalletActivationStep() {
        return (
            <>
                <View style={[styles.pageWrapper, styles.flex1, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={Illustrations.TadaBlue}
                        height={100}
                        width={100}
                        fill={defaultTheme.iconSuccessFill}
                    />
                    <View style={[styles.ph5]}>
                        <Text style={[styles.mt5, styles.h1, styles.textAlignCenter]}>
                            {this.props.translate('activateStep.activatedTitle')}
                        </Text>
                        <Text style={[styles.mt3, styles.textAlignCenter]}>
                            {this.props.translate('activateStep.activatedMessage')}
                        </Text>
                    </View>
                </View>
                <FixedFooter>
                    <Button
                        text={this.props.translate('common.continue')}
                        onPress={PaymentMethods.continueSetup}
                        style={[styles.mt4]}
                        iconStyles={[styles.mr5]}
                        success
                    />
                </FixedFooter>
            </>
        );
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('activateStep.headerTitle')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={styles.flex1}>
                    {this.props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD && this.renderGoldWalletActivationStep()}
                    {this.props.userWallet.tierName === CONST.WALLET.TIER_NAME.SILVER && (
                        <Text>{this.props.translate('activateStep.checkBackLater')}</Text>
                    )}
                </View>
            </ScreenWrapper>
        );
    }
}

ActivateStep.propTypes = propTypes;
ActivateStep.defaultProps = defaultProps;

export default withLocalize(ActivateStep);
