import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import BankAccount from '../../../libs/models/BankAccount';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../ONYXKEYS';
import reimbursementAccountPropTypes from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withPolicy from '../withPolicy';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';
import userPropTypes from '../../settings/userPropTypes';

const propTypes = {
    /** From Onyx */
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** User Data from Onyx */
    user: userPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
    user: {},
};

class WorkspaceCardPage extends React.Component {
    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        const policyName = lodashGet(this.props.policy, 'name');
        const policyID = lodashGet(this.props.route, 'params.policyID');
        const isUsingECard = lodashGet(this.props.user, 'isUsingExpensifyCard', false);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.card')}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={[styles.w100, styles.flex1]}>
                        {!hasVBBA && (
                            <WorkspaceCardNoVBAView policyID={policyID} />
                        )}

                        {hasVBBA && !isUsingECard && (
                            <WorkspaceCardVBANoECardView />
                        )}

                        {hasVBBA && isUsingECard && (
                            <WorkspaceCardVBAWithECardView />
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

WorkspaceCardPage.defaultProps = defaultProps;
WorkspaceCardPage.propTypes = propTypes;

export default compose(
    withPolicy,
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardPage);
