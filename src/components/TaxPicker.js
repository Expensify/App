"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var TaxOptionsListUtils_1 = require("@libs/TaxOptionsListUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var SelectionList_1 = require("./SelectionList");
var RadioListItem_1 = require("./SelectionList/RadioListItem");
function TaxPicker(_a) {
    var _b, _c, _d, _e;
    var _f = _a.selectedTaxRate, selectedTaxRate = _f === void 0 ? '' : _f, policyID = _a.policyID, transactionID = _a.transactionID, onSubmit = _a.onSubmit, action = _a.action, iouType = _a.iouType, _g = _a.onDismiss, onDismiss = _g === void 0 ? Navigation_1.default.goBack : _g, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, react_1.useState)(''), searchValue = _h[0], setSearchValue = _h[1];
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID))[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var transaction = (0, useOnyx_1.default)((function () {
        if ((0, IOUUtils_1.shouldUseTransactionDraft)(action)) {
            return "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID);
        }
        return "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID);
    })())[0];
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isEditingSplitBill = isEditing && iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var currentTransaction = isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction;
    var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
    var taxRatesCount = (0, TransactionUtils_1.getEnabledTaxRateCount)((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) !== null && _b !== void 0 ? _b : {});
    var isTaxRatesCountBelowThreshold = taxRatesCount < CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    var shouldShowTextInput = !isTaxRatesCountBelowThreshold;
    var selectedOptions = (0, react_1.useMemo)(function () {
        if (!selectedTaxRate) {
            return [];
        }
        return [
            {
                modifiedName: selectedTaxRate,
                isDisabled: false,
                accountID: null,
            },
        ];
    }, [selectedTaxRate]);
    var sections = (0, react_1.useMemo)(function () {
        return (0, TaxOptionsListUtils_1.getTaxRatesSection)({
            policy: policy,
            searchValue: searchValue,
            selectedOptions: selectedOptions,
            transaction: currentTransaction,
        });
    }, [searchValue, selectedOptions, policy, currentTransaction]);
    var headerMessage = (0, OptionsListUtils_1.getHeaderMessageForNonUserList)(((_e = (_d = (_c = sections.at(0)) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 0, searchValue);
    var selectedOptionKey = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = sections === null || sections === void 0 ? void 0 : sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.find(function (taxRate) { return taxRate.searchText === selectedTaxRate; })) === null || _c === void 0 ? void 0 : _c.keyForList; }, [sections, selectedTaxRate]);
    var handleSelectRow = (0, react_1.useCallback)(function (newSelectedOption) {
        if (selectedOptionKey === newSelectedOption.keyForList) {
            onDismiss();
            return;
        }
        onSubmit(newSelectedOption);
    }, [onSubmit, onDismiss, selectedOptionKey]);
    return (<SelectionList_1.default sections={sections} headerMessage={headerMessage} textInputValue={searchValue} textInputLabel={shouldShowTextInput ? translate('common.search') : undefined} onChangeText={setSearchValue} onSelectRow={handleSelectRow} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={selectedOptionKey !== null && selectedOptionKey !== void 0 ? selectedOptionKey : undefined} isRowMultilineSupported addBottomSafeAreaPadding={addBottomSafeAreaPadding}/>);
}
TaxPicker.displayName = 'TaxPicker';
exports.default = TaxPicker;
