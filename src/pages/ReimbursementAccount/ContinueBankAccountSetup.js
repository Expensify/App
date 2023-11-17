import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Callback to continue to the next step of the setup */
    continue: PropTypes.func.isRequired,

    /* The workspace name */
    policyName: PropTypes.string,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {policyName: ''};

function ContinueBankAccountSetup(props) {
    const styles = useThemeStyles();
    const errors = lodashGet(props.reimbursementAccount, 'errors', {});
    const pendingAction = lodashGet(props.reimbursementAccount, 'pendingAction', null);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ContinueBankAccountSetup.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('workspace.common.connectBankAccount')}
                subtitle={props.policyName}
                shouldShowGetAssistanceButton
                onBackButtonPress={props.onBackButtonPress}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
            />
            <ScrollView style={styles.flex1}>
                <Section
                    title={props.translate('workspace.bankAccount.almostDone')}
                    icon={Illustrations.BankArrow}
                >
                    <OfflineWithFeedback
                        errors={errors}
                        shouldShowErrorMessage
                        onClose={BankAccounts.resetReimbursementAccount}
                    >
                        <Text>{props.translate('workspace.bankAccount.youreAlmostDone')}</Text>
                        <Button
                            text={props.translate('workspace.bankAccount.continueWithSetup')}
                            onPress={props.continue}
                            icon={Expensicons.Bank}
                            style={[styles.mv4]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            large
                            success
                            isDisabled={Boolean(pendingAction) || !_.isEmpty(errors)}
                        />
                        <MenuItem
                            title={props.translate('workspace.bankAccount.startOver')}
                            icon={Expensicons.RotateLeft}
                            onPress={() => BankAccounts.requestResetFreePlanBankAccount()}
                            shouldShowRightIcon
                            wrapperStyle={[styles.cardMenuItem]}
                            disabled={Boolean(pendingAction) || !_.isEmpty(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
            </ScrollView>

            {props.reimbursementAccount.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={props.reimbursementAccount} />}
        </ScreenWrapper>
    );
}

ContinueBankAccountSetup.propTypes = propTypes;
ContinueBankAccountSetup.defaultProps = defaultProps;
ContinueBankAccountSetup.displayName = 'ContinueBankAccountSetup';

export default withLocalize(ContinueBankAccountSetup);
