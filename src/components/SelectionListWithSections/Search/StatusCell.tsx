import React, {useMemo} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
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
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const statusText = useMemo(() => getReportStatusTranslation({stateNum, statusNum, translate}), [stateNum, statusNum, translate]);
    const reportStatusColorStyle = useMemo(() => getReportStatusColorStyle(theme, stateNum, statusNum), [theme, stateNum, statusNum]);

    const badgeStyles = useMemo(
        () => [styles.ml0, styles.alignSelfStart, styles.borderNone, StyleUtils.getBackgroundColorStyle(reportStatusColorStyle?.backgroundColor ?? theme.transparent)],
        [styles.ml0, styles.alignSelfStart, styles.borderNone, StyleUtils, reportStatusColorStyle?.backgroundColor, theme.transparent],
    );

    const textStyles = useMemo(
        () => [styles.fontWeightNormal, StyleUtils.getColorStyle((reportStatusColorStyle?.textColor ?? theme.text) as string)],
        [styles.fontWeightNormal, StyleUtils, reportStatusColorStyle?.textColor, theme.text],
    );

    if (!statusText || !reportStatusColorStyle) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.justifyContentCenter, isPending && styles.offlineFeedbackPending]}>
            <Badge
                text={statusText}
                isCondensed
                badgeStyles={badgeStyles}
                textStyles={textStyles}
            />
        </View>
    );
}

export default StatusCell;
