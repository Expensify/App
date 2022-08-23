import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as Illustrations from '../../components/Icon/Illustrations';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import compose from '../../libs/compose';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import Section from '../../components/Section';
import WorkspaceResetBankAccountModal from './WorkspaceResetBankAccountModal';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import withFullPolicy from './withFullPolicy';
import Button from '../../components/Button';
import MenuItem from '../../components/MenuItem';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {
        loading: true,
    },
};

class WorkspaceBankAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.getShouldShowPage = this.getShouldShowPage.bind(this);
        this.navigateToBankAccountRoute = this.navigateToBankAccountRoute.bind(this);
    }

    componentDidMount() {
        if (this.getShouldShowPage()) {
            return;
        }
        this.navigateToBankAccountRoute();
    }

    /**
     * If we have an open bank account or no bank account at all then we will immediately redirect the user to /bank-account to display the next step
     *
     * @returns {Boolean}
     */
    getShouldShowPage() {
        const state = lodashGet(this.props.reimbursementAccount, 'achData.state');
        return lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') && state !== BankAccount.STATE.OPEN;
    }

    /**
     * Navigate to the bank account route
     */
    navigateToBankAccountRoute() {
        Navigation.navigate(ROUTES.getBankAccountRoute());
    }

    render() {
        return (
            <ScreenWrapper>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.policy)}>
                    <HeaderWithCloseButton
                        title={this.props.translate('workspace.common.bankAccount')}
                        subtitle={lodashGet(this.props.policy, 'name')}
                        onCloseButtonPress={Navigation.dismissModal}
                        onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(this.props.route.params.policyID))}
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
                            onPress={this.navigateToBankAccountRoute}
                            icon={Expensicons.Bank}
                            style={[styles.mh3, styles.mt2]}
                            iconStyles={[styles.mr5]}
                            shouldShowRightIcon
                            extraLarge
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

WorkspaceBankAccountPage.propTypes = propTypes;
WorkspaceBankAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withFullPolicy,
)(WorkspaceBankAccountPage);
