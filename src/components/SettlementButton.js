import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ButtonWithMenu from './ButtonWithMenu';
import * as Expensicons from './Icon/Expensicons';
import Permissions from '../libs/Permissions';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import KYCWall from './KYCWall';
import withNavigation from './withNavigation';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';

const propTypes = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: PropTypes.func.isRequired,

    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    currency: CONST.CURRENCY.USD,
    shouldShowPaypal: false,
    chatReportID: '',
};

class SettlementButton extends React.Component {
    componentDidMount() {
        PaymentMethods.openPaymentsPage();
    }

    getButtonOptionsFromProps() {
        const buttonOptions = [];

        if (this.props.currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(this.props.betas) && Permissions.canUseWallet(this.props.betas)) {
            buttonOptions.push({
                text: this.props.translate('iou.settleExpensify'),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            });
        }

        if (this.props.shouldShowPaypal) {
            buttonOptions.push({
                text: this.props.translate('iou.settlePaypalMe'),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            });
        }

        buttonOptions.push({
            text: this.props.translate('iou.settleElsewhere'),
            icon: Expensicons.Cash,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        });

        return buttonOptions;
    }

    render() {
        return (
            <KYCWall
                onSuccessfulKYC={() => this.props.onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY)}
                enablePaymentsRoute={this.props.enablePaymentsRoute}
                addBankAccountRoute={this.props.addBankAccountRoute}
                addDebitCardRoute={this.props.addDebitCardRoute}
                isDisabled={this.props.network.isOffline}
                chatReportID={this.props.chatReportID}
            >
                {triggerKYCFlow => (
                    <ButtonWithMenu
                        isDisabled={this.props.isDisabled}
                        isLoading={this.props.isLoading}
                        onPress={(event, iouPaymentType) => {
                            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                                triggerKYCFlow(event);
                                return;
                            }

                            this.props.onPress(iouPaymentType);
                        }}
                        options={this.getButtonOptionsFromProps()}
                    />
                )}
            </KYCWall>
        );
    }
}

SettlementButton.propTypes = propTypes;
SettlementButton.defaultProps = defaultProps;

export default compose(
    withNavigation,
    withLocalize,
    withNetwork(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SettlementButton);
