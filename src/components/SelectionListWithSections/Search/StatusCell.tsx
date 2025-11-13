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

    if (!statusText || !reportStatusColorStyle) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.justifyContentCenter]}>
            <View
                style={[
                    styles.reportStatusContainer,
                    {
                        backgroundColor: reportStatusColorStyle.backgroundColor,
                    },
                ]}
            >
                <Text style={[styles.reportStatusText, {color: reportStatusColorStyle.textColor}]}>{statusText}</Text>
            </View>
        </View>
    );
}

StatusCell.displayName = 'StatusCell';

export default StatusCell;
