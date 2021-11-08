import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import WorkspaceInvoicesNoVBAView from './WorkspaceInvoicesNoVBAView';
import WorkspaceInvoicesVBAView from './WorkspaceInvoicesVBAView';

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

const WorkspaceInvoicesPage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.invoices')}
        route={props.route}
    >
        {(hasVBA, policyID) => (
            <>
                {!hasVBA ? (
                    <WorkspaceInvoicesNoVBAView policyID={policyID} />
                ) : (
                    <WorkspaceInvoicesVBAView policyID={policyID} />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceInvoicesPage.propTypes = propTypes;
WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';

export default withLocalize(WorkspaceInvoicesPage);
