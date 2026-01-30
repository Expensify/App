import React, {useMemo} from 'react';
import {View} from 'react-native';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type ReportSearchHeaderProps from './types';

function ReportSearchHeader({report, style, transactions, avatarBorderColor}: ReportSearchHeaderProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const statusContainerStyle = useMemo(() => {
        return [isLargeScreenWidth ? styles.mt1 : styles.mt0Half, report?.shouldShowStatusAsPending && styles.offlineFeedbackPending];
    }, [isLargeScreenWidth, styles.mt1, styles.mt0Half, report?.shouldShowStatusAsPending, styles.offlineFeedbackPending]);

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
                customDisplayNameStyle={styles.fontWeightNormal}
                parentNavigationSubtitleTextStyles={[styles.textLineHeightNormal, styles.minHeight4, styles.mt1, !isLargeScreenWidth && styles.textMicro]}
                parentNavigationStatusContainerStyles={statusContainerStyle}
            />
        );
    }, [
        report,
        transactions,
        avatarBorderColor,
        styles.fontWeightNormal,
        styles.textLineHeightNormal,
        styles.minHeight4,
        styles.mt1,
        isLargeScreenWidth,
        styles.textMicro,
        statusContainerStyle,
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
