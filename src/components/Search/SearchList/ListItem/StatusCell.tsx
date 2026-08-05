import StatusBadge from '@components/StatusBadge';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getReportStatusColorStyle, getReportStatusTooltipTranslation, getReportStatusTranslation, getStatusBadgeBackgroundColor} from '@libs/ReportUtils';

import React from 'react';
import {View} from 'react-native';

type StatusCellProps = {
    /** The stateNum of the report */
    stateNum?: number;

    /** The statusNum of the report */
    statusNum?: number;

    /** Whether the report's state/status is pending */
    isPending?: boolean;

    /** Whether the transaction is deleted */
    isDeleted?: boolean;

    /** Whether the parent row is selected */
    isSelected?: boolean;
};

function StatusCell({stateNum, statusNum, isPending, isDeleted, isSelected}: StatusCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const statusText = getReportStatusTranslation({stateNum, statusNum, isDeleted, translate});
    const reportStatusColorStyle = getReportStatusColorStyle(theme, stateNum, statusNum, isDeleted);

    if (!statusText || !reportStatusColorStyle) {
        return null;
    }

    const backgroundColor = getStatusBadgeBackgroundColor(theme, stateNum, statusNum, isDeleted, isSelected);
    const tooltipText = getReportStatusTooltipTranslation({stateNum, statusNum, isDeleted, translate});

    return (
        <View style={[styles.w100, styles.justifyContentCenter, isPending && styles.offlineFeedbackPending]}>
            <StatusBadge
                text={statusText}
                backgroundColor={backgroundColor}
                textColor={reportStatusColorStyle.textColor}
                tooltipText={tooltipText}
            />
        </View>
    );
}

export default StatusCell;
