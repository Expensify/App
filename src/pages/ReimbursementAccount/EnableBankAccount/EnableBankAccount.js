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
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import userPropTypes from '@pages/settings/userPropTypes';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as Link from '@userActions/Link';
import * as BankAccounts from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /* Onyx Props */
    user: userPropTypes,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    user: {},
};

function EnableBankAccount({reimbursementAccount, user, onBackButtonPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const achData = lodashGet(reimbursementAccount, 'achData', {});
    const {icon, iconSize} = getBankIcon({bankName: achData.bankName, styles});
    const isUsingExpensifyCard = user.isUsingExpensifyCard;
    const formattedBankAccountNumber = achData.accountNumber ? `${translate('paymentMethodList.accountLastFour')} ${achData.accountNumber.slice(-4)}` : '';
    const bankName = achData.addressName;
    const errors = lodashGet(reimbursementAccount, 'errors', {});
    const pendingAction = lodashGet(reimbursementAccount, 'pendingAction', null);
    const shouldShowResetModal = lodashGet(reimbursementAccount, 'shouldShowResetModal', false);

    return (
        <ScreenWrapper
            testID={EnableBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            style={[styles.flex1, styles.justifyContentBetween, styles.mh2]}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={onBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={!isUsingExpensifyCard ? translate('workspace.bankAccount.oneMoreThing') : translate('workspace.bankAccount.allSet')}
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
                            displayInDefaultIconColor
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                        />
                        <Text style={[styles.mv3]}>
                            {!isUsingExpensifyCard ? translate('workspace.bankAccount.accountDescriptionNoCards') : translate('workspace.bankAccount.accountDescriptionWithCards')}
                        </Text>
                        {!isUsingExpensifyCard && (
                            <Button
                                text={translate('workspace.bankAccount.addWorkEmail')}
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
                            title={translate('workspace.bankAccount.disconnectBankAccount')}
                            icon={Expensicons.Close}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                            disabled={Boolean(pendingAction) || !_.isEmpty(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
                {Boolean(user.isCheckingDomain) && <Text style={[styles.formError, styles.mh5]}>{translate('workspace.card.checkingDomain')}</Text>}
            </ScrollView>
            {shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScreenWrapper>
    );
}

EnableBankAccount.displayName = 'EnableStep';
EnableBankAccount.propTypes = propTypes;
EnableBankAccount.defaultProps = defaultProps;

export default withOnyx({
    user: {
        key: ONYXKEYS.USER,
    },
})(EnableBankAccount);
