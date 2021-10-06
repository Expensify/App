import React from 'react';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';
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

const WorkspaceCardPage = ({translate, route}) => (
    <WorkspacePageWithSections
        headerText={translate('workspace.common.card')}
        route={route}
    >
        {(hasVBA, policyID, isUsingECard) => (
            <>
                {!hasVBA && (
                    <WorkspaceCardNoVBAView policyID={policyID} />
                )}

                {hasVBA && !isUsingECard && (
                    <WorkspaceCardVBANoECardView />
                )}

                {hasVBA && isUsingECard && (
                    <WorkspaceCardVBAWithECardView />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceCardPage.propTypes = propTypes;

export default compose(
    withLocalize,
)(WorkspaceCardPage);
