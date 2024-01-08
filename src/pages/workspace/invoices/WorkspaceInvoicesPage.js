import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
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

function WorkspaceInvoicesPage(props) {
    const styles = useThemeStyles();
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={props.translate('workspace.common.invoices')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INVOICES}
            isCentralPane
        >
            {(hasVBA, policyID) => (
                <View style={[styles.workspaceSection, styles.mt6]}>
                    {!hasVBA && <WorkspaceInvoicesNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceInvoicesVBAView policyID={policyID} />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceInvoicesPage.propTypes = propTypes;
WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';

export default withLocalize(WorkspaceInvoicesPage);
