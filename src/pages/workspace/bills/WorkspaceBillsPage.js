import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
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

const WorkspaceBillsPage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.bills')}
        route={props.route}
    >
        {(hasVBA, policyID) => (
            <>
                {!hasVBA ? (
                    <WorkspaceBillsNoVBAView policyID={policyID} />
                ) : (
                    <WorkspaceBillsVBAView policyID={policyID} />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceBillsPage.propTypes = propTypes;
WorkspaceBillsPage.displayName = 'WorkspaceBillsPage';
export default withLocalize(WorkspaceBillsPage);
