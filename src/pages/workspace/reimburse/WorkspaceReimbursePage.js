import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import BankAccount from '../../../libs/models/BankAccount';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import reimbursementAccountPropTypes from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import withPolicy, {policyPropTypes} from '../withPolicy';
import WorkspaceReimburseView from './WorkspaceReimburseView';
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

    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
};

const WorkspaceReimbursePage = (props) => {
    const achState = lodashGet(props.reimbursementAccount, 'achData.state', '');
    const hasVBBA = achState === BankAccount.STATE.OPEN;
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.reimburse')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
        >
            {() => (
                <WorkspaceReimburseView policy={props.policy} hasVBBA={hasVBBA}/>
            )}
        </WorkspacePageWithSections>
    );
};

WorkspaceReimbursePage.propTypes = propTypes;
WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default compose(
    withPolicy,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withLocalize,
)(WorkspaceReimbursePage);
