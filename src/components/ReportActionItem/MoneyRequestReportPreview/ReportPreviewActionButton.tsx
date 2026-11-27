import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import AddExpenseActionButton from './AddExpenseActionButton';
import ApproveActionButton from './ApproveActionButton';
import ExportActionButton from './ExportActionButton';
import {useReportPreviewActions, useReportPreviewActionState, useReportPreviewAnimationState, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';
import PayActionButton from './PayActionButton';
import SubmitActionButton from './SubmitActionButton';

function ReportPreviewActionButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {reportPreviewAction, connectedIntegration} = useReportPreviewActionState();
    const {buttonMaxWidth} = useReportPreviewUIState();
    const {openReportFromPreview} = useReportPreviewActions();
    const {isApprovedAnimationRunning} = useReportPreviewAnimationState();
    const isApprovingWithViolations = reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS;

    // The approval animation switches the action to Pay as soon as it starts, so the last action before the animation
    // decides the button colors until it finishes. Otherwise View and the "Approved" button swap colors mid animation.
    const [wasApprovingWithViolations, setWasApprovingWithViolations] = useState(isApprovingWithViolations);
    if (!isApprovedAnimationRunning && wasApprovingWithViolations !== isApprovingWithViolations) {
        setWasApprovingWithViolations(isApprovingWithViolations);
    }
    const shouldPrioritizeView = isApprovingWithViolations || (isApprovedAnimationRunning && wasApprovingWithViolations);

    const renderPrimaryButton = () => {
        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT) {
            return <SubmitActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE || isApprovingWithViolations) {
            return <ApproveActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY) {
            return <PayActionButton isSecondary={shouldPrioritizeView} />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING && connectedIntegration) {
            return <ExportActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE) {
            return <AddExpenseActionButton />;
        }

        return null;
    };

    const primaryButton = renderPrimaryButton();

    const viewButton = (
        <Button
            // View sits alone or after the primary action, so the key keeps it mounted when the primary action appears. Otherwise React remounts it by position and a focused View loses keyboard focus.
            key="view"
            variant={shouldPrioritizeView ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
            // Only flex View when it shares the row with a primary action. A lone View sits in a column with no fixed height, where flex: 1 collapses it on iOS Safari and cuts off the button.
            style={primaryButton ? styles.flex1 : undefined}
            onPress={openReportFromPreview}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.VIEW_BUTTON}
        >
            <Button.Text>{translate('common.view')}</Button.Text>
        </Button>
    );

    const primaryButtonContainer = <View style={[styles.flex1]}>{primaryButton}</View>;

    if (!primaryButton) {
        return <View style={[buttonMaxWidth, styles.flex1, styles.reportPreviewActionRow]}>{viewButton}</View>;
    }

    return (
        <View style={[buttonMaxWidth, styles.flex1, styles.flexRow, styles.gap2, styles.reportPreviewActionRow]}>
            {primaryButtonContainer}
            {viewButton}
        </View>
    );
}

export default ReportPreviewActionButton;
