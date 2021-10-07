import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Icon from '../../components/Icon';
import {Bank, ChatBubble} from '../../components/Icon/Expensicons';
import colors from '../../styles/colors';
import variables from '../../styles/variables';
import MenuItem from '../../components/MenuItem';
import getBankIcon from '../../components/Icon/BankIcons';
import {getPaymentMethods} from '../../libs/actions/PaymentMethods';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import bankAccountPropTypes from '../../components/bankAccountPropTypes';
import {navigateToConciergeChat} from '../../libs/actions/Report';

const propTypes = {
    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    /** Array of bank account objects */
    bankAccountList: PropTypes.arrayOf(bankAccountPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isLoadingPaymentMethods: true,
    bankAccountList: [],
};

class EnableStep extends React.Component {
    componentDidMount() {
        getPaymentMethods();
    }

    render() {
        const {
            user, reimbursementAccount, translate, bankAccountList,
        } = this.props;
        if (this.props.isLoadingPaymentMethods || _.isEmpty(bankAccountList)) {
            return (
                <FullScreenLoadingIndicator visible />
            );
        }

        const isUsingExpensifyCard = user.isUsingExpensifyCard;
        const account = _.find(bankAccountList, bankAccount => bankAccount.bankAccountID === reimbursementAccount.achData.bankAccountID);
        if (!account) {
            throw new Error('Account not found in EnableStep');
        }

        const {icon, iconSize} = getBankIcon(account.additionalData.bankName);
        const formattedBankAccountNumber = account.accountNumber
            ? `${translate('paymentMethodList.accountLastFour')} ${
                account.accountNumber.slice(-4)
            }`
            : '';
        const bankName = account.addressName;
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={translate('workspace.common.bankAccount')}
                    onCloseButtonPress={Navigation.dismissModal}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1]}>
                    <View style={[styles.mh5, styles.mb5, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text style={[styles.textLarge, styles.textStrong]}>
                            {!isUsingExpensifyCard ? translate('workspace.bankAccount.basicallyDone') : translate('workspace.bankAccount.allSet')}
                        </Text>
                        <Icon src={Bank} fill={colors.yellow} height={variables.componentSizeNormal} width={variables.componentSizeNormal} />
                    </View>
                    <MenuItem
                        title={bankName}
                        description={formattedBankAccountNumber}
                        icon={icon}
                        iconWidth={iconSize}
                        iconHeight={iconSize}
                        onPress={() => {}}
                    />
                    <Text style={[styles.mh5, styles.mb5]}>
                        {!isUsingExpensifyCard
                            ? translate('workspace.bankAccount.accountDescriptionNoCards')
                            : translate('workspace.bankAccount.accountDescriptionWithCards')}
                    </Text>
                    {!isUsingExpensifyCard && (
                        <MenuItem
                            title={translate('workspace.bankAccount.chatWithConcierge')}
                            icon={ChatBubble}
                            onPress={() => navigateToConciergeChat()}
                            shouldShowRightIcon
                        />
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
