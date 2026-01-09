import React, {useMemo} from 'react';
import {View} from 'react-native';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type ReportSearchHeaderProps from './types';

function ReportSearchHeader({report, style, transactions, avatarBorderColor, personalDetailsList}: ReportSearchHeaderProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();

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
                personalDetailsList={personalDetailsList}
                customDisplayNameStyle={styles.fontWeightNormal}
                parentNavigationSubtitleTextStyles={[styles.textLineHeightNormal, styles.minHeight4, styles.mt1, !isLargeScreenWidth && styles.textMicro]}
                parentNavigationStatusContainerStyles={isLargeScreenWidth ? styles.mt1 : styles.mt0Half}
            />
        );
    }, [
        report,
        transactions,
        avatarBorderColor,
        personalDetailsList,
        styles.fontWeightNormal,
        styles.textLineHeightNormal,
        styles.minHeight4,
        styles.mt1,
        isLargeScreenWidth,
        styles.textMicro,
        styles.mt0Half,
    ]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[style, styles.reportSearchHeaderBar]}
            testID="ReportSearchHeader"
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween]}>{middleContent}</View>
        </View>
    );
}

export default ReportSearchHeader;
