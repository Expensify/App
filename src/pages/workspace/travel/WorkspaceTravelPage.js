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
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

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

class WorkspaceTravelPage extends React.Component {
    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        return (
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={this.props.translate('workspace.common.travel')}
                route={this.props.route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
            >
                {policyID => (
                    <>
                        {!hasVBBA && (
                            <WorkspaceTravelNoVBAView policyID={policyID} />
                        )}
                        {hasVBBA && (
                            <WorkspaceTravelVBAView />
                        )}
                    </>
                )}
            </WorkspacePageWithSections>
        );
    }
}

WorkspaceTravelPage.propTypes = propTypes;
WorkspaceTravelPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withLocalize,
)(WorkspaceTravelPage);
