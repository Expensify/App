import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type CustomListHeaderProps = {
    canSelectMultiple: boolean | undefined;
    leftHeaderText?: string | undefined;
    rightHeaderText?: string | undefined;
    rightHeaderMinimumWidth?: number;
    shouldDivideEqualWidth?: boolean;
    shouldShowRightCaret?: boolean;
    /** Adjusts for fixed width avatar component in the first column */
    shouldAdjustWidthForAvatar?: boolean;
    containerStyles?: StyleProp<ViewStyle>;
};

function CustomListHeader({
    canSelectMultiple,
    leftHeaderText = '',
    rightHeaderText = '',
    rightHeaderMinimumWidth = 60,
    shouldDivideEqualWidth = false,
    shouldShowRightCaret = false,
    shouldAdjustWidthForAvatar = false,
    containerStyles,
}: CustomListHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const header = (
        <View
            style={[
                styles.flex1,
                styles.flexRow,
                styles.justifyContentBetween,
                // Required padding accounting for the checkbox in multi-select mode
                canSelectMultiple && styles.pl3,
                containerStyles,
            ]}
        >
            {/* mr13 (margin: 52px) accounts for avatar width + spacing */}
            <Text style={[styles.textMicroSupporting, shouldDivideEqualWidth && styles.flex1, shouldAdjustWidthForAvatar && [!shouldUseNarrowLayout && styles.pr3, styles.mr13]]}>
                {leftHeaderText}
            </Text>
            <View style={[shouldDivideEqualWidth ? styles.flex1 : StyleUtils.getMinimumWidth(rightHeaderMinimumWidth), shouldShowRightCaret && styles.mr6]}>
                <Text style={[styles.textMicroSupporting, !shouldDivideEqualWidth && styles.textAlignCenter]}>{rightHeaderText}</Text>
            </View>
        </View>
    );

    if (canSelectMultiple) {
        return header;
    }
    return (
        <View
            style={[
                styles.flexRow,
                isLargeScreenWidth
                    ? [
                          styles.mh5,
                          styles.pv2,
                          styles.mnh40,
                          styles.alignItemsCenter,
                          {
                              paddingLeft: 12,
                              paddingRight: 8,
                              borderBottomWidth: 1,
                              borderColor: theme.border,
                              borderTopLeftRadius: 8,
                              borderTopRightRadius: 8,
                              backgroundColor: theme.highlightBG,
                          },
                      ]
                    : styles.baseListHeaderWrapperStyle,
            ]}
        >
            {header}
        </View>
    );
}

export default CustomListHeader;
