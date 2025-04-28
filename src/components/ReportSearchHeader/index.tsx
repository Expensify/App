import React, {useMemo} from 'react';
import {View} from 'react-native';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import useThemeStyles from '@hooks/useThemeStyles';
import type ReportSearchHeaderProps from './types';

function ReportSearchHeader({report, policy, style, transactions}: ReportSearchHeaderProps) {
    const styles = useThemeStyles();

    const middleContent = useMemo(() => {
        return (
            <AvatarWithDisplayName
                report={report}
                policy={policy}
                shouldEnableDetailPageNavigation
                transactions={transactions}
                useCustomSearchTitleName
            />
        );
    }, [report, policy, transactions]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[styles.headerBar, style]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>{middleContent}</View>
        </View>
    );
}

ReportSearchHeader.displayName = 'ReportSearchHeader';

export default ReportSearchHeader;
