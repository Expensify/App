import PropTypes from 'prop-types';
import React from 'react';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import withPolicy, {policyPropTypes} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceReimburseView from './WorkspaceReimburseView';

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

function WorkspaceReimbursePage(props) {
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.reimburse')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
        >
            {() => <WorkspaceReimburseView policy={props.policy} />}
        </WorkspacePageWithSections>
    );
}

WorkspaceReimbursePage.propTypes = propTypes;
WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default compose(withPolicy, withLocalize)(WorkspaceReimbursePage);
