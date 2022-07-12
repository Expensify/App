import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {withNavigation} from '@react-navigation/compat';
import ButtonWithMenu from './ButtonWithMenu';
import * as Expensicons from './Icon/Expensicons';
import Permissions from '../libs/Permissions';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import KYCWall from './KYCWall';

const propTypes = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: PropTypes.func.isRequired,

    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    currency: CONST.CURRENCY.USD,
    shouldShowPaypal: false,
};

class SettlementButton extends React.Component {
    constructor(props) {
        super(props);

        const buttonOptions = [];

        if (props.currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(props.betas) && Permissions.canUseWallet(props.betas)) {
            buttonOptions.push({
                text: props.translate('iou.settleExpensify'),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            });
        }

        if (props.shouldShowPaypal) {
            buttonOptions.push({
                text: props.translate('iou.settlePaypalMe'),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            });
        }

        buttonOptions.push({
            text: props.translate('iou.settleElsewhere'),
            icon: Expensicons.Cash,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        });

        this.state = {
            buttonOptions,
        };
    }

    render() {
        return (
            <KYCWall
                onSuccessfulKYC={() => this.props.onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY)}
                enablePaymentsRoute={this.props.enablePaymentsRoute}
                addBankAccountRoute={this.props.addBankAccountRoute}
                addDebitCardRoute={this.props.addDebitCardRoute}
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
                        options={this.state.buttonOptions}
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
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SettlementButton);
