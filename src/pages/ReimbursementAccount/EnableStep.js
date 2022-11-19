import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Button from '../../components/Button';
import * as Expensicons from '../../components/Icon/Expensicons';
import MenuItem from '../../components/MenuItem';
import getBankIcon from '../../components/Icon/BankIcons';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import bankAccountPropTypes from '../../components/bankAccountPropTypes';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Link from '../../libs/actions/Link';
import * as User from '../../libs/actions/User';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isLoadingPaymentMethods: true,
    bankAccountList: {},
};

class EnableStep extends React.Component {
    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        PaymentMethods.getPaymentMethods();
    }

    render() {
        if (this.props.isLoadingPaymentMethods || _.isEmpty(this.props.bankAccountList)) {
            return (
                <FullScreenLoadingIndicator />
            );
        }

        const isUsingExpensifyCard = this.props.user.isUsingExpensifyCard;
        const account = _.find(this.props.bankAccountList, bankAccount => bankAccount.bankAccountID === this.props.reimbursementAccount.achData.bankAccountID);
        if (!account) {
            // This shouldn't happen as we can only end up here if we have successfully added a bank account.
            // But in case it does we'll throw here directly so it can be caught by the error boundary.
            throw new Error('Account not found in EnableStep');
        }

        const {icon, iconSize} = getBankIcon(account.additionalData.bankName);
        const formattedBankAccountNumber = account.accountNumber
            ? `${this.props.translate('paymentMethodList.accountLastFour')} ${
                account.accountNumber.slice(-4)
            }`
            : '';
        const bankName = account.addressName;

        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    onCloseButtonPress={Navigation.dismissModal}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1]}>
                    <Section
                        title={!isUsingExpensifyCard ? this.props.translate('workspace.bankAccount.oneMoreThing') : this.props.translate('workspace.bankAccount.allSet')}
                        icon={!isUsingExpensifyCard ? Illustrations.ConciergeNew : Illustrations.ThumbsUpStars}
                    >
                        <MenuItem
                            title={bankName}
                            description={formattedBankAccountNumber}
                            icon={icon}
                            iconWidth={iconSize}
                            iconHeight={iconSize}
                            disabled
                            interactive={false}
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                            iconFill={themeColors.success}
                        />
                        <Text style={[styles.mv3]}>
                            {!isUsingExpensifyCard
                                ? this.props.translate('workspace.bankAccount.accountDescriptionNoCards')
                                : this.props.translate('workspace.bankAccount.accountDescriptionWithCards')}
                        </Text>
                        {!isUsingExpensifyCard && (
                            <Button
                                text={this.props.translate('workspace.bankAccount.addWorkEmail')}
                                onPress={() => {
                                    Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                                    User.subscribeToExpensifyCardUpdates();
                                }}
                                icon={Expensicons.Mail}
                                style={[styles.mt4]}
                                iconStyles={[styles.buttonCTAIcon]}
                                shouldShowRightIcon
                                large
                                success
                            />
                        )}
                        <MenuItem
                            title={this.props.translate('workspace.bankAccount.disconnectBankAccount')}
                            icon={Expensicons.Close}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            iconFill={themeColors.success}
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                        />
                    </Section>
                    {this.props.user.isCheckingDomain && (
                        <Text style={[styles.formError, styles.mh5]}>
                            {this.props.translate('workspace.card.checkingDomain')}
                        </Text>
                    )}
                </View>
            </View>
        );
    }
}

EnableStep.propTypes = propTypes;
EnableStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
            initWithStoredValues: false,
        },
    }),
)(EnableStep);
