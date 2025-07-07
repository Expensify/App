"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ImportSpreadsheet_1 = require("@libs/actions/ImportSpreadsheet");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Button_1 = require("./Button");
var FixedFooter_1 = require("./FixedFooter");
var ImportColumn_1 = require("./ImportColumn");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
var ScrollView_1 = require("./ScrollView");
var Switch_1 = require("./Switch");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
function ImportSpreadsheetColumns(_a) {
    var spreadsheetColumns = _a.spreadsheetColumns, columnNames = _a.columnNames, columnRoles = _a.columnRoles, errors = _a.errors, importFunction = _a.importFunction, isButtonLoading = _a.isButtonLoading, learnMoreLink = _a.learnMoreLink, _b = _a.shouldShowColumnHeader, shouldShowColumnHeader = _b === void 0 ? true : _b, _c = _a.shouldShowDropdownMenu, shouldShowDropdownMenu = _c === void 0 ? true : _c, customHeaderText = _a.customHeaderText;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var spreadsheet = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true })[0];
    var _d = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _d === void 0 ? true : _d;
    return (<>
            <ScrollView_1.default>
                <react_native_1.View style={styles.mh5}>
                    <Text_1.default>
                        {customHeaderText !== null && customHeaderText !== void 0 ? customHeaderText : (<>
                                {translate('spreadsheet.importDescription')}
                                <TextLink_1.default href={learnMoreLink !== null && learnMoreLink !== void 0 ? learnMoreLink : ''}>{" ".concat(translate('common.learnMore'))}</TextLink_1.default>
                            </>)}
                    </Text_1.default>
                    {shouldShowColumnHeader && (<react_native_1.View style={[styles.mt7, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                            <Text_1.default>{translate('spreadsheet.fileContainsHeader')}</Text_1.default>

                            <Switch_1.default accessibilityLabel={translate('spreadsheet.fileContainsHeader')} isOn={containsHeader} 
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onToggle={ImportSpreadsheet_1.setContainsHeader}/>
                        </react_native_1.View>)}
                    {spreadsheetColumns.map(function (column, index) {
            var _a;
            return (<ImportColumn_1.default key={columnNames.at(index)} column={column} columnName={(_a = columnNames.at(index)) !== null && _a !== void 0 ? _a : ''} columnRoles={columnRoles} columnIndex={index} shouldShowDropdownMenu={shouldShowDropdownMenu}/>);
        })}
                </react_native_1.View>
            </ScrollView_1.default>
            <FixedFooter_1.default addBottomSafeAreaPadding>
                <OfflineWithFeedback_1.default shouldDisplayErrorAbove errors={errors} errorRowStyles={styles.mv2} canDismissError={false}>
                    <Button_1.default text={translate('common.import')} onPress={importFunction} isLoading={isButtonLoading} isDisabled={isOffline} pressOnEnter success large/>
                </OfflineWithFeedback_1.default>
            </FixedFooter_1.default>
        </>);
}
ImportSpreadsheetColumns.displayName = 'ImportSpreadsheetColumns';
exports.default = ImportSpreadsheetColumns;
