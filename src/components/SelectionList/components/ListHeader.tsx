import Checkbox from '@components/Checkbox';
import {PressableWithFeedback} from '@components/Pressable';
import type {DataDetailsType, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type ListHeaderProps<TItem extends ListItem> = {
    /** Data details containing selection state and items info */
    dataDetails: DataDetailsType<TItem>;

    /** Custom header content to render instead of the default select all header */
    customListHeader?: React.ReactNode;

    /** Whether multiple items can be selected */
    canSelectMultiple: boolean;

    /** Styles for the list header wrapper */
    headerStyle?: StyleProp<ViewStyle>;

    /** Styles for the "Select all" text (merged after textStrong) */
    selectAllTextStyle?: StyleProp<TextStyle>;

    /** Function called when the select all button is pressed */
    onSelectAll: () => void;

    /** Whether to show 'Select all' button */
    shouldShowSelectAllButton: boolean;

    /** Whether to prevent default focus when selecting rows */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Custom accessibility label for the select all checkbox, providing context about what is being selected */
    selectAllAccessibilityLabel?: string;

    /** Side on which the select-all checkbox should be rendered, to align with the per-row checkboxes */
    selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;
};

function ListHeader<TItem extends ListItem>({
    dataDetails,
    customListHeader,
    canSelectMultiple,
    onSelectAll,
    headerStyle,
    selectAllTextStyle,
    shouldShowSelectAllButton,
    shouldPreventDefaultFocusOnSelectRow,
    selectAllAccessibilityLabel,
    selectionButtonPosition = CONST.SELECTION_BUTTON_POSITION.LEFT,
}: ListHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!canSelectMultiple || !shouldShowSelectAllButton) {
        return customListHeader;
    }

    const allDisabled = dataDetails.data.length === dataDetails.disabledIndexes.length;

    const handleMouseDown: React.MouseEventHandler = (e) => {
        if (!shouldPreventDefaultFocusOnSelectRow) {
            return;
        }
        e.preventDefault();
    };

    const checkbox = (
        <Checkbox
            testID="selection-list-select-all-checkbox"
            accessibilityLabel={selectAllAccessibilityLabel ?? translate('accessibilityHints.selectAllItems')}
            isChecked={dataDetails.allSelected}
            isIndeterminate={dataDetails.someSelected}
            onPress={onSelectAll}
            disabled={allDisabled}
        />
    );

    const isCheckboxOnRight = selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT;

    const label = !customListHeader && (
        <PressableWithFeedback
            style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter]}
            onPress={onSelectAll}
            accessibilityLabel={selectAllAccessibilityLabel ?? translate('accessibilityHints.selectAllItems')}
            sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.LIST_HEADER_SELECT_ALL}
            accessibilityRole="button"
            accessibilityState={{checked: dataDetails.allSelected, disabled: allDisabled}}
            disabled={allDisabled}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            onMouseDown={handleMouseDown}
        >
            <Text style={[styles.textStrong, isCheckboxOnRight ? styles.pr3 : styles.ph3, selectAllTextStyle]}>{translate('workspace.people.selectAll')}</Text>
        </PressableWithFeedback>
    );

    return (
        <View
            style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, headerStyle, styles.selectionListStickyHeader]}
            accessibilityRole={CONST.ROLE.HEADER}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, isCheckboxOnRight && styles.flex1, isCheckboxOnRight && styles.justifyContentBetween]}>
                {isCheckboxOnRight ? (
                    <>
                        {label}
                        {checkbox}
                    </>
                ) : (
                    <>
                        {checkbox}
                        {label}
                    </>
                )}
            </View>
            {customListHeader}
        </View>
    );
}

ListHeader.displayName = 'ListHeader';

export default React.memo(ListHeader);
