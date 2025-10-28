import React, {useMemo} from 'react';
import {View} from 'react-native';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import useThemeStyles from '@hooks/useThemeStyles';
import type ReportSearchHeaderProps from './types';

function ReportSearchHeader({report, style, transactions, avatarBorderColor}: ReportSearchHeaderProps) {
    const styles = useThemeStyles();

    const middleContent = useMemo(() => {
        return (
            <AvatarWithDisplayName
                shouldDisplayStatus
                report={report}
                transactions={transactions}
                shouldUseCustomSearchTitleName
                shouldEnableDetailPageNavigation={false}
                shouldEnableAvatarNavigation={false}
                avatarBorderColor={avatarBorderColor}
            />
        );
    }, [report, transactions, avatarBorderColor]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[style, styles.reportSearchHeaderBar]}
            testID={ReportSearchHeader.displayName}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>{middleContent}</View>
        </View>
    );
}

ReportSearchHeader.displayName = 'ReportSearchHeader';

export default ReportSearchHeader;
