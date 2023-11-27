import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import userPropTypes from '@pages/settings/userPropTypes';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import * as BankAccounts from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /* Onyx Props */
    user: userPropTypes,

    /* The workspace name */
    policyName: PropTypes.string,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
    policyName: '',
};

function EnableStep(props) {
    const styles = useThemeStyles();
    const isUsingExpensifyCard = props.user.isUsingExpensifyCard;
    const achData = lodashGet(props.reimbursementAccount, 'achData') || {};
    const {icon, iconSize} = getBankIcon(achData.bankName);
    const formattedBankAccountNumber = achData.accountNumber ? `${props.translate('paymentMethodList.accountLastFour')} ${achData.accountNumber.slice(-4)}` : '';
    const bankName = achData.addressName;

    const errors = lodashGet(props.reimbursementAccount, 'errors', {});
    const pendingAction = lodashGet(props.reimbursementAccount, 'pendingAction', null);
    return (
        <ScreenWrapper
            style={[styles.flex1, styles.justifyContentBetween]}
            includeSafeAreaPaddingBottom={false}
            testID={EnableStep.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('workspace.common.connectBankAccount')}
                subtitle={props.policyName}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={props.onBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={!isUsingExpensifyCard ? props.translate('workspace.bankAccount.oneMoreThing') : props.translate('workspace.bankAccount.allSet')}
                    icon={!isUsingExpensifyCard ? Illustrations.ConciergeNew : Illustrations.ThumbsUpStars}
                >
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={errors}
                        shouldShowErrorMessage
                        onClose={BankAccounts.resetReimbursementAccount}
                    >
                        <MenuItem
                            title={bankName}
                            description={formattedBankAccountNumber}
                            icon={icon}
                            iconWidth={iconSize}
                            iconHeight={iconSize}
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
                            disabled={Boolean(pendingAction) || !_.isEmpty(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
                {Boolean(props.user.isCheckingDomain) && <Text style={[styles.formError, styles.mh5]}>{props.translate('workspace.card.checkingDomain')}</Text>}
            </ScrollView>
            {props.reimbursementAccount.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={props.reimbursementAccount} />}
        </ScreenWrapper>
    );
}

EnableStep.displayName = 'EnableStep';
EnableStep.propTypes = propTypes;
EnableStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(EnableStep);
