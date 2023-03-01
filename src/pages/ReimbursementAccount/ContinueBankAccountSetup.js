import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as Illustrations from '../../components/Icon/Illustrations';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Button from '../../components/Button';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import ScreenWrapper from '../../components/ScreenWrapper';
import Section from '../../components/Section';
import Text from '../../components/Text';
import withPolicy from '../workspace/withPolicy';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '../../libs/actions/BankAccounts';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Callback to continue to the next step of the setup */
    continue: PropTypes.func.isRequired,

    /** Callback to reset the bank account */
    startOver: PropTypes.func.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const ContinueBankAccountSetup = props => (
    <ScreenWrapper includeSafeAreaPaddingBottom={false}>
        <FullPageNotFoundView shouldShow={_.isEmpty(props.policy)}>
            <HeaderWithCloseButton
                title={props.translate('workspace.common.bankAccount')}
                subtitle={lodashGet(props.policy, 'name')}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={Navigation.goBack}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                shouldShowBackButton
            />
            <ScrollView style={styles.flex1}>
                <Section
                    title={props.translate('workspace.bankAccount.almostDone')}
                    icon={Illustrations.BankArrow}
                >
                    <Text>
                        {props.translate('workspace.bankAccount.youreAlmostDone')}
                    </Text>
                    <Button
                        text={props.translate('workspace.bankAccount.continueWithSetup')}
                        onPress={props.continue}
                        icon={Expensicons.Bank}
                        style={[styles.mv4]}
                        iconStyles={[styles.buttonCTAIcon]}
                        shouldShowRightIcon
                        large
                        success
                    />
                    <MenuItem
                        title={props.translate('workspace.bankAccount.startOver')}
                        icon={Expensicons.RotateLeft}
                        onPress={() => BankAccounts.requestResetFreePlanBankAccount()}
                        shouldShowRightIcon
                        wrapperStyle={[styles.cardMenuItem]}
                    />
                </Section>
            </ScrollView>
        </FullPageNotFoundView>

        {props.reimbursementAccount.shouldShowResetModal && (
            <WorkspaceResetBankAccountModal
                reimbursementAccount={props.reimbursementAccount}
                onConfirm={props.startOver}
            />
        )}
    </ScreenWrapper>
);

ContinueBankAccountSetup.propTypes = propTypes;
ContinueBankAccountSetup.displayName = 'ContinueBankAccountSetup';

export default compose(
    withPolicy,
    withLocalize,
)(ContinueBankAccountSetup);
