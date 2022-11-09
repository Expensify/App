import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import BankAccount from '../../../libs/models/BankAccount';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reimbursementAccountPropTypes from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';
import WorkspacePageWithSections from '../WorkspacePageWithSections';

const propTypes = {
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

const defaultProps = {
    reimbursementAccount: {},
};

class WorkspaceCardPage extends React.Component {
    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        return (
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={this.props.translate('workspace.common.card')}
                route={this.props.route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
            >
                {(policyID, isUsingECard) => (
                    <>
                        {!hasVBBA && (
                            <WorkspaceCardNoVBAView policyID={policyID} />
                        )}

                        {hasVBBA && !isUsingECard && (
                            <WorkspaceCardVBANoECardView />
                        )}

                        {hasVBBA && isUsingECard && (
                            <WorkspaceCardVBAWithECardView />
                        )}
                    </>
                )}
            </WorkspacePageWithSections>
        );
    }
}

WorkspaceCardPage.propTypes = propTypes;
WorkspaceCardPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withLocalize,
)(WorkspaceCardPage);
