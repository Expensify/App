"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var CONST_1 = require("@src/CONST");
var keyboard_1 = require("@src/utils/keyboard");
var PushRowModal_1 = require("./PushRowModal");
function PushRowWithModal(_a) {
    var value = _a.value, optionsList = _a.optionsList, wrapperStyles = _a.wrapperStyles, description = _a.description, modalHeaderTitle = _a.modalHeaderTitle, searchInputTitle = _a.searchInputTitle, _b = _a.shouldAllowChange, shouldAllowChange = _b === void 0 ? true : _b, errorText = _a.errorText, _c = _a.onInputChange, onInputChange = _c === void 0 ? function () { } : _c, stateInputIDToReset = _a.stateInputIDToReset, _d = _a.onBlur, onBlur = _d === void 0 ? function () { } : _d;
    var _e = (0, react_1.useState)(false), isModalVisible = _e[0], setIsModalVisible = _e[1];
    var shouldBlurOnCloseRef = (0, react_1.useRef)(true);
    var handleModalClose = function () {
        if (shouldBlurOnCloseRef.current) {
            onBlur === null || onBlur === void 0 ? void 0 : onBlur();
        }
        keyboard_1.default.dismiss().then(function () {
            setIsModalVisible(false);
        });
    };
    var handleModalOpen = function () {
        setIsModalVisible(true);
    };
    var handleOptionChange = function (optionValue) {
        onInputChange(optionValue);
        shouldBlurOnCloseRef.current = false;
        if (stateInputIDToReset) {
            onInputChange('', stateInputIDToReset);
        }
    };
    return (<>
            <MenuItemWithTopDescription_1.default description={description} title={value ? optionsList[value] : ''} shouldShowRightIcon={shouldAllowChange} onPress={handleModalOpen} wrapperStyle={wrapperStyles} interactive={shouldAllowChange} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText}/>
            <PushRowModal_1.default isVisible={isModalVisible} selectedOption={value !== null && value !== void 0 ? value : ''} onOptionChange={handleOptionChange} onClose={handleModalClose} optionsList={optionsList} headerTitle={modalHeaderTitle} searchInputTitle={searchInputTitle}/>
        </>);
}
PushRowWithModal.displayName = 'PushRowWithModal';
exports.default = PushRowWithModal;
