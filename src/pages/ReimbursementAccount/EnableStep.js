import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import MenuItem from '../../components/MenuItem';
import getBankIcon from '../../components/Icon/BankIcons';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import confettiPop from '../../../assets/images/confetti-pop.gif';
import Icon from '../../components/Icon';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Link from '../../libs/actions/Link';
import * as User from '../../libs/actions/User';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class EnableStep extends React.Component {
    render() {
        const isUsingExpensifyCard = this.props.user.isUsingExpensifyCard;
        const reimbursementAccount = this.props.reimbursementAccount.achData || {};
        const {icon, iconSize} = getBankIcon(reimbursementAccount.bankName);
        const formattedBankAccountNumber = reimbursementAccount.accountNumber
            ? `${this.props.translate('paymentMethodList.accountLastFour')} ${
                reimbursementAccount.accountNumber.slice(-4)
            }`
            : '';
        const bankName = reimbursementAccount.addressName;
        const menuItems = [{
            title: this.props.translate('workspace.bankAccount.disconnectBankAccount'),
            icon: Expensicons.Close,
            onPress: BankAccounts.requestResetFreePlanBankAccount,
        }];
        if (!isUsingExpensifyCard) {
            menuItems.unshift({
                title: this.props.translate('workspace.bankAccount.addWorkEmail'),
                icon: Expensicons.Mail,
                onPress: () => {
                    Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                    User.subscribeToExpensifyCardUpdates();
                },
                shouldShowRightIcon: true,
            });
        }

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
                        // eslint-disable-next-line max-len
                        IconComponent={() => (!isUsingExpensifyCard ? <Icon src={Illustrations.ConciergeBlue} width={80} height={80} /> : <Image source={confettiPop} style={styles.confettiIcon} />)}
                        menuItems={menuItems}
                    >
                        <MenuItem
                            title={bankName}
                            description={formattedBankAccountNumber}
                            icon={icon}
                            iconWidth={iconSize}
                            iconHeight={iconSize}
                            disabled
                            interactive={false}
                            wrapperStyle={[styles.ph0, styles.mb3]}
                        />
                        <Text>
                            {!isUsingExpensifyCard
                                ? this.props.translate('workspace.bankAccount.accountDescriptionNoCards')
                                : this.props.translate('workspace.bankAccount.accountDescriptionWithCards')}
                        </Text>
                    </Section>
                    {this.props.user.isCheckingDomain && (
                        <Text style={[styles.formError, styles.m5]}>
                            {this.props.translate('workspace.card.checkingDomain')}
                        </Text>
                    )}
                </View>
            </View>
        );
    }
}

EnableStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(EnableStep);
