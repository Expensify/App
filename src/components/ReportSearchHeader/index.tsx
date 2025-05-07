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
                transactions={transactions}
                shouldUseCustomSearchTitleName
                shouldEnableDetailPageNavigation={false}
            />
        );
    }, [report, policy, transactions]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[style, styles.reportSearchHeaderBar]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>{middleContent}</View>
        </View>
    );
}

ReportSearchHeader.displayName = 'ReportSearchHeader';

export default ReportSearchHeader;
