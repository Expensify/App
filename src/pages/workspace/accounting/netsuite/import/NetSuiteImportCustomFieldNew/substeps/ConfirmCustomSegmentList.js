"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
function ConfirmCustomSegmentStep(_a) {
    var onMove = _a.onMove, customSegmentType = _a.customSegmentType, values = _a.netSuiteCustomFieldFormValues, onNext = _a.onNext;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var fieldNames = [NetSuiteCustomFieldForm_1.default.SEGMENT_NAME, NetSuiteCustomFieldForm_1.default.INTERNAL_ID, NetSuiteCustomFieldForm_1.default.SCRIPT_ID, NetSuiteCustomFieldForm_1.default.MAPPING];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var bottomSafeAreaPaddingStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true });
    if (!values.mapping) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<react_native_1.View style={[styles.flex1, bottomSafeAreaPaddingStyle]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text_1.default>
            {fieldNames.map(function (fieldName, index) { return (<MenuItemWithTopDescription_1.default description={translate("workspace.netsuite.import.importCustomFields.customSegments.fields.".concat(fieldName === NetSuiteCustomFieldForm_1.default.SCRIPT_ID && customSegmentType === CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD
                ? "".concat(CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD, "ScriptID")
                : "".concat(fieldName)))} title={fieldName === NetSuiteCustomFieldForm_1.default.MAPPING ? translate("workspace.netsuite.import.importTypes.".concat(values[fieldName], ".label")) : values[fieldName]} shouldShowRightIcon onPress={function () {
                onMove(index + 1);
            }}/>); })}
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                <Button_1.default isDisabled={isOffline} success large style={[styles.w100]} onPress={onNext} text={translate('common.confirm')}/>
            </react_native_1.View>
        </react_native_1.View>);
}
ConfirmCustomSegmentStep.displayName = 'ConfirmCustomSegmentStep';
exports.default = ConfirmCustomSegmentStep;
