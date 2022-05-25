import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import BankAccount from '../../libs/models/BankAccount';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import userPropTypes from '../settings/userPropTypes';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import withFullPolicy from './withFullPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,

    /** The text to display in the header */
    headerText: PropTypes.string.isRequired,

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** From Onyx */
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** User Data from Onyx */
    user: userPropTypes,

    /** Main content of the page */
    children: PropTypes.func,

    /** Content to be added as fixed footer */
    footer: PropTypes.element,

    /** The guides call task ID to associate with the workspace page being shown */
    guidesCallTaskID: PropTypes.string,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    children: () => {},
    user: {},
    reimbursementAccount: {},
    footer: null,
    guidesCallTaskID: '',
};

class WorkspacePageWithSections extends React.Component {
    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        BankAccounts.fetchFreePlanVerifiedBankAccount('', achState);
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const isLoadingVBA = this.props.reimbursementAccount.loading;
        const hasVBA = achState === BankAccount.STATE.OPEN;
        const isUsingECard = lodashGet(this.props.user, 'isUsingExpensifyCard', false);
        const policyID = lodashGet(this.props.route, 'params.policyID');
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.headerText}
                        subtitle={policyName}
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={this.props.guidesCallTaskID}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView
                        style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                    >
                        <View style={[styles.w100, styles.flex1]}>

                            {this.props.children(isLoadingVBA, hasVBA, policyID, isUsingECard)}

                        </View>
                    </ScrollView>
                    {this.props.footer}
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

WorkspacePageWithSections.propTypes = propTypes;
WorkspacePageWithSections.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withFullPolicy,
    withNetwork(),
)(WorkspacePageWithSections);
