import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setColumnName} from '@libs/actions/ImportSpreadsheet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import Text from './Text';

function findColumnName(header: string): string {
    let attribute = '';
    const formattedHeader = Str.removeSpaces(String(header).toLowerCase().trim());
    switch (formattedHeader) {
        case 'email':
        case 'emailaddress':
        case 'emailaddresses':
        case 'e-mail':
        case 'e-mailaddress':
        case 'e-mailaddresses':
            attribute = CONST.CSV_IMPORT_COLUMNS.EMAIL;
            break;

        case 'category':
        case 'categories':
            attribute = CONST.CSV_IMPORT_COLUMNS.EMAIL;
            break;

        case 'glcode':
        case 'gl':
            attribute = CONST.CSV_IMPORT_COLUMNS.GL_CODE;
            break;

        case 'tag':
        case 'tags':
        case 'project':
        case 'projectcode':
        case 'customer':
        case 'name':
            attribute = 'name';
            break;

        case 'submitto':
        case 'submitsto':
            attribute = CONST.CSV_IMPORT_COLUMNS.SUBMIT_TO;
            break;

        case 'approveto':
        case 'approvesto':
            attribute = CONST.CSV_IMPORT_COLUMNS.APPROVE_TO;
            break;

        case 'payroll':
        case 'payrollid':
        case 'payrolls':
        case 'payrol':
        case 'customfield2':
            attribute = CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2;
            break;

        case 'userid':
        case 'customfield1':
            attribute = CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_1;
            break;

        case 'role':
            attribute = CONST.CSV_IMPORT_COLUMNS.ROLE;
            break;

        case 'total':
        case 'threshold':
        case 'reporttotal':
        case 'reporttotalthreshold':
        case 'approvallimit':
            attribute = CONST.CSV_IMPORT_COLUMNS.REPORT_THRESHHOLD;
            break;

        case 'alternate':
        case 'alternateapprove':
        case 'alternateapproveto':
        case 'overlimitforwardsto':
            attribute = CONST.CSV_IMPORT_COLUMNS.APPROVE_TO_ALTERNATE;

            break;

        case 'destination':
            attribute = CONST.CSV_IMPORT_COLUMNS.NAME;
            break;

        case 'subrate':
            attribute = CONST.CSV_IMPORT_COLUMNS.SUBRATE;
            break;

        case 'amount':
            attribute = CONST.CSV_IMPORT_COLUMNS.AMOUNT;
            break;

        case 'currency':
            attribute = CONST.CSV_IMPORT_COLUMNS.CURRENCY;
            break;

        case 'rateid':
            attribute = CONST.CSV_IMPORT_COLUMNS.RATE_ID;
            break;

        case 'enabled':
        case 'enable':
            attribute = CONST.CSV_IMPORT_COLUMNS.ENABLED;
            break;

        default:
            break;
    }

    return attribute;
}

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
    columnRoles: ColumnRole[];

    /** Index of the column in the spreadsheet */
    columnIndex: number;
};

function ImportColumn({column, columnName, columnRoles, columnIndex}: ImportColumnProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const {containsHeader = true} = spreadsheet ?? {};

    const options: Array<DropdownOption<string>> = columnRoles.map((item) => ({
        text: item.text,
        value: item.value,
        description: item.description ?? (item.isRequired ? translate('common.required') : undefined),
        isSelected: spreadsheet?.columns?.[columnIndex] === item.value,
    }));

    const columnValuesString = column.slice(containsHeader ? 1 : 0).join(', ');

    const colName = findColumnName(column.at(0) ?? '');
    const defaultSelectedIndex = columnRoles.findIndex((item) => item.value === colName);
    const finalIndex = defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0;

    useEffect(() => {
        if (defaultSelectedIndex === -1) {
            return;
        }
        setColumnName(columnIndex, colName);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);

    const columnHeader = containsHeader ? column.at(0) : translate('spreadsheet.column', {name: columnName});

    return (
        <View style={[styles.importColumnCard, styles.mt4]}>
            <Text
                numberOfLines={1}
                style={[styles.textSupporting, styles.mw100]}
            >
                {columnHeader}
            </Text>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[styles.flex1, styles.flexWrap, styles.breakAll]}
                >
                    {columnValuesString}
                </Text>

                <View style={styles.ml2}>
                    <ButtonWithDropdownMenu
                        onPress={() => {}}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                        shouldShowSelectedItemCheck
                        menuHeaderText={columnHeader}
                        isSplitButton={false}
                        onOptionSelected={(option) => {
                            setColumnName(columnIndex, option.value);
                        }}
                        defaultSelectedIndex={finalIndex}
                        options={options}
                    />
                </View>
            </View>
        </View>
    );
}

ImportColumn.displayName = 'ImportColumn';

export type {ColumnRole};
export default ImportColumn;
