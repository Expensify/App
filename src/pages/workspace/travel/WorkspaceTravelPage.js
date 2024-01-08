import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.travel')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
            isCentralPane
        >
            {(hasVBA, policyID) => (
                <View style={[styles.workspaceSection, styles.mt6]}>
                    {!hasVBA && <WorkspaceTravelNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceTravelVBAView />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceTravelPage.propTypes = propTypes;
WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default withLocalize(WorkspaceTravelPage);
