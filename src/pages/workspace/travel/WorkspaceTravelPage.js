import PropTypes from 'prop-types';
import React from 'react';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

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

function WorkspaceTravelPage(props) {
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.travel')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
        >
            {(hasVBA, policyID) => (
                <>
                    {!hasVBA && <WorkspaceTravelNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceTravelVBAView />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceTravelPage.propTypes = propTypes;
WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default withLocalize(WorkspaceTravelPage);
