import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Styles} from '@src/styles';

type ReportDateIndicatorProps = {
    style?: Styles;
    created: number;
};

function ReportDateIndicator({style = {}, created}: ReportDateIndicatorProps) {
    const {timestampToCalendarTime} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.pv2, styles.cursorDefault, style]}>
            <View style={[styles.pv2, styles.chatItemDateIndicator]}>
                <Text style={styles.chatItemDateIndicatorText}>{timestampToCalendarTime(created, false)}</Text>
            </View>
        </View>
    );
}

ReportDateIndicator.displayName = 'ReportDateIndicator';

export default ReportDateIndicator;
