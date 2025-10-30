import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const containerStyle = shouldUseNarrowLayout ? styles.reportLayoutGroupHeaderMobile : styles.reportLayoutGroupHeaderDesktop;
    const textStyle = shouldUseNarrowLayout ? styles.reportLayoutGroupHeaderTextMobile : styles.reportLayoutGroupHeaderText;

    const displayName = group.groupName || translate(isGroupedByTag ? 'search.noTag' : 'search.noCategory');
    const formattedAmount = convertToDisplayString(Math.abs(group.totalAmount), currency);

    // Desktop: always show checkbox, Mobile: only in selection mode
    const shouldShowCheckbox = isSelectionModeEnabled || !shouldUseNarrowLayout;

    // Conditional height: Desktop 28px, Mobile 16px (no checkbox) or 20px (with checkbox)
    const conditionalHeight = shouldUseNarrowLayout ? {height: shouldShowCheckbox ? 20 : 16} : {height: 28};

    return (
        <View style={[containerStyle, conditionalHeight, style]}>
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
                <Text
                    style={[textStyle, shouldShowCheckbox && styles.ml2]}
                    shouldUseDefaultLineHeight={false}
                >
                    {`${displayName} - ${formattedAmount}`}
                </Text>
            </View>
        </View>
    );
}

MoneyRequestReportGroupHeader.displayName = 'MoneyRequestReportGroupHeader';

export default MoneyRequestReportGroupHeader;
