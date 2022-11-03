import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import * as BankAccounts from '../../libs/actions/BankAccounts';
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
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';

const propTypes = {
    continue: PropTypes.func.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class ContinueBankAccountSetup extends React.Component {
    render() {
        return (
            <ScreenWrapper>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.policy)}>
                    <HeaderWithCloseButton
                        title={this.props.translate('workspace.common.bankAccount')}
                        subtitle={lodashGet(this.props.policy, 'name')}
                        onCloseButtonPress={Navigation.dismissModal}
                        onBackButtonPress={Navigation.goBack}
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                        shouldShowBackButton
                    />
                    <ScrollView style={styles.flex1}>
                        <Section
                            title={this.props.translate('workspace.bankAccount.almostDone')}
                            icon={Illustrations.BankArrowPink}
                        >
                            <Text>
                                {this.props.translate('workspace.bankAccount.youreAlmostDone')}
                            </Text>
                        </Section>
                        <Button
                            text={this.props.translate('workspace.bankAccount.continueWithSetup')}
                            onPress={this.props.continue}
                            icon={Expensicons.Bank}
                            style={[styles.mt2, styles.buttonCTA]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            large
                            success
                        />
                        <MenuItem
                            title={this.props.translate('workspace.bankAccount.startOver')}
                            icon={Expensicons.RotateLeft}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            shouldShowRightIcon
                        />
                    </ScrollView>
                    <WorkspaceResetBankAccountModal />
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ContinueBankAccountSetup.propTypes = propTypes;

export default compose(
    withPolicy,
    withLocalize,
)(ContinueBankAccountSetup);
