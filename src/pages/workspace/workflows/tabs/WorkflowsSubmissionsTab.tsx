import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField, setWorkspaceAutoHarvesting} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCorrectedAutoReportingFrequency} from '@libs/PolicyUtils';

import {getAutoReportingFrequencyDisplayNames} from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';

import WorkflowsSectionCard from './WorkflowsSectionCard';

type WorkflowsSubmissionsTabProps = {
    policyID: string;
};

function WorkflowsSubmissionsTab({policyID}: WorkflowsSubmissionsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteWorkflows, showReadOnlyModal, withReadOnlyFallback: withWorkflowsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);

    const hasDelayedSubmissionError = !!(policy?.errorFields?.autoReporting ?? policy?.errorFields?.autoReportingFrequency);
    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policyID)), [policyID]);

    const onToggle = (isEnabled: boolean) => {
        if (!canWriteWorkflows) {
            showReadOnlyModal();
            return;
        }
        if (!policy) {
            return;
        }
        setWorkspaceAutoHarvesting(policy, isEnabled);
    };

    return (
        <WorkflowsSectionCard
            title={translate('workflowsPage.submissionFrequency')}
            subtitle={translate('workflowsPage.submissionFrequencyDescription')}
            switchAccessibilityLabel={translate('workflowsPage.submissionFrequencyDescription')}
            onToggle={onToggle}
            subMenuItems={
                <MenuItemWithTopDescription
                    title={getAutoReportingFrequencyDisplayNames(translate)[getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]}
                    titleStyle={styles.textNormalThemeText}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    onPress={onPressAutoReportingFrequency}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_FREQUENCY}
                    // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
                    description={translate('common.frequency')}
                    shouldShowRightIcon={canWriteWorkflows}
                    interactive={canWriteWorkflows}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                    brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
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
