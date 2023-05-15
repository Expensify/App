import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
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
import OfflineWithFeedback from '../../components/OfflineWithFeedback';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Callback to continue to the next step of the setup */
    continue: PropTypes.func.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    /* The workspace name */
    policyName: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {policyName: ''};

const ContinueBankAccountSetup = (props) => {
    const errors = lodashGet(props.reimbursementAccount, 'errors', {});
    const pendingAction = lodashGet(props.reimbursementAccount, 'pendingAction', null);
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <FullPageNotFoundView shouldShow={_.isEmpty(props.policy)}>
                <HeaderWithCloseButton
                    title={props.translate('workspace.common.bankAccount')}
                    subtitle={props.policyName}
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
                        <OfflineWithFeedback
                            pendingAction={pendingAction}
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
            </FullPageNotFoundView>

            {props.reimbursementAccount.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={props.reimbursementAccount} />}
        </ScreenWrapper>
    );
};

ContinueBankAccountSetup.propTypes = propTypes;
ContinueBankAccountSetup.defaultProps = defaultProps;
ContinueBankAccountSetup.displayName = 'ContinueBankAccountSetup';

export default compose(withPolicy, withLocalize)(ContinueBankAccountSetup);
