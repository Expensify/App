import React from 'react';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceBillsNoVBAView from '../bills/WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from '../bills/WorkspaceBillsVBAView';
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

const WorkspaceInvoicesPage = ({translate, route}) => (
    <WorkspacePageWithSections
        headerText={translate('workspace.common.invoices')}
        route={route}
    >
        {(hasVBA, policyID) => (
            <>
                {!hasVBA && (
                    <WorkspaceBillsNoVBAView policyID={policyID} />
                )}

                {hasVBA && (
                    <WorkspaceBillsVBAView policyID={policyID} />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceInvoicesPage.propTypes = propTypes;

export default compose(
    withLocalize,
)(WorkspaceInvoicesPage);
