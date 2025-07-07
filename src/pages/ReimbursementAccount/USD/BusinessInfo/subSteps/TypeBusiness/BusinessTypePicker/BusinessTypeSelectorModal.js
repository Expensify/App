"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function BusinessTypeSelectorModal(_a) {
    var isVisible = _a.isVisible, currentBusinessType = _a.currentBusinessType, onBusinessTypeSelected = _a.onBusinessTypeSelected, onClose = _a.onClose, label = _a.label;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var incorporationTypes = (0, react_1.useMemo)(function () {
        return Object.keys(CONST_1.default.INCORPORATION_TYPES).map(function (key) { return ({
            value: key,
            text: translate("businessInfoStep.incorporationType.".concat(key)),
            keyForList: key,
            isSelected: key === currentBusinessType,
        }); });
    }, [currentBusinessType, translate]);
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} includeSafeAreaPaddingBottom={false} testID={BusinessTypeSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <SelectionList_1.default sections={[{ data: incorporationTypes }]} initiallyFocusedOptionKey={currentBusinessType} onSelectRow={onBusinessTypeSelected} shouldSingleExecuteRowSelect shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch ListItem={RadioListItem_1.default}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
BusinessTypeSelectorModal.displayName = 'BusinessTypeSelectorModal';
exports.default = BusinessTypeSelectorModal;
