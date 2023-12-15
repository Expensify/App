import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Report from '@userActions/Report';
import Enable2FACard from './Enable2FACard';

const propTypes = {
    requiresTwoFactorAuth: PropTypes.bool.isRequired,
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,
};

function FinishChatCard({requiresTwoFactorAuth, reimbursementAccount}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldShowResetModal = lodashGet(reimbursementAccount, 'shouldShowResetModal', false);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={Illustrations.ConciergeBubble}
                containerStyles={[styles.mb8]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <Button
                    text={translate('connectBankAccountStep.letsChatCTA')}
                    onPress={Report.navigateToConciergeChat}
                    icon={Expensicons.ChatBubble}
                    iconStyles={[styles.buttonCTAIcon]}
                    shouldShowRightIcon
                    large
                    success
                />
                <MenuItem
                    title={translate('workspace.bankAccount.noLetsStartOver')}
                    icon={Expensicons.RotateLeft}
                    onPress={BankAccounts.requestResetFreePlanBankAccount}
                    shouldShowRightIcon
                    wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                />
            </Section>
            {!requiresTwoFactorAuth && <Enable2FACard />}
            {shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScrollView>
    );
}

FinishChatCard.propTypes = propTypes;
FinishChatCard.displayName = 'FinishChatCard';

export default FinishChatCard;
