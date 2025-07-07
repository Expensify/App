"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ImportSpreadsheetColumns_1 = require("@components/ImportSpreadsheetColumns");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useCloseImportPage_1 = require("@hooks/useCloseImportPage");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var Tag_1 = require("@libs/actions/Policy/Tag");
var importSpreadsheetUtils_1 = require("@libs/importSpreadsheetUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ImportedTagsPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _h[0], spreadsheetMetadata = _h[1];
    var _j = (0, react_1.useState)(false), isImportingTags = _j[0], setIsImportingTags = _j[1];
    var _k = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _k === void 0 ? true : _k;
    var _l = (0, react_1.useState)(false), isValidationEnabled = _l[0], setIsValidationEnabled = _l[1];
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var policyTagLists = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagLists)(policyTags); }, [policyTags]);
    var policy = (0, usePolicy_1.default)(policyID);
    var columnNames = (0, importSpreadsheetUtils_1.generateColumnNames)((_c = (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED;
    var setIsClosing = (0, useCloseImportPage_1.default)().setIsClosing;
    var getColumnRoles = function () {
        var roles = [];
        roles.push({ text: translate('common.ignore'), value: CONST_1.default.CSV_IMPORT_COLUMNS.IGNORE }, { text: translate('common.name'), value: CONST_1.default.CSV_IMPORT_COLUMNS.NAME, isRequired: true }, { text: translate('common.enabled'), value: CONST_1.default.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true });
        if ((0, PolicyUtils_1.isControlPolicy)(policy)) {
            roles.push({ text: translate('workspace.tags.glCode'), value: CONST_1.default.CSV_IMPORT_COLUMNS.GL_CODE });
        }
        return roles;
    };
    var columnRoles = getColumnRoles();
    var requiredColumns = columnRoles.filter(function (role) { return role.isRequired; }).map(function (role) { return role; });
    var validate = (0, react_1.useCallback)(function () {
        var _a;
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var errors = {};
        var missingRequiredColumns = requiredColumns.find(function (requiredColumn) { return !columns.includes(requiredColumn.value); });
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', { fieldName: missingRequiredColumns.text });
        }
        else {
            var duplicate = (0, importSpreadsheetUtils_1.findDuplicate)(columns);
            if (duplicate) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', { fieldName: duplicate });
            }
            else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns, translate]);
    var importTags = (0, react_1.useCallback)(function () {
        var _a;
        setIsValidationEnabled(true);
        var errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var tagsNamesColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.NAME; });
        var tagsGLCodeColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.GL_CODE; });
        var tagsEnabledColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.ENABLED; });
        var tagsNames = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[tagsNamesColumn].map(function (name) { return name; });
        var tagsEnabled = tagsEnabledColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[tagsEnabledColumn].map(function (enabled) { return enabled; }) : [];
        var tagsGLCode = tagsGLCodeColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[tagsGLCodeColumn].map(function (glCode) { return glCode; }) : [];
        var tags = tagsNames === null || tagsNames === void 0 ? void 0 : tagsNames.slice(containsHeader ? 1 : 0).map(function (name, index) {
            var _a, _b, _c, _d;
            // Right now we support only single-level tags, this check should be updated when we add multi-level support
            var tagAlreadyExists = (_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b[name];
            var existingGLCodeOrDefault = (_c = tagAlreadyExists === null || tagAlreadyExists === void 0 ? void 0 : tagAlreadyExists['GL Code']) !== null && _c !== void 0 ? _c : '';
            return {
                name: name,
                enabled: tagsEnabledColumn !== -1 ? (tagsEnabled === null || tagsEnabled === void 0 ? void 0 : tagsEnabled[containsHeader ? index + 1 : index]) === 'true' : true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'GL Code': tagsGLCodeColumn !== -1 ? ((_d = tagsGLCode === null || tagsGLCode === void 0 ? void 0 : tagsGLCode[containsHeader ? index + 1 : index]) !== null && _d !== void 0 ? _d : '') : existingGLCodeOrDefault,
            };
        });
        if (tags) {
            setIsImportingTags(true);
            (0, Tag_1.importPolicyTags)(policyID, tags);
        }
    }, [validate, spreadsheet, containsHeader, policyTagLists, policyID]);
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    var spreadsheetColumns = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage_1.default />;
    }
    var closeImportPageAndModal = function () {
        setIsClosing(true);
        setIsImportingTags(false);
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_TAGS.getRoute(policyID));
    };
    return (<ScreenWrapper_1.default testID={ImportedTagsPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.tags.importTags')} onBackButtonPress={function () { return Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_TAGS_IMPORT.getRoute(policyID)); }}/>
            <ImportSpreadsheetColumns_1.default spreadsheetColumns={spreadsheetColumns} columnNames={columnNames} importFunction={importTags} errors={isValidationEnabled ? validate() : undefined} columnRoles={columnRoles} isButtonLoading={isImportingTags} learnMoreLink={CONST_1.default.IMPORT_SPREADSHEET.TAGS_ARTICLE_LINK}/>

            <ConfirmModal_1.default isVisible={spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.shouldFinalModalBeOpened} title={(_e = (_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _d === void 0 ? void 0 : _d.title) !== null && _e !== void 0 ? _e : ''} prompt={(_g = (_f = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _f === void 0 ? void 0 : _f.prompt) !== null && _g !== void 0 ? _g : ''} onConfirm={closeImportPageAndModal} onCancel={closeImportPageAndModal} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} shouldHandleNavigationBack/>
        </ScreenWrapper_1.default>);
}
ImportedTagsPage.displayName = 'ImportedTagsPage';
exports.default = ImportedTagsPage;
