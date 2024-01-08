import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceBillsNoVBAView from './WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from './WorkspaceBillsVBAView';

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

function WorkspaceBillsPage(props) {
    const styles = useThemeStyles();
    const {isMobileScreenWidth} = useWindowDimensions();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.bills')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BILLS}
        >
            {(hasVBA, policyID) => (
                <View style={[styles.mt6, isMobileScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {!hasVBA && <WorkspaceBillsNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceBillsVBAView policyID={policyID} />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceBillsPage.propTypes = propTypes;
WorkspaceBillsPage.displayName = 'WorkspaceBillsPage';
export default withLocalize(WorkspaceBillsPage);
