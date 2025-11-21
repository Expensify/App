import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import variables from '@styles/variables';
import type {GroupedTransactions} from '@src/types/onyx';

type MoneyRequestReportGroupHeaderProps = {
    /** The grouped transaction data */
    group: GroupedTransactions;

    /** Currency code for amount formatting */
    currency: string;

    /** Whether grouping by tag (if false, grouping by category) */
    isGroupedByTag?: boolean;

    /** Whether selection mode is active (checkboxes should be visible) */
    isSelectionModeEnabled?: boolean;

    /** Whether all transactions in this group are selected */
    isSelected?: boolean;

    /** Whether some (but not all) transactions in this group are selected */
    isIndeterminate?: boolean;

    /** Callback when group checkbox is toggled */
    onToggleSelection?: () => void;

    /** Additional styles to apply */
    style?: StyleProp<ViewStyle>;
};

function MoneyRequestReportGroupHeader({
    group,
    currency,
    isGroupedByTag = false,
    isSelectionModeEnabled = false,
    isSelected = false,
    isIndeterminate = false,
    onToggleSelection,
    style,
}: MoneyRequestReportGroupHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    const displayName = group.groupName || translate(isGroupedByTag ? 'search.noTag' : 'search.noCategory');
    const formattedAmount = convertToDisplayString(Math.abs(group.totalAmount), currency);

    // Use isSmallScreenWidth for mobile detection instead of shouldUseNarrowLayout
    // because shouldUseNarrowLayout may be true on desktop in certain navigation contexts
    const shouldShowCheckbox = isSelectionModeEnabled || !isSmallScreenWidth;

    const DESKTOP_HEIGHT = 28;
    const MOBILE_HEIGHT_WITH_CHECKBOX = 20;
    const MOBILE_HEIGHT_WITHOUT_CHECKBOX = 16;

    const conditionalHeight = isSmallScreenWidth
        ? {height: shouldShowCheckbox ? MOBILE_HEIGHT_WITH_CHECKBOX : MOBILE_HEIGHT_WITHOUT_CHECKBOX}
        : {height: DESKTOP_HEIGHT, minHeight: DESKTOP_HEIGHT};

    const textStyle = isSmallScreenWidth
        ? {fontSize: variables.fontSizeLabel, lineHeight: shouldShowCheckbox ? MOBILE_HEIGHT_WITH_CHECKBOX : MOBILE_HEIGHT_WITHOUT_CHECKBOX}
        : {fontSize: variables.fontSizeNormal, lineHeight: DESKTOP_HEIGHT};

    return (
        <View style={[styles.reportLayoutGroupHeader, conditionalHeight, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                {shouldShowCheckbox && (
                    <Checkbox
                        isChecked={isSelected}
                        isIndeterminate={isIndeterminate}
                        onPress={onToggleSelection ?? (() => {})}
                        accessibilityLabel={translate('reportLayout.selectGroup', {groupName: displayName})}
                        style={styles.mr2}
                    />
                )}
                <Text style={[styles.textBold, textStyle, shouldShowCheckbox && styles.ml2]}>{`${displayName} - ${formattedAmount}`}</Text>
            </View>
        </View>
    );
}

MoneyRequestReportGroupHeader.displayName = 'MoneyRequestReportGroupHeader';

export default MoneyRequestReportGroupHeader;
