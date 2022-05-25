import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceReimburseView from './WorkspaceReimburseView';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import CONST from '../../../CONST';

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

const WorkspaceReimbursePage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.reimburse')}
        route={props.route}
        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
    >
        {(isLoadingVBA, hasVBA, policyID) => (
            <WorkspaceReimburseView policyID={policyID} isLoadingVBA={isLoadingVBA} hasVBA={hasVBA} />
        )}
    </WorkspacePageWithSections>
);

WorkspaceReimbursePage.propTypes = propTypes;
WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default withLocalize(WorkspaceReimbursePage);
