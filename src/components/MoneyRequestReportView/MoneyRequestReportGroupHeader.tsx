import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import type {GroupedTransactions} from '@src/types/onyx';

type MoneyRequestReportGroupHeaderProps = {
    /** The grouped transaction data */
    group: GroupedTransactions;

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

    // Height constants for cleaner code
    const DESKTOP_HEIGHT = 28;
    const MOBILE_HEIGHT_WITH_CHECKBOX = 20;
    const MOBILE_HEIGHT_WITHOUT_CHECKBOX = 16;

    // For tags: convert colon-separated multi-level tags to comma-separated display
    const cleanedGroupName = isGroupedByTag && group.groupName ? getCommaSeparatedTagNameWithSanitizedColons(group.groupName) : group.groupName;
    const displayName = cleanedGroupName || translate(isGroupedByTag ? 'reportLayout.noTag' : 'reportLayout.uncategorized');

    // Desktop: always show checkbox, Mobile: only in selection mode
    const shouldShowCheckbox = isSelectionModeEnabled || !shouldUseNarrowLayout;

    // Conditional height based on platform and checkbox visibility
    const conditionalHeight = shouldUseNarrowLayout
        ? {height: shouldShowCheckbox ? MOBILE_HEIGHT_WITH_CHECKBOX : MOBILE_HEIGHT_WITHOUT_CHECKBOX}
        : {height: DESKTOP_HEIGHT, minHeight: DESKTOP_HEIGHT};

    // Dynamic text style based on platform and checkbox state
    const textStyle = shouldUseNarrowLayout
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
                <Text
                    style={[styles.textBold, textStyle, styles.flexShrink1, shouldShowCheckbox && styles.ml2]}
                    shouldUseDefaultLineHeight={false}
                    numberOfLines={1}
                >
                    {displayName}
                </Text>
            </View>
        </View>
    );
}

MoneyRequestReportGroupHeader.displayName = 'MoneyRequestReportGroupHeader';

export default MoneyRequestReportGroupHeader;
