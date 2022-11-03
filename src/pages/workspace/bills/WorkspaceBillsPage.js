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
import withPolicy from '../withPolicy';
import WorkspaceBillsNoVBAView from './WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from './WorkspaceBillsVBAView';
import WorkspacePageWithSections from '../WorkspacePageWithSections';

const propTypes = {
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

class WorkspaceBillsPage extends React.Component {
    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        return (
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={this.props.translate('workspace.common.bills')}
                route={this.props.route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BILLS}
            >
                {(policyID) => (
                    <>
                        {!hasVBBA && (
                            <WorkspaceBillsNoVBAView policyID={policyID} />
                        )}
                        {hasVBBA && (
                            <WorkspaceBillsVBAView policyID={policyID} />
                        )}
                    </>
                )}
            </WorkspacePageWithSections>
        );
    }
}

WorkspaceBillsPage.propTypes = propTypes;
WorkspaceBillsPage.defaultProps = defaultProps;

export default compose(
    withPolicy,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withLocalize,
)(WorkspaceBillsPage);
