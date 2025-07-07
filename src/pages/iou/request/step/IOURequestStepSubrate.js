"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var ValuePicker_1 = require("@components/ValuePicker");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function getSubrateOptions(subRates, filledSubRates, currentSubrateID) {
    var filledSubRatesIDs = new Set(filledSubRates.map(function (_a) {
        var id = _a.id;
        return id;
    }));
    return subRates
        .filter(function (_a) {
        var id = _a.id;
        return currentSubrateID === id || !filledSubRatesIDs.has(id);
    })
        .map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            label: name,
        });
    });
}
function IOURequestStepSubrate(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var _m = _a.route.params, action = _m.action, backTo = _m.backTo, iouType = _m.iouType, pageIndex = _m.pageIndex, reportID = _m.reportID, transactionID = _m.transactionID, transaction = _a.transaction, report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var _o = (0, react_1.useState)(false), isDeleteStopModalOpen = _o[0], setIsDeleteStopModalOpen = _o[1];
    var _p = (0, react_1.useState)(), restoreFocusType = _p[0], setRestoreFocusType = _p[1];
    var navigation = (0, native_1.useNavigation)();
    var isFocused = navigation.isFocused();
    var translate = (0, useLocalize_1.default)().translate;
    var textInputRef = (0, react_1.useRef)(null);
    var parsedIndex = parseInt(pageIndex, 10);
    var selectedDestination = (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.customUnit) === null || _d === void 0 ? void 0 : _d.customUnitRateID;
    var allSubrates = (_g = (_f = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _e === void 0 ? void 0 : _e.customUnit) === null || _f === void 0 ? void 0 : _f.subRates) !== null && _g !== void 0 ? _g : [];
    var allPossibleSubrates = selectedDestination ? ((_k = (_j = (_h = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _h === void 0 ? void 0 : _h[selectedDestination]) === null || _j === void 0 ? void 0 : _j.subRates) !== null && _k !== void 0 ? _k : []) : [];
    var currentSubrate = (_l = allSubrates.at(parsedIndex)) !== null && _l !== void 0 ? _l : undefined;
    var totalSubrateCount = allPossibleSubrates.length;
    var filledSubrateCount = allSubrates.length;
    var _q = (0, react_1.useState)(currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.id), subrateValue = _q[0], setSubrateValue = _q[1];
    var _r = (0, react_1.useState)(function () { return ((currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.quantity) ? String(currentSubrate.quantity) : undefined); }), quantityValue = _r[0], setQuantityValue = _r[1];
    var onChangeQuantity = (0, react_1.useCallback)(function (newValue) {
        var _a, _b;
        // replace all characters that are not spaces or digits
        var validQuantity = newValue.replace(/[^0-9]/g, '');
        validQuantity = (_b = (_a = validQuantity.match(/(?:\d *){1,12}/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
        setQuantityValue(validQuantity);
    }, []);
    (0, react_1.useEffect)(function () {
        setSubrateValue(currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.id);
        setQuantityValue((currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.quantity) ? String(currentSubrate.quantity) : undefined);
    }, [currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.id, currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.quantity]);
    // Hide the menu when there is only one subrate
    var shouldShowThreeDotsButton = filledSubrateCount > 1 && !(0, EmptyObject_1.isEmptyObject)(currentSubrate);
    var shouldDisableEditor = isFocused && (Number.isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= totalSubrateCount || parsedIndex > filledSubrateCount);
    var validOptions = getSubrateOptions(allPossibleSubrates, allSubrates, currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.id);
    var goBack = function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID));
    };
    var validate = function (values) {
        var _a, _b;
        var errors = {};
        var quantityVal = String((_a = values["quantity".concat(pageIndex)]) !== null && _a !== void 0 ? _a : '');
        var subrateVal = (_b = values["subrate".concat(pageIndex)]) !== null && _b !== void 0 ? _b : '';
        var quantityInt = parseInt(quantityVal, 10);
        if (subrateVal === '' || !validOptions.some(function (_a) {
            var value = _a.value;
            return value === subrateVal;
        })) {
            (0, ErrorUtils_1.addErrorMessage)(errors, "subrate".concat(pageIndex), translate('common.error.fieldRequired'));
        }
        if (quantityVal === '') {
            (0, ErrorUtils_1.addErrorMessage)(errors, "quantity".concat(pageIndex), translate('common.error.fieldRequired'));
        }
        else if (Number.isNaN(quantityInt)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, "quantity".concat(pageIndex), translate('iou.error.invalidQuantity'));
        }
        else if (quantityInt <= 0) {
            (0, ErrorUtils_1.addErrorMessage)(errors, "quantity".concat(pageIndex), translate('iou.error.quantityGreaterThanZero'));
        }
        return errors;
    };
    var submit = function (values) {
        var _a, _b, _c, _d;
        var quantityVal = String((_a = values["quantity".concat(pageIndex)]) !== null && _a !== void 0 ? _a : '');
        var subrateVal = String((_b = values["subrate".concat(pageIndex)]) !== null && _b !== void 0 ? _b : '');
        var quantityInt = parseInt(quantityVal, 10);
        var selectedSubrate = allPossibleSubrates.find(function (_a) {
            var id = _a.id;
            return id === subrateVal;
        });
        var name = (_c = selectedSubrate === null || selectedSubrate === void 0 ? void 0 : selectedSubrate.name) !== null && _c !== void 0 ? _c : '';
        var rate = (_d = selectedSubrate === null || selectedSubrate === void 0 ? void 0 : selectedSubrate.rate) !== null && _d !== void 0 ? _d : 0;
        if (parsedIndex === filledSubrateCount) {
            (0, IOU_1.addSubrate)(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        }
        else {
            (0, IOU_1.updateSubrate)(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        }
        if (backTo) {
            goBack();
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
        }
    };
    var deleteSubrateAndHideModal = function () {
        (0, IOU_1.removeSubrate)(transaction, pageIndex);
        setRestoreFocusType(CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        setIsDeleteStopModalOpen(false);
        goBack();
    };
    var tabTitles = (_b = {},
        _b[CONST_1.default.IOU.TYPE.REQUEST] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SUBMIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SEND] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.PAY] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.SPLIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SPLIT_EXPENSE] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.TRACK] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.INVOICE] = translate('workspace.invoices.sendInvoice'),
        _b[CONST_1.default.IOU.TYPE.CREATE] = translate('iou.createExpense'),
        _b);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={IOURequestStepSubrate.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton_1.default title={backTo ? translate('common.subrate') : tabTitles[iouType]} shouldShowBackButton onBackButtonPress={goBack} shouldShowThreeDotsButton={shouldShowThreeDotsButton} shouldSetModalVisibility={false} threeDotsAnchorPosition={threeDotsAnchorPosition} threeDotsMenuItems={[
            {
                icon: Expensicons.Trashcan,
                text: translate('iou.deleteSubrate'),
                onSelected: function () {
                    setRestoreFocusType(undefined);
                    setIsDeleteStopModalOpen(true);
                },
                shouldCallAfterModalHide: true,
            },
        ]}/>
                <ConfirmModal_1.default title={translate('iou.deleteSubrate')} isVisible={isDeleteStopModalOpen} onConfirm={deleteSubrateAndHideModal} onCancel={function () { return setIsDeleteStopModalOpen(false); }} shouldSetModalVisibility={false} prompt={translate('iou.deleteSubrateConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} shouldEnableNewFocusManagement danger restoreFocusType={restoreFocusType}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_SUBRATE_FORM} enabledWhenOffline validate={validate} onSubmit={submit} shouldValidateOnChange shouldValidateOnBlur={false} submitButtonText={translate('common.save')}>
                    <Text_1.default style={[styles.pv3]}>{translate('iou.subrateSelection')}</Text_1.default>
                    <react_native_1.View style={[styles.mhn5]}>
                        <InputWrapper_1.default InputComponent={ValuePicker_1.default} inputID={"subrate".concat(pageIndex)} label={translate('common.subrate')} value={subrateValue} defaultValue={currentSubrate === null || currentSubrate === void 0 ? void 0 : currentSubrate.id} items={validOptions} onValueChange={function (value) {
            setSubrateValue(value);
            react_native_1.InteractionManager.runAfterInteractions(function () {
                var _a;
                (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            });
        }}/>
                    </react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={"quantity".concat(pageIndex)} ref={textInputRef} containerStyles={[styles.mt4]} label={translate('iou.quantity')} value={quantityValue} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} maxLength={CONST_1.default.IOU.QUANTITY_MAX_LENGTH} onChangeText={onChangeQuantity}/>
                </FormProvider_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
IOURequestStepSubrate.displayName = 'IOURequestStepSubrate';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepSubrate));
