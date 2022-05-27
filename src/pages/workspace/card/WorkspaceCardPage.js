import React from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';
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

const WorkspaceCardPage = props => (
    <WorkspacePageWithSections
        headerText={props.translate('workspace.common.card')}
        route={props.route}
        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
    >
        {(isLoadingVBA, hasVBA, policyID, isUsingECard) => (
            <>
                {!isLoadingVBA && !hasVBA && (
                    <WorkspaceCardNoVBAView policyID={policyID} />
                )}

                {!isLoadingVBA && hasVBA && !isUsingECard && (
                    <WorkspaceCardVBANoECardView />
                )}

                {!isLoadingVBA && hasVBA && isUsingECard && (
                    <WorkspaceCardVBAWithECardView />
                )}
            </>
        )}
    </WorkspacePageWithSections>
);

WorkspaceCardPage.propTypes = propTypes;
WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default withLocalize(WorkspaceCardPage);
