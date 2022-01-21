import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';
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

const WorkspaceTravelPage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.travel')}
        route={props.route}
        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
    >
        {(hasVBA, policyID) => (
            <>
                {!hasVBA ? (
                    <WorkspaceTravelNoVBAView policyID={policyID} />
                ) : (
                    <WorkspaceTravelVBAView />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceTravelPage.propTypes = propTypes;
WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default withLocalize(WorkspaceTravelPage);
