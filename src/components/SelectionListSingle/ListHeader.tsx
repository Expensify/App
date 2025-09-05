import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ListItem} from './types';

type HeaderProps<TItem extends ListItem> = {
    dataDetails: DataDetailsType<TItem>;
    aboveListHeaderMessage?: string;
    customListHeader?: React.ReactNode;
    canSelectMultiple: boolean;
    onSelectAll?: () => void;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
};

type DataDetailsType<TItem extends ListItem> = {
    data: TItem[];
    selectedOptions: TItem[];
    allSelected: boolean;
    someSelected: boolean;
    disabledIndexes: number[];
    disabledArrowKeyIndexes: number[];
};

function SelectionListHeader<TItem extends ListItem>({
    dataDetails,
    aboveListHeaderMessage,
    customListHeader,
    canSelectMultiple,
    onSelectAll,
    shouldPreventDefaultFocusOnSelectRow,
}: HeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (aboveListHeaderMessage) {
        return null;
    }

    if (!canSelectMultiple || !onSelectAll) {
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

export default React.memo(SelectionListHeader);
