import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {ScrollView} from 'react-native-gesture-handler';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import {
    Bank, Bolt,
} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';


const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class TransferBalancePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedPaymentType: CONST.WALLET.PAYMENT_TYPE.INSTANT,
        };
        this.paymentTypes = [
            {
                key: CONST.WALLET.PAYMENT_TYPE.INSTANT,
                title: 'Instant',
                description: '1.5% fee ($0.25 minimum)',
                icon: Bolt,
            },
            {
                key: CONST.WALLET.PAYMENT_TYPE.BANK,
                title: '1-3 Business Days',
                description: 'No fee',
                icon: Bank,
            },
        ];

        this.transferBalance = this.transferBalance.bind(this);
    }

    /**
     * Transfer Wallet balance
     *
     */
    transferBalance() {
        Navigation.navigate(ROUTES.SETTINGS_TRANSFER_BALANCE);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title="Transfer Balance"
                        onCloseButtonPress={() => Navigation.goBack()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        {_.map(this.paymentTypes, type => (
                            <MenuItem
                                key={type.key}
                                title={type.title}
                                description={type.description}
                                iconWidth={variables.iconSizeXLarge}
                                iconHeight={variables.iconSizeXLarge}
                                icon={type.icon}
                                success={this.state.selectedPaymentType === type.key}
                                wrapperStyle={{
                                    ...styles.mt3,
                                    ...styles.pv4,
                                    ...styles.transferBalancePayment,
                                    ...(this.state.selectedPaymentType === type.key && styles.transferBalanceSelectedPayment),
                                }}
                                // eslint-disable-next-line react/no-unused-state
                                onPress={() => this.setState({selectedPaymentType: type.key})}
                            />
                        ))}
                        <Text
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            Which Account?
                        </Text>
                        <MenuItem
                            title="asdsdsd"
                            description="dasdasdas"
                            shouldShowRightIcon
                            iconWidth={variables.iconSizeXLarge}
                            iconHeight={variables.iconSizeXLarge}
                            icon={Bolt}
                            wrapperStyle={{
                                ...styles.mrn5,
                                ...styles.ph0,
                            }}
                            onPress={() => {}}
                        />
                        <Text
                            style={[styles.mt5, styles.mb3, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            Fee
                        </Text>
                        <Text
                            style={[styles.textLabel, styles.justifyContentStart]}
                        >
                            $0.30
                        </Text>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            style={[styles.mb2]}
                            text={this.props.translate('addSecondaryLoginPage.sendValidation')}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

TransferBalancePage.propTypes = propTypes;
TransferBalancePage.defaultProps = defaultProps;
TransferBalancePage.displayName = 'TransferBalancePage';

export default compose(
    withLocalize,
    withOnyx({
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(TransferBalancePage);
