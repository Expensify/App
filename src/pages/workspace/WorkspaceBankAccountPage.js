import lodashGet from 'lodash/get';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

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
        this.onScreenFocus = this.onScreenFocus.bind(this);
        this.getShouldShowPage = this.getShouldShowPage.bind(this);
        this.navigateToBankAccountRoute = this.navigateToBankAccountRoute.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', this.onScreenFocus);
    }

    componentWillUnmount() {
        if (!this.unsubscribe) {
            return;
        }

        this.unsubscribe();
    }

    /**
     * When we are returning to this screen we want to check if we should go back or show the alternate view with "Continue with setup" button.
     */
    onScreenFocus() {
        if (this.getShouldShowPage()) {
            return;
        }

        this.props.navigation.goBack();
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
        if (!this.getShouldShowPage()) {
            this.navigateToBankAccountRoute();
            return null;
        }

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
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
                        menuItems={[
                            {
                                title: this.props.translate('workspace.bankAccount.continueWithSetup'),
                                icon: Expensicons.Bank,
                                onPress: this.navigateToBankAccountRoute,
                                shouldShowRightIcon: true,
                            },
                            {
                                title: this.props.translate('workspace.bankAccount.startOver'),
                                icon: Expensicons.RotateLeft,
                                onPress: BankAccounts.requestResetFreePlanBankAccount,
                                shouldShowRightIcon: true,
                            },
                        ]}
                    >
                        <Text>
                            {this.props.translate('workspace.bankAccount.youreAlmostDone')}
                        </Text>
                    </Section>
                </ScrollView>
                <WorkspaceResetBankAccountModal />
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
)(WorkspaceBankAccountPage);
