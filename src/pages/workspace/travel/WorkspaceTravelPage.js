import React from 'react';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withFullPolicy from '../withFullPolicy';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
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

const WorkspaceTravelPage = ({translate, route}) => (
    <WorkspacePageWithSections
        headerText={translate('workspace.common.travel')}
        route={route}
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

export default compose(
    withLocalize,
    withFullPolicy,
)(WorkspaceTravelPage);
