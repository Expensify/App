import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import {PressableWithFeedback} from '@components/Pressable';
import type {DataDetailsType, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListHeaderProps<TItem extends ListItem> = {
    /** Data details containing selection state and items info */
    dataDetails: DataDetailsType<TItem>;

    /** Message to display above the list */
    aboveListHeaderMessage?: string;

    /** Custom header content to render instead of the default select all header */
    customListHeader?: React.ReactNode;

    /** Whether multiple items can be selected */
    canSelectMultiple: boolean;

    /** Function called when the select all button is pressed */
    onSelectAll: () => void;

    /** Whether to show 'Select all' button */
    shouldShowSelectAllButton: boolean;

    /** Whether to prevent default focus when selecting rows */
    shouldPreventDefaultFocusOnSelectRow?: boolean;
};

function ListHeader<TItem extends ListItem>({
    dataDetails,
    aboveListHeaderMessage,
    customListHeader,
    canSelectMultiple,
    onSelectAll,
    shouldShowSelectAllButton,
    shouldPreventDefaultFocusOnSelectRow,
}: ListHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (aboveListHeaderMessage) {
        return null;
    }

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

    return (
        <View
            style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, styles.selectionListStickyHeader]}
            accessibilityRole="header"
        >
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <Checkbox
                    accessibilityLabel={translate('workspace.people.selectAll')}
                    isChecked={dataDetails.allSelected}
                    isIndeterminate={dataDetails.someSelected}
                    onPress={onSelectAll}
                    disabled={allDisabled}
                />

                {!customListHeader && (
                    <PressableWithFeedback
                        style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter]}
                        onPress={onSelectAll}
                        accessibilityLabel={translate('workspace.people.selectAll')}
                        accessibilityRole="button"
                        accessibilityState={{checked: dataDetails.allSelected, disabled: allDisabled}}
                        disabled={allDisabled}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        onMouseDown={handleMouseDown}
                    >
                        <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                    </PressableWithFeedback>
                )}
            </View>
            {customListHeader}
        </View>
    );
}

export default React.memo(ListHeader);
