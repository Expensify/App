import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Styles} from '@styles/index';

type ReportDateIndicatorProps = {
    style: Styles;
    created: string;
};

function ReportDateIndicator({style = {}, created}: ReportDateIndicatorProps) {
    const {datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.pv2, styles.cursorDefault, style]}>
            <View style={[styles.pv2, styles.chatItemDateIndicator]}>
                <Text style={styles.chatItemDateIndicatorText}>{datetimeToCalendarTime(created, false)}</Text>
            </View>
        </View>
    );
}

ReportDateIndicator.displayName = 'ReportDateIndicator';

export default ReportDateIndicator;
