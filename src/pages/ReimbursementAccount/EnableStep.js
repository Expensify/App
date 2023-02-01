import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
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
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import userPropTypes from '../settings/userPropTypes';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as Link from '../../libs/actions/Link';
import * as User from '../../libs/actions/User';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as BankAccounts from '../../libs/actions/ReimbursementAccount';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /* Onyx Props */
    user: userPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const EnableStep = (props) => {
    const isUsingExpensifyCard = props.user.isUsingExpensifyCard;
    const achData = lodashGet(props.reimbursementAccount, 'achData') || {};
    const {icon, iconSize} = getBankIcon(achData.bankName);
    const formattedBankAccountNumber = achData.accountNumber
        ? `${props.translate('paymentMethodList.accountLastFour')} ${
            achData.accountNumber.slice(-4)
        }`
        : '';
    const bankName = achData.addressName;

    return (
        <ScreenWrapper style={[styles.flex1, styles.justifyContentBetween]} includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('workspace.common.bankAccount')}
                onCloseButtonPress={Navigation.dismissModal}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={!isUsingExpensifyCard ? props.translate('workspace.bankAccount.oneMoreThing') : props.translate('workspace.bankAccount.allSet')}
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
                    />
                    <Text style={[styles.mv3]}>
                        {!isUsingExpensifyCard
                            ? props.translate('workspace.bankAccount.accountDescriptionNoCards')
                            : props.translate('workspace.bankAccount.accountDescriptionWithCards')}
                    </Text>
                    {!isUsingExpensifyCard && (
                        <Button
                            text={props.translate('workspace.bankAccount.addWorkEmail')}
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
                        title={props.translate('workspace.bankAccount.disconnectBankAccount')}
                        icon={Expensicons.Close}
                        onPress={BankAccounts.requestResetFreePlanBankAccount}
                        wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                    />
                </Section>
                {props.user.isCheckingDomain && (
                    <Text style={[styles.formError, styles.mh5]}>
                        {props.translate('workspace.card.checkingDomain')}
                    </Text>
                )}
            </ScrollView>
            {props.reimbursementAccount.shouldShowResetModal && Boolean(achData.bankAccountID) && (
                <WorkspaceResetBankAccountModal
                    reimbursementAccount={props.reimbursementAccount}
                />
            )}
        </ScreenWrapper>
    );
};

EnableStep.displayName = 'EnableStep';
EnableStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(EnableStep);
