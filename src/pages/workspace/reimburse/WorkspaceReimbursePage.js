import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceReimburseNoVBAView from './WorkspaceReimburseNoVBAView';
import WorkspaceReimburseVBAView from './WorkspaceReimburseVBAView';
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

const WorkspaceReimbursePage = ({translate, route}) => (
    <WorkspacePageWithSections
        headerText={translate('workspace.common.reimburse')}
        route={route}
    >
        {(hasVBA, policyID) => (
            <>
                {!hasVBA ? (
                    <WorkspaceReimburseNoVBAView policyID={policyID} />
                ) : (
                    <WorkspaceReimburseVBAView policyID={policyID} />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceReimbursePage.propTypes = propTypes;
WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default withLocalize(WorkspaceReimbursePage);
