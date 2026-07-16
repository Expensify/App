import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import AddExpenseActionButton from './AddExpenseActionButton';
import ApproveActionButton from './ApproveActionButton';
import ExportActionButton from './ExportActionButton';
import {useReportPreviewActions, useReportPreviewActionState, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';
import PayActionButton from './PayActionButton';
import SubmitActionButton from './SubmitActionButton';

function ReportPreviewActionButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {reportPreviewAction, connectedIntegration} = useReportPreviewActionState();
    const {buttonMaxWidth} = useReportPreviewUIState();
    const {openReportFromPreview} = useReportPreviewActions();

    const renderButton = () => {
        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT) {
            return <SubmitActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE) {
            return <ApproveActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY) {
            return <PayActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING && connectedIntegration) {
            return <ExportActionButton />;
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE) {
            return <AddExpenseActionButton />;
        }

        return (
            <Button
                text={translate('common.view')}
                onPress={openReportFromPreview}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.VIEW_BUTTON}
            />
        );
    };

    return <View style={[buttonMaxWidth, styles.flex1, {height: variables.h40}]}>{renderButton()}</View>;
}

export default ReportPreviewActionButton;
