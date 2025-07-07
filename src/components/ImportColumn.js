"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ImportSpreadsheet_1 = require("@libs/actions/ImportSpreadsheet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ButtonWithDropdownMenu_1 = require("./ButtonWithDropdownMenu");
var Text_1 = require("./Text");
// cspell:disable
function findColumnName(header) {
    var attribute = '';
    var formattedHeader = expensify_common_1.Str.removeSpaces(String(header).toLowerCase().trim());
    switch (formattedHeader) {
        case 'email':
        case 'emailaddress':
        case 'emailaddresses':
        case 'e-mail':
        case 'e-mailaddress':
        case 'e-mailaddresses':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.EMAIL;
            break;
        case 'category':
        case 'categories':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.EMAIL;
            break;
        case 'glcode':
        case 'gl':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.GL_CODE;
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
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.SUBMIT_TO;
            break;
        case 'approveto':
        case 'approvesto':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.APPROVE_TO;
            break;
        case 'payroll':
        case 'payrollid':
        case 'payrolls':
        case 'payrol':
        case 'customfield2':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2;
            break;
        case 'userid':
        case 'customfield1':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_1;
            break;
        case 'role':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.ROLE;
            break;
        case 'total':
        case 'threshold':
        case 'reporttotal':
        case 'reporttotalthreshold':
        case 'approvallimit':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.REPORT_THRESHHOLD;
            break;
        case 'alternate':
        case 'alternateapprove':
        case 'alternateapproveto':
        case 'overlimitforwardsto':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.APPROVE_TO_ALTERNATE;
            break;
        case 'destination':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.DESTINATION;
            break;
        case 'subrate':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.SUBRATE;
            break;
        case 'amount':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.AMOUNT;
            break;
        case 'currency':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.CURRENCY;
            break;
        case 'rateid':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.RATE_ID;
            break;
        case 'enabled':
        case 'enable':
            attribute = CONST_1.default.CSV_IMPORT_COLUMNS.ENABLED;
            break;
        default:
            break;
    }
    return attribute;
}
function ImportColumn(_a) {
    var _b;
    var column = _a.column, columnName = _a.columnName, columnRoles = _a.columnRoles, columnIndex = _a.columnIndex, _c = _a.shouldShowDropdownMenu, shouldShowDropdownMenu = _c === void 0 ? true : _c;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var spreadsheet = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true })[0];
    var _d = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _d === void 0 ? true : _d;
    var options = (columnRoles !== null && columnRoles !== void 0 ? columnRoles : []).map(function (item) {
        var _a, _b;
        return ({
            text: item.text,
            value: item.value,
            description: (_a = item.description) !== null && _a !== void 0 ? _a : (item.isRequired ? translate('common.required') : undefined),
            isSelected: ((_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) === null || _b === void 0 ? void 0 : _b[columnIndex]) === item.value,
        });
    });
    var columnValuesString = column.slice(containsHeader ? 1 : 0).join(', ');
    var colName = findColumnName((_b = column.at(0)) !== null && _b !== void 0 ? _b : '');
    var defaultSelectedIndex = columnRoles === null || columnRoles === void 0 ? void 0 : columnRoles.findIndex(function (item) { return item.value === colName; });
    var finalIndex = defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0;
    (0, react_1.useEffect)(function () {
        if (defaultSelectedIndex === -1) {
            return;
        }
        (0, ImportSpreadsheet_1.setColumnName)(columnIndex, colName);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);
    var columnHeader = containsHeader ? column.at(0) : translate('spreadsheet.column', { name: columnName });
    return (<react_native_1.View style={[styles.importColumnCard, styles.mt4]}>
            <Text_1.default numberOfLines={1} style={[styles.textSupporting, styles.mw100]}>
                {columnHeader}
            </Text_1.default>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                <Text_1.default numberOfLines={2} ellipsizeMode="tail" style={[styles.flex1, styles.flexWrap, styles.breakAll]}>
                    {columnValuesString}
                </Text_1.default>

                {shouldShowDropdownMenu && (<react_native_1.View style={styles.ml2}>
                        <ButtonWithDropdownMenu_1.default onPress={function () { }} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL} shouldShowSelectedItemCheck menuHeaderText={columnHeader} isSplitButton={false} onOptionSelected={function (option) {
                (0, ImportSpreadsheet_1.setColumnName)(columnIndex, option.value);
            }} defaultSelectedIndex={finalIndex} options={options}/>
                    </react_native_1.View>)}
            </react_native_1.View>
        </react_native_1.View>);
}
ImportColumn.displayName = 'ImportColumn';
exports.default = ImportColumn;
