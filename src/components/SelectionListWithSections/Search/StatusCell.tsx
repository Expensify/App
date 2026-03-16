import React, {useMemo} from 'react';
import {View} from 'react-native';
import StatusBadge from '@components/StatusBadge';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportStatusColorStyle, getReportStatusTranslation} from '@libs/ReportUtils';

type StatusCellProps = {
    /** The stateNum of the report */
    stateNum?: number;

    /** The statusNum of the report */
    statusNum?: number;

    /** Whether the report's state/status is pending */
    isPending?: boolean;
};

function StatusCell({stateNum, statusNum, isPending}: StatusCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const statusText = useMemo(() => getReportStatusTranslation({stateNum, statusNum, translate}), [stateNum, statusNum, translate]);
    const reportStatusColorStyle = useMemo(() => getReportStatusColorStyle(theme, stateNum, statusNum), [theme, stateNum, statusNum]);

    if (!statusText || !reportStatusColorStyle) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.justifyContentCenter, isPending && styles.offlineFeedbackPending]}>
            <StatusBadge
                text={statusText}
                backgroundColor={reportStatusColorStyle.backgroundColor}
                textColor={reportStatusColorStyle.textColor}
            />
        </View>
    );
}

export default StatusCell;
