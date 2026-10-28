import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField, setWorkspaceAutoHarvesting} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCorrectedAutoReportingFrequency} from '@libs/PolicyUtils';

import {getAutoReportingFrequencyDisplayNames} from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

import WorkflowsSectionCard from './WorkflowsSectionCard';

type WorkflowsSubmissionsTabProps = {
    policyID: string;
};

function WorkflowsSubmissionsTab({policyID}: WorkflowsSubmissionsTabProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteWorkflows, showReadOnlyModal, withReadOnlyFallback: withWorkflowsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);

    const hasDelayedSubmissionError = !!(policy?.errorFields?.autoReporting ?? policy?.errorFields?.autoReportingFrequency);
    const onPressAutoReportingFrequency = () => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policyID));

    const onToggle = (isEnabled: boolean) => {
        if (!canWriteWorkflows) {
            showReadOnlyModal();
            return;
        }
        if (!policy) {
            return;
        }
        setWorkspaceAutoHarvesting(policy, isEnabled, getReviewWorkspaceSettingsTaskCompletion());
    };

    return (
        <WorkflowsSectionCard
            title={translate('workflowsPage.submissionFrequency')}
            subtitle={translate('workflowsPage.submissionFrequencyDescription')}
            switchAccessibilityLabel={translate('workflowsPage.submissionFrequencyDescription')}
            onToggle={onToggle}
            subMenuItems={
                <View style={[styles.mt3, styles.mbn3]}>
                    <MenuItemSectionRoot
                        onPress={canWriteWorkflows ? callFunctionIfActionIsAllowed(onPressAutoReportingFrequency, false, session) : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_FREQUENCY}
                    >
                        <MenuItemField.Row
                            name={translate('common.frequency')}
                            value={getAutoReportingFrequencyDisplayNames(translate)[getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]}
                        >
                            <>
                                {hasDelayedSubmissionError && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                                {canWriteWorkflows && <MenuItem.Chevron />}
                            </>
                        </MenuItemField.Row>
                    </MenuItemSectionRoot>
                </View>
            }
            isActive={(policy?.autoReporting && !hasDelayedSubmissionError) ?? false}
            pendingAction={policy?.pendingFields?.autoReporting ?? policy?.pendingFields?.autoReportingFrequency}
            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING)}
            onCloseError={() => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING)}
            disabled={!canWriteWorkflows}
            disabledAction={withWorkflowsReadOnlyFallback()}
            showLockIcon={!canWriteWorkflows}
        />
    );
}

export default WorkflowsSubmissionsTab;
