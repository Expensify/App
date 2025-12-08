import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportStatusColorStyle, getReportStatusTranslation} from '@libs/ReportUtils';

type StatusCellProps = {
    /** The stateNum of the report */
    stateNum?: number;

    /** The statusNum of the report */
    statusNum?: number;
};

function StatusCell({stateNum, statusNum}: StatusCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const statusText = useMemo(() => getReportStatusTranslation({stateNum, statusNum, translate}), [stateNum, statusNum, translate]);
    const reportStatusColorStyle = useMemo(() => getReportStatusColorStyle(theme, stateNum, statusNum), [theme, stateNum, statusNum]);

    const backgroundColorStyle = useMemo(
        () => ({
            backgroundColor: reportStatusColorStyle?.backgroundColor,
        }),
        [reportStatusColorStyle?.backgroundColor],
    );

    const textColorStyle = useMemo(
        () => ({
            color: reportStatusColorStyle?.textColor,
        }),
        [reportStatusColorStyle?.textColor],
    );

    if (!statusText || !reportStatusColorStyle) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.justifyContentCenter]}>
            <View style={[styles.reportStatusContainer, backgroundColorStyle]}>
                <Text style={[styles.reportStatusText, textColorStyle]}>{statusText}</Text>
            </View>
        </View>
    );
}

StatusCell.displayName = 'StatusCell';

export default StatusCell;
