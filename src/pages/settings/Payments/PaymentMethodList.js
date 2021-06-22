/* eslint-disable react/jsx-props-no-multi-spaces */
import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize from '../../../components/withLocalize';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import {Bank, Plus} from '../../../components/Icon/Expensicons';

const propTypes = {
    // What to do when a menu item is pressed
    onPress: PropTypes.func.isRequired,

    // Users paypal.me username if they have one
    payPalMeUsername: PropTypes.string,

    // Array of bank account objects
    bankAccountList: PropTypes.arrayOf(PropTypes.shape({
        addressName: PropTypes.string,
        accountNubmer: PropTypes.string,
    })),

    // Array of card objects
    cardList: PropTypes.arrayOf(PropTypes.shape({
        cardName: PropTypes.string,
        accountNumber: PropTypes.string,
    })),
};

const defaultProps = {
    payPalMeUsername: '',
    bankAccountList: [],
    cardList: [],
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    /**
     * Render item method wraps the prop renderItem to render in a
     * View component so we can attach an onLayout handler and
     * measure it when it renders.
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     *
     * @return {React.Component}
     */
    renderItem({item, index}) {
        return (
            <MenuItem
                onPress={() => item.onPress}
                title={item.primaryText}
                icon={item.icon}
                key={`paymentMethod-${index}`}
            />
        );
    }

    render() {
        const combinedPaymentMethods = [];
        if (this.props.payPalMeUsername) {
            combinedPaymentMethods[0] = {
                primaryText: 'PayPal.me',
                secondaryText: this.props.payPalMeUsername,
                icon: Bank,
                onPress: () => this.props.onPress('payPalMe'),
            };
        }

        _.each(this.props.bankAccountList, (bankAccount) => {
            combinedPaymentMethods.push({
                primaryText: bankAccount.addressName,
                secondaryText: `Account ending in ${bankAccount.accountNumber.slice(-4)}`,
                icon: Bank,
                onPress: () => this.props.onPress(bankAccount.bankAccountID),
            });
        });

        _.each(this.props.cardList, (card) => {
            if (card.cardName !== '__CASH__') {
                combinedPaymentMethods.push({
                    primaryText: card.cardName,
                    secondaryText: `Card ending in ${card.cardNumber.slice(-4)}`,
                    icon: Bank,
                    onPress: () => this.props.onPress(card.cardID),
                });
            }
        });

        combinedPaymentMethods.push({
            primaryText: 'Add Payment Method',
            icon: Plus,
        });

        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                data={combinedPaymentMethods}
                inverted
                renderItem={this.renderItem}
                bounces
                windowSize={15}
            />
        );
    }
}

PaymentMethodList.propTypes = propTypes;
PaymentMethodList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(PaymentMethodList);
