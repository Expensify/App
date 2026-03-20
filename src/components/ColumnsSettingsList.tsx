import React, {useState} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import Button from './Button';
import DraggableList from './DraggableList';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';
import type {SearchCustomColumnIds} from './Search/types';
import type {ListItem} from './SelectionList/types';
import MultiSelectListItem from './SelectionListWithSections/MultiSelectListItem';
import Text from './Text';
import TextLink from './TextLink';

type ColumnItem = {
    /** Display label for the column */
    text: string;

    /** Column identifier value */
    value: SearchCustomColumnIds;

    /** Unique key used for list rendering */
    keyForList: SearchCustomColumnIds;

    /** Whether the column is currently enabled/visible */
    isSelected: boolean;

    /** Whether the column toggle is disabled (e.g. for required columns) */
    isDisabled: boolean;

    /** Whether the column cannot be reordered via drag */
    isDragDisabled: boolean;

    /** Element rendered on the left side of the list item (e.g. drag handle) */
    leftElement: React.JSX.Element;
};

type ColumnsSettingsListProps = {
    /** All available column IDs that can be displayed */
    allColumns: SearchCustomColumnIds[];

    /** The default set of selected columns when no customization has been applied */
    defaultSelectedColumns: SearchCustomColumnIds[];

    /** The currently selected and ordered columns */
    currentColumns: SearchCustomColumnIds[];

    /** Columns that cannot be deselected by the user */
    requiredColumns: Set<SearchCustomColumnIds>;

    /** The active group-by field (e.g. category, tag) */
    groupBy?: string;

    /** The currently selected columns specific to the active group-by mode */
    groupColumns?: SearchCustomColumnIds[];

    /** The default columns for the active group-by mode when no customization has been applied */
    defaultGroupColumns?: SearchCustomColumnIds[];

    /** Callback fired with the updated column list when the user saves changes */
    onSave: (columns: SearchCustomColumnIds[]) => void;
};

function ColumnsSettingsList({allColumns, defaultSelectedColumns, currentColumns, requiredColumns, groupBy, groupColumns = [], defaultGroupColumns = [], onSave}: ColumnsSettingsListProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const {translate, localeCompare} = useLocalize();

    const allCustomColumns = [...groupColumns, ...allColumns];
    const defaultCustomColumns = new Set([...defaultGroupColumns, ...defaultSelectedColumns]);

    const sortColumns = (columnsToSort: ColumnItem[]): ColumnItem[] => {
        const selected = columnsToSort.filter((col) => col.isSelected);
        const unselected = columnsToSort
            .filter((col) => !col.isSelected)
            .sort((a, b) => {
                const textA = translate(getSearchColumnTranslationKey(a.value));
                const textB = translate(getSearchColumnTranslationKey(b.value));
                return localeCompare(textA, textB);
            });
        return [...selected, ...unselected];
    };

    const defaultColumns = allCustomColumns.map((columnId) => ({
        columnId,
        isSelected: defaultCustomColumns.has(columnId),
    }));

    const [columns, setColumns] = useState(() => {
        const selectedColumnIds = currentColumns.filter((columnId) => allCustomColumns.includes(columnId));

        if (!selectedColumnIds.length) {
            return defaultColumns;
        }

        const selected = selectedColumnIds.map((columnId) => ({columnId, isSelected: true}));
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
                text: translate(getSearchColumnTranslationKey(columnId)),
                value: columnId,
                keyForList: columnId,
                isSelected: isEffectivelySelected,
                isDisabled: isRequired,
                isDragDisabled,
                leftElement: (
                    <View style={[styles.mr3, isDragDisabled && styles.cursorDisabled]}>
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
                    const textA = translate(getSearchColumnTranslationKey(a.columnId));
                    const textB = translate(getSearchColumnTranslationKey(b.columnId));
                    return localeCompare(textA, textB);
                });
                return [...selectedCols, {columnId: updatedColumnId, isSelected: true}, ...unselectedSorted];
            }

            const updatedColumns = prevColumns.map((col) => (col.columnId === updatedColumnId ? {...col, isSelected: false} : col));
            return updatedColumns;
        });
    };

    const onGroupDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newGroupColumns = data.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const existingTypeColumns = typeColumnsList.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const newColumns = [...existingTypeColumns, ...newGroupColumns];
        setColumns(newColumns);
    };

    const onTypeDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newTypeColumns = data.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const existingGroupColumns = groupColumnsList.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const newColumns = [...existingGroupColumns, ...newTypeColumns];
        setColumns(newColumns);
    };

    const resetColumns = () => {
        setColumns(defaultColumns);
    };

    const handleSave = () => {
        onSave(selectedColumnIds);
    };

    const renderItem = ({item}: {item: ListItem}) => {
        return (
            <MultiSelectListItem
                item={item}
                showTooltip={false}
                onSelectRow={onSelectItem}
                isDisabled={item.isDisabled}
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
            <HeaderWithBackButton title={translate('search.columns')}>
                {!isDefaultState && <TextLink onPress={resetColumns}>{translate('search.resetColumns')}</TextLink>}
            </HeaderWithBackButton>
            <View style={styles.flex1}>
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    {!!groupBy && (
                        <>
                            <View style={[styles.ph5, styles.pb3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.groupColumns')}</Text>
                            </View>

                            <DraggableList
                                disableScroll
                                data={groupColumnsList}
                                keyExtractor={(item) => item.value}
                                onDragEnd={onGroupDragEnd}
                                renderItem={renderItem}
                            />

                            <View style={styles.dividerLine} />

                            <View style={[styles.ph5, styles.pv3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.expenseColumns')}</Text>
                            </View>
                        </>
                    )}

                    <DraggableList
                        disableScroll
                        data={typeColumnsList}
                        keyExtractor={(item) => item.value}
                        onDragEnd={onTypeDragEnd}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </View>
            <View style={[styles.ph5, styles.pb5]}>
                <Button
                    large
                    success
                    pressOnEnter
                    text={translate('common.save')}
                    onPress={handleSave}
                />
            </View>
        </ScreenWrapper>
    );
}

export default ColumnsSettingsList;
