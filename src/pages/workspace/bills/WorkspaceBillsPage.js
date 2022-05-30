import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceBillsNoVBAView from './WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from './WorkspaceBillsVBAView';
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

const WorkspaceBillsPage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.bills')}
        route={props.route}
        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BILLS}
    >
        {(isLoadingVBA, hasVBA, policyID) => (
            <>
                {!isLoadingVBA && !hasVBA && (
                    <WorkspaceBillsNoVBAView policyID={policyID} />
                )}
                {!isLoadingVBA && hasVBA && (
                    <WorkspaceBillsVBAView policyID={policyID} />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceBillsPage.propTypes = propTypes;
WorkspaceBillsPage.displayName = 'WorkspaceBillsPage';
export default withLocalize(WorkspaceBillsPage);
