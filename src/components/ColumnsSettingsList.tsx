import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useListKeyboardNav from '@hooks/useListKeyboardNav';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {AccessibilityInfo, View} from 'react-native';

import type {ColumnItem} from './ColumnsSettingsListItem';
import type {DraggableListRenderItemParams} from './DraggableList/types';
import type {SearchCustomColumnIds} from './Search/types';
import type {ListItem} from './SelectionList/types';

import Button from './Button';
import ColumnsSettingsListItem from './ColumnsSettingsListItem';
import DraggableList from './DraggableList';
import DraggableScrollContainer from './DraggableList/ScrollContainer';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import ScreenWrapper from './ScreenWrapper';
import Text from './Text';
import TextLink from './TextLink';

type ColumnsSettingsListProps = {
    /** Defaults to search.columns when the picker uses its standard title. */
    titleKey?: TranslationPaths;

    allColumns: SearchCustomColumnIds[];

    /** The default set of selected columns when no customization has been applied */
    defaultSelectedColumns: SearchCustomColumnIds[];

    /** The columns displayed in the table, in their current order */
    currentColumns: SearchCustomColumnIds[];

    /** Columns that cannot be deselected by the user */
    requiredColumns: Set<SearchCustomColumnIds>;

    /** The active group-by field (e.g. category, tag) */
    groupBy?: string;

    /** The currently selected columns specific to the active group-by mode */
    groupColumns?: SearchCustomColumnIds[];

    /** The default columns for the active group-by mode when no customization has been applied */
    defaultGroupColumns?: SearchCustomColumnIds[];

    /** Async handlers can validate current preferences before closing the picker. */
    onSave: (columns: SearchCustomColumnIds[]) => void | Promise<void>;

    /** The active Search type, used to resolve type-specific column labels */
    type?: SearchDataTypes;
};

