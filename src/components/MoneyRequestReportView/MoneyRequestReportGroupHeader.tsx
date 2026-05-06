import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {GroupedTransactions} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

const DESKTOP_HEIGHT = 28;

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

    /** Pending action for offline feedback styling (Pattern B - Optimistic WITH Feedback) */
    pendingAction?: PendingAction;

    /** Whether to use narrow layout */
    shouldUseNarrowLayout?: boolean;
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
    pendingAction,
    shouldUseNarrowLayout: shouldUseNarrowLayoutProp,
}: MoneyRequestReportGroupHeaderProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutHook} = useResponsiveLayoutOnWideRHP();
    const shouldUseNarrowLayout = shouldUseNarrowLayoutProp ?? shouldUseNarrowLayoutHook;

    const cleanedGroupName = isGroupedByTag && group.groupName ? getCommaSeparatedTagNameWithSanitizedColons(group.groupName) : group.groupName;
    const displayName = cleanedGroupName || translate(isGroupedByTag ? 'reportLayout.noTag' : 'reportLayout.uncategorized');
    const formattedAmount = convertToDisplayString(group.subTotalAmount, currency);

    const shouldShowCheckbox = isSelectionModeEnabled || !shouldUseNarrowLayout;

    const textStyle = useMemo(
        () => (shouldUseNarrowLayout ? {fontSize: variables.fontSizeLabel, lineHeight: 16} : {fontSize: variables.fontSizeNormal, lineHeight: DESKTOP_HEIGHT}),
        [shouldUseNarrowLayout],
    );

    const handleToggleSelection = useCallback(() => {
        onToggleSelection?.(groupKey);
    }, [onToggleSelection, groupKey]);

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <View style={[shouldUseNarrowLayout ? [styles.ph4, styles.pv3, styles.borderBottom] : [styles.reportLayoutGroupHeader, {height: DESKTOP_HEIGHT, minHeight: DESKTOP_HEIGHT}]]}>
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
        </OfflineWithFeedback>
    );
}

export default MoneyRequestReportGroupHeader;
