import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceReimburseView from './WorkspaceReimburseView';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import withPolicy, {policyPropTypes} from '../withPolicy';

const propTypes = {
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

const WorkspaceReimbursePage = props => (
    <WorkspacePageWithSections
        shouldUseScrollView
        headerText={props.translate('workspace.common.reimburse')}
        route={props.route}
        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
        shouldSkipVBBACall
    >
        {() => (
            <WorkspaceReimburseView policy={props.policy} />
        )}
    </WorkspacePageWithSections>
);

WorkspaceReimbursePage.propTypes = propTypes;
WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default compose(
    withPolicy,
    withLocalize,
)(WorkspaceReimbursePage);
