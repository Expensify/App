import React from 'react';
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
import confettiPop from '../../../assets/images/confetti-pop.gif';
import Icon from '../../components/Icon';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import userPropTypes from '../settings/userPropTypes';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Link from '../../libs/actions/Link';
import * as User from '../../libs/actions/User';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /* Onyx Props */
    user: userPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
    user: {},
};

const EnableStep = (props) => {
    const isUsingExpensifyCard = props.user.isUsingExpensifyCard;
    const reimbursementAccount = props.reimbursementAccount.achData || {};
    const {icon, iconSize} = getBankIcon(reimbursementAccount.bankName);
    const formattedBankAccountNumber = reimbursementAccount.accountNumber
        ? `${props.translate('paymentMethodList.accountLastFour')} ${
            reimbursementAccount.accountNumber.slice(-4)
        }`
        : '';
    const bankName = reimbursementAccount.addressName;
    const menuItems = [{
        title: props.translate('workspace.bankAccount.disconnectBankAccount'),
        icon: Expensicons.Close,
        onPress: BankAccounts.requestResetFreePlanBankAccount,
    }];
    if (!isUsingExpensifyCard) {
        menuItems.unshift({
            title: props.translate('workspace.bankAccount.addWorkEmail'),
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
                title={props.translate('workspace.common.bankAccount')}
                onCloseButtonPress={Navigation.dismissModal}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1]}>
                <Section
                    title={!isUsingExpensifyCard ? props.translate('workspace.bankAccount.oneMoreThing') : props.translate('workspace.bankAccount.allSet')}
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
                            ? props.translate('workspace.bankAccount.accountDescriptionNoCards')
                            : props.translate('workspace.bankAccount.accountDescriptionWithCards')}
                    </Text>
                </Section>
                {props.user.isCheckingDomain && (
                    <Text style={[styles.formError, styles.m5]}>
                        {props.translate('workspace.card.checkingDomain')}
                    </Text>
                )}
            </View>
        </View>
    );
};

EnableStep.defaultProps = defaultProps;
EnableStep.displayName = 'EnableStep';
EnableStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(EnableStep);
