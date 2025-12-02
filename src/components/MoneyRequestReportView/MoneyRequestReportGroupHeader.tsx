import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {GroupedTransactions} from '@src/types/onyx';

// Height constants
const DESKTOP_HEIGHT = 28;
const MOBILE_HEIGHT_WITH_CHECKBOX = 20;
const MOBILE_HEIGHT_WITHOUT_CHECKBOX = 16;

type MoneyRequestReportGroupHeaderProps = {
    /** The grouped transaction data */
    group: GroupedTransactions;

    /** The group key for toggle callback */
    groupKey: string;

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

    /** Whether the checkbox should be disabled (e.g., all transactions are pending delete) */
    isDisabled?: boolean;

    /** Callback when group checkbox is toggled - receives groupKey */
    onToggleSelection?: (groupKey: string) => void;
};

function MoneyRequestReportGroupHeader({
    group,
    groupKey,
    currency,
    isGroupedByTag = false,
    isSelectionModeEnabled = false,
    isSelected = false,
    isIndeterminate = false,
    isDisabled = false,
    onToggleSelection,
}: MoneyRequestReportGroupHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const cleanedGroupName = isGroupedByTag && group.groupName ? getCommaSeparatedTagNameWithSanitizedColons(group.groupName) : group.groupName;
    const displayName = cleanedGroupName || translate(isGroupedByTag ? 'reportLayout.noTag' : 'reportLayout.uncategorized');
    const formattedAmount = convertToDisplayString(group.subTotalAmount, currency);

    const shouldShowCheckbox = isSelectionModeEnabled || !shouldUseNarrowLayout;

    const conditionalHeight = useMemo(
        () => (shouldUseNarrowLayout ? {height: shouldShowCheckbox ? MOBILE_HEIGHT_WITH_CHECKBOX : MOBILE_HEIGHT_WITHOUT_CHECKBOX} : {height: DESKTOP_HEIGHT, minHeight: DESKTOP_HEIGHT}),
        [shouldUseNarrowLayout, shouldShowCheckbox],
    );

    const textStyle = useMemo(
        () =>
            shouldUseNarrowLayout
                ? {fontSize: variables.fontSizeLabel, lineHeight: shouldShowCheckbox ? MOBILE_HEIGHT_WITH_CHECKBOX : MOBILE_HEIGHT_WITHOUT_CHECKBOX}
                : {fontSize: variables.fontSizeNormal, lineHeight: DESKTOP_HEIGHT},
        [shouldUseNarrowLayout, shouldShowCheckbox],
    );

    const handleToggleSelection = useCallback(() => {
        onToggleSelection?.(groupKey);
    }, [onToggleSelection, groupKey]);

    return (
        <View style={[styles.reportLayoutGroupHeader, conditionalHeight]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                {shouldShowCheckbox && (
                    <Checkbox
                        isChecked={isSelected}
                        isIndeterminate={isIndeterminate}
                        disabled={isDisabled}
                        onPress={handleToggleSelection}
                        accessibilityLabel={translate('reportLayout.selectGroup', {groupName: displayName})}
                        style={styles.mr2}
                    />
                )}
                <Text
                    style={[styles.textBold, textStyle, styles.flexShrink1, shouldShowCheckbox && styles.ml2]}
                    numberOfLines={1}
                >
                    {displayName}
                </Text>
                <Text style={[styles.textBold, textStyle, styles.mh1]}>{CONST.DOT_SEPARATOR}</Text>
                <Text style={[styles.textBold, textStyle]}>{formattedAmount}</Text>
            </View>
        </View>
    );
}

MoneyRequestReportGroupHeader.displayName = 'MoneyRequestReportGroupHeader';

export default MoneyRequestReportGroupHeader;
