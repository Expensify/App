"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CategoryPicker_1 = require("@components/CategoryPicker");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Url_1 = require("@libs/Url");
var CONST_1 = require("@src/CONST");
var DebugTransactionForm_1 = require("@src/types/form/DebugTransactionForm");
var ConstantPicker_1 = require("./ConstantPicker");
var DebugTagPicker_1 = require("./DebugTagPicker");
function DebugDetailsConstantPickerPage(_a) {
    var _b = _a.route.params, formType = _b.formType, fieldName = _b.fieldName, fieldValue = _b.fieldValue, _c = _b.policyID, policyID = _c === void 0 ? '' : _c, _d = _b.backTo, backTo = _d === void 0 ? '' : _d, navigation = _a.navigation;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var onSubmit = (0, react_1.useCallback)(function (item) {
        var _a;
        var value = item.text === fieldValue ? '' : ((_a = item.text) !== null && _a !== void 0 ? _a : '');
        // Check the navigation state and "backTo" parameter to decide navigation behavior
        if (navigation.getState().routes.length === 1 && !backTo) {
            // If there is only one route and "backTo" is empty, go back in navigation
            Navigation_1.default.goBack();
        }
        else if (!!backTo && navigation.getState().routes.length === 1) {
            // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
            Navigation_1.default.goBack((0, Url_1.appendParam)(backTo, fieldName, value));
        }
        else {
            // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
            Navigation_1.default.navigate((0, Url_1.appendParam)(backTo, fieldName, value));
        }
    }, [backTo, fieldName, fieldValue, navigation]);
    var renderPicker = (0, react_1.useCallback)(function () {
        if ([DebugTransactionForm_1.default.CURRENCY, DebugTransactionForm_1.default.MODIFIED_CURRENCY, DebugTransactionForm_1.default.ORIGINAL_CURRENCY].includes(fieldName)) {
            return (<CurrencySelectionList_1.default onSelect={function (_a) {
                    var currencyCode = _a.currencyCode;
                    return onSubmit({
                        text: currencyCode,
                    });
                }} searchInputLabel={translate('common.search')}/>);
        }
        if (formType === CONST_1.default.DEBUG.FORMS.TRANSACTION) {
            if (fieldName === DebugTransactionForm_1.default.CATEGORY) {
                return (<CategoryPicker_1.default policyID={policyID} selectedCategory={fieldValue} onSubmit={onSubmit}/>);
            }
            if (fieldName === DebugTransactionForm_1.default.TAG) {
                return (<DebugTagPicker_1.default policyID={policyID} tagName={fieldValue} onSubmit={onSubmit}/>);
            }
        }
        return (<ConstantPicker_1.default formType={formType} fieldName={fieldName} fieldValue={fieldValue} onSubmit={onSubmit}/>);
    }, [fieldName, fieldValue, formType, onSubmit, policyID, translate]);
    return (<ScreenWrapper_1.default testID={DebugDetailsConstantPickerPage.displayName}>
            <HeaderWithBackButton_1.default title={fieldName}/>
            <react_native_1.View style={styles.containerWithSpaceBetween}>{renderPicker()}</react_native_1.View>
        </ScreenWrapper_1.default>);
}
DebugDetailsConstantPickerPage.displayName = 'DebugDetailsConstantPickerPage';
exports.default = DebugDetailsConstantPickerPage;