function ColumnsSettingsList({
    titleKey = 'search.columns',
    allColumns,
    defaultSelectedColumns,
    currentColumns,
    requiredColumns,
    groupBy,
    groupColumns = [],
    defaultGroupColumns = [],
    onSave,
    type,
}: ColumnsSettingsListProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const {translate, localeCompare, numberFormat} = useLocalize();

    const isGrouped = !!groupBy;

    const allCustomColumns = [...groupColumns, ...allColumns];
    const defaultCustomColumns = new Set([...defaultGroupColumns, ...defaultSelectedColumns].filter((column) => allCustomColumns.includes(column)));

    const sortColumns = (columnsToSort: ColumnItem[]): ColumnItem[] => {
        const selected = columnsToSort.filter((col) => col.isSelected);
        const unselected = columnsToSort
            .filter((col) => !col.isSelected)
            .sort((a, b) => {
                const textA = translate(getSearchColumnTranslationKey(a.value, type));
                const textB = translate(getSearchColumnTranslationKey(b.value, type));
                return localeCompare(textA, textB);
            });
        return [...selected, ...unselected];
    };

    const defaultColumns = [
        ...[...defaultCustomColumns].map((columnId) => ({columnId, isSelected: true})),
        ...[...new Set(allCustomColumns)].filter((columnId) => !defaultCustomColumns.has(columnId)).map((columnId) => ({columnId, isSelected: false})),
    ];

    const [columns, setColumns] = useState(() => {
        const selectedColumnIds = currentColumns.filter((columnId) => allCustomColumns.includes(columnId));

        if (!selectedColumnIds.length) {
            return defaultColumns;
        }

        const selected = selectedColumnIds.map((columnId) => ({
            columnId,
            isSelected: true,
        }));
        const unselected = allCustomColumns.filter((columnId) => !selectedColumnIds.includes(columnId)).map((columnId) => ({columnId, isSelected: false}));

        return [...selected, ...unselected];
    });

    const selectedColumnIds = columns.filter((col) => col.isSelected).map((col) => col.columnId);

    const allColumnsList = sortColumns(
        columns.map(({columnId, isSelected}) => {
            const isRequired = requiredColumns.has(columnId);
            const isEffectivelySelected = isRequired || isSelected;
            const isDragDisabled = !isEffectivelySelected;
            return {
                text: translate(getSearchColumnTranslationKey(columnId, type)),
                value: columnId,
                keyForList: columnId,
                isSelected: isEffectivelySelected,
                isDisabled: isRequired,
                isDragDisabled,
                leftElement: (
                    <View style={[styles.mr3, isDragDisabled ? styles.cursorDisabled : styles.cursorGrab]}>
                        <Icon
                            src={icons.DragHandles}
                            fill={theme.icon}
                            additionalStyles={isDragDisabled && styles.opacitySemiTransparent}
                        />
                    </View>
                ),
            };
        }),
    );

    const typeColumnsList = allColumnsList.filter((column) => allColumns.includes(column.keyForList));
    const groupColumnsList = allColumnsList.filter((column) => groupColumns.includes(column.keyForList));

    const isDefaultState =
        columns.length === defaultColumns.length &&
        columns.every((col, index) => col.columnId === defaultColumns.at(index)?.columnId && col.isSelected === defaultColumns.at(index)?.isSelected);

    const onSelectItem = (item: ListItem) => {
        const updatedColumnId = item.keyForList as SearchCustomColumnIds;

        if (requiredColumns.has(updatedColumnId)) {
            return;
        }

        setColumns((prevColumns) => {
            const columnToUpdate = prevColumns.find((col) => col.columnId === updatedColumnId);

            if (!columnToUpdate) {
                return prevColumns;
            }

            const newIsSelected = !columnToUpdate.isSelected;

            if (newIsSelected) {
                const selectedCols = prevColumns.filter((col) => col.isSelected);
                const unselected = prevColumns.filter((col) => !col.isSelected && col.columnId !== updatedColumnId);
                const unselectedSorted = unselected.sort((a, b) => {
                    const textA = translate(getSearchColumnTranslationKey(a.columnId, type));
                    const textB = translate(getSearchColumnTranslationKey(b.columnId, type));
                    return localeCompare(textA, textB);
                });
                return [...selectedCols, {columnId: updatedColumnId, isSelected: true}, ...unselectedSorted];
            }

            const updatedColumns = prevColumns.map((col) => (col.columnId === updatedColumnId ? {...col, isSelected: false} : col));
            return updatedColumns;
        });
    };

    const combinedItems = isGrouped ? [...groupColumnsList, ...typeColumnsList] : [];
    const groupLength = groupColumnsList.length;
    const disabledIndexes = combinedItems.flatMap((item, index) => (item.isDisabled ? [index] : []));
    const containerRef = useRef<ComponentRef<typeof View>>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {focusedIndex, setFocusedIndex} = useListKeyboardNav({
        containerRef,
        isActive: isGrouped && !isDragging,
        itemKeys: combinedItems.map((item) => item.value),
        disabledIndexes,
    });

    const groupFocusedIndex = focusedIndex >= 0 && focusedIndex < groupLength ? focusedIndex : -1;
    const typeFocusedIndex = focusedIndex >= groupLength ? focusedIndex - groupLength : -1;

    const onGroupDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newGroupColumns = data.map((item) => ({
            columnId: item.value,
            isSelected: item.isSelected,
        }));
        const existingTypeColumns = typeColumnsList.map((item) => ({
            columnId: item.value,
            isSelected: item.isSelected,
        }));
        const newColumns = [...existingTypeColumns, ...newGroupColumns];
        setColumns(newColumns);
        setFocusedIndex(-1);
    };

    const onTypeDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newTypeColumns = data.map((item) => ({
            columnId: item.value,
            isSelected: item.isSelected,
        }));
        const existingGroupColumns = groupColumnsList.map((item) => ({
            columnId: item.value,
            isSelected: item.isSelected,
        }));
        const newColumns = [...existingGroupColumns, ...newTypeColumns];
        setColumns(newColumns);
        setFocusedIndex(-1);
    };

    const resetColumns = () => {
        setColumns(defaultColumns);
    };

    const handleSave = () => {
        onSave(selectedColumnIds);
    };

    const moveColumn = (item: ColumnItem, offset: number) => {
        const isGroupColumn = groupColumns.includes(item.value);
        const columnList = isGroupColumn ? groupColumnsList : typeColumnsList;
        const index = columnList.findIndex((column) => column.value === item.value);
        const targetIndex = index + offset;
        const targetItem = columnList.at(targetIndex);
        if (index < 0 || targetIndex < 0 || item.isDragDisabled || !targetItem || targetItem.isDragDisabled) {
            return;
        }

        const reorderedColumns = [...columnList];
        reorderedColumns.splice(index, 1);
        reorderedColumns.splice(targetIndex, 0, item);
        const onDragEnd = isGroupColumn ? onGroupDragEnd : onTypeDragEnd;
        onDragEnd({data: reorderedColumns});
        AccessibilityInfo.announceForAccessibility(
            translate('search.columnMoved', {
                columnName: item.text,
                position: numberFormat(targetIndex + 1),
                total: numberFormat(columnList.filter((column) => !column.isDragDisabled).length),
            }),
        );
    };

    const renderItem = ({item, isFocused, drag, isActive}: DraggableListRenderItemParams<ColumnItem>) => {
        const columnList = groupColumns.includes(item.value) ? groupColumnsList : typeColumnsList;
        const index = columnList.findIndex((column) => column.value === item.value);
        const canMoveUp = !item.isDragDisabled && index > 0 && !columnList.at(index - 1)?.isDragDisabled;
        const nextColumn = columnList.at(index + 1);
        const canMoveDown = !item.isDragDisabled && !!nextColumn && !nextColumn.isDragDisabled;

        return (
            <ColumnsSettingsListItem
                item={item}
                isFocused={isFocused}
                drag={drag}
                isActive={isActive}
                onSelectRow={onSelectItem}
                onMoveUp={canMoveUp ? () => moveColumn(item, -1) : undefined}
                onMoveDown={canMoveDown ? () => moveColumn(item, 1) : undefined}
            />
        );
    };

    return (
        <ScreenWrapper
            testID="ColumnsSettingsList"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate(titleKey)}>{!isDefaultState && <TextLink onPress={resetColumns}>{translate('search.resetColumns')}</TextLink>}</HeaderWithBackButton>
            <View style={styles.flex1}>
                {isGrouped ? (
                    <DraggableScrollContainer
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <View ref={containerRef}>
                            <View style={[styles.ph5, styles.pb3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.groupColumns')}</Text>
                            </View>

                            <DraggableList
                                disableScroll
                                data={groupColumnsList}
                                keyExtractor={(item) => item.value}
                                onDragEnd={onGroupDragEnd}
                                onDragActiveChange={setIsDragging}
                                onSelectRow={onSelectItem}
                                shouldRestrictDragToEnabledItems
                                isItemDragDisabled={(item) => item.isDragDisabled}
                                isItemDisabled={(item) => item.isDisabled}
                                renderItem={renderItem}
                                focusedIndex={groupFocusedIndex}
                            />

                            <View style={styles.dividerLine} />

                            <View style={[styles.ph5, styles.pv3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.expenseColumns')}</Text>
                            </View>

                            <DraggableList
                                disableScroll
                                data={typeColumnsList}
                                keyExtractor={(item) => item.value}
                                onDragEnd={onTypeDragEnd}
                                onDragActiveChange={setIsDragging}
                                onSelectRow={onSelectItem}
                                shouldRestrictDragToEnabledItems
                                isItemDragDisabled={(item) => item.isDragDisabled}
                                isItemDisabled={(item) => item.isDisabled}
                                renderItem={renderItem}
                                focusedIndex={typeFocusedIndex}
                            />
                        </View>
                    </DraggableScrollContainer>
                ) : (
                    <DraggableList
                        data={typeColumnsList}
                        keyExtractor={(item) => item.value}
                        onDragEnd={onTypeDragEnd}
                        onSelectRow={onSelectItem}
                        shouldRestrictDragToEnabledItems
                        isItemDragDisabled={(item) => item.isDragDisabled}
                        isItemDisabled={(item) => item.isDisabled}
                        renderItem={renderItem}
                    />
                )}
            </View>
            <View style={[styles.ph5, styles.pb5]}>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={handleSave}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </View>
        </ScreenWrapper>
    );
}

export default ColumnsSettingsList;
