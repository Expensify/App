import React from 'react';
import {
    View,
} from 'react-native';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import walletTransferPropTypes from './walletTransferPropTypes';

const propTypes = {
    ...withLocalizePropTypes,

    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,
};

const defaultProps = {
    walletTransfer: {},
};

const SuccessfulBalanceTransferPage = props => (
    <View style={[styles.flex1]}>
        <View style={[styles.ph5]}>
            <Text style={styles.mb3}>
                {props.translate('paymentsPage.transferConfirmText', {
                    amount: props.numberFormat(
                        props.walletTransfer.transferAmount / 100,
                        {style: 'currency', currency: 'USD'},
                    ),
                })}
            </Text>
            <Button
                text={props.translate('paymentsPage.gotIt')}
                onPress={() => PaymentMethods.dismissSuccessfulTransferBalancePage()}
                style={[styles.mt4]}
                iconStyles={[styles.mr5]}
                success
            />
        </View>
    </View>
);

SuccessfulBalanceTransferPage.propTypes = propTypes;
SuccessfulBalanceTransferPage.defaultProps = defaultProps;
SuccessfulBalanceTransferPage.displayName = 'SuccessfulBalanceTransferPage';

export default withLocalize(SuccessfulBalanceTransferPage);
