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
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import withPolicy from '../withPolicy';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

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

    ...withLocalizePropTypes,
};

class WorkspaceTravelPage extends React.Component {
    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        const policyName = lodashGet(this.props.policy, 'name');
        const policyID = lodashGet(this.props.route, 'params.policyID');
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.travel')}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
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
                            <WorkspaceTravelNoVBAView policyID={policyID} />
                        )}
                        {hasVBBA && (
                            <WorkspaceTravelVBAView />
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

WorkspaceCardPage.defaultProps = defaultProps;
WorkspaceTravelPage.propTypes = propTypes;

export default compose(
    withPolicy,
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceTravelPage);
