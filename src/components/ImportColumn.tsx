import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setColumnName} from '@libs/actions/ImportSpreadsheet';
import {findColumnName} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {DropdownOption} from './ButtonWithDropdownMenu/types';

import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import Text from './Text';

type ColumnRole = {
    /** Translated text to be displayed */
    text: string;

    /** Unique value of the option */
    value: string;

    /** Used for any additional text - e.g. if the field is required */
    description?: string;

    /** Whether the column is required for import */
    isRequired?: boolean;
};

type ImportColumnProps = {
    /** It is an array of all values in specific column */
    column: string[];

    /** It is column[0] when containsHeader = true or it is Column A, B, C,... otherwise */
    columnName: string;

    /** Array of all possible column roles for specific data import */
    columnRoles?: ColumnRole[];

    /** Index of the column in the spreadsheet */
    columnIndex: number;

    /** Whether to show the dropdown menu */
    shouldShowDropdownMenu?: boolean;

    /**
     * Whether this column may auto-detect its role from its header on mount. Flows that compute the whole mapping in a
     * single coordinated pass (e.g. company cards) disable this so a property can never be pre-selected on more than
     * one column.
     */
    shouldAutoDetectColumn?: boolean;
};

function ImportColumn({column, columnName, columnRoles, columnIndex, shouldShowDropdownMenu = true, shouldAutoDetectColumn = true}: ImportColumnProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const {containsHeader = true} = spreadsheet ?? {};
    const hasAutoDetected = useRef(false);

    const options: Array<DropdownOption<string>> = (columnRoles ?? []).map((item) => ({
        text: item.text,
        value: item.value,
        description: item.description ?? (item.isRequired ? translate('common.required') : undefined),
        isSelected: spreadsheet?.columns?.[columnIndex] === item.value,
    }));

    const columnValuesString = column
        .slice(containsHeader ? 1 : 0)
        .filter((value) => String(value).trim() !== '')
        .join(', ');

    const currentColumnValue = spreadsheet?.columns?.[columnIndex];
    // Treat 'ignore' as unmapped so auto-detection can still run
    const isMapped = currentColumnValue && currentColumnValue !== CONST.CSV_IMPORT_COLUMNS.IGNORE;
    const autoDetectedColName = isMapped ? '' : findColumnName(column.at(0) ?? '', columnRoles);

    const foundIndex = columnRoles?.findIndex((item) => item.value === (currentColumnValue ?? autoDetectedColName)) ?? -1;
    const selectedIndex = foundIndex !== -1 ? foundIndex : 0;

    useEffect(() => {
        if (!shouldAutoDetectColumn) {
            return;
        }

        // Only run auto-detection once on mount
        if (hasAutoDetected.current) {
            return;
        }

        if (isMapped || !autoDetectedColName) {
            return;
        }

        hasAutoDetected.current = true;
        setColumnName(columnIndex, autoDetectedColName);
    }, [isMapped, autoDetectedColName, columnIndex, shouldAutoDetectColumn]);

    const columnHeader = containsHeader ? column.at(0) : translate('spreadsheet.column', columnName);

    return (
        <View style={[styles.importColumnCard, styles.mt4]}>
            <Text
                numberOfLines={1}
                style={[styles.textSupporting, styles.mw100]}
            >
                {columnHeader}
            </Text>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.justifyContentBetween, styles.w100]}>
                <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[styles.flex1, styles.flexWrap, styles.breakAll]}
                >
                    {columnValuesString}
                </Text>

                {shouldShowDropdownMenu && (
                    <View style={styles.ml2}>
                        <ButtonWithDropdownMenu
                            onPress={() => {}}
                            size={CONST.BUTTON_SIZE.SMALL}
                            shouldShowRadioButton
                            menuHeaderText={columnHeader}
                            isSplitButton={false}
                            onOptionSelected={(option) => {
                                setColumnName(columnIndex, option.value);
                            }}
                            defaultSelectedIndex={selectedIndex}
                            options={options}
                            shouldPopoverUseScrollView={options.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

export type {ColumnRole};
export default ImportColumn;
