"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var MenuItem_1 = require("@components/MenuItem");
var Modal_1 = require("@components/Modal");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
function SearchSelectedNarrow(_a) {
    var options = _a.options, itemsLength = _a.itemsLength;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var selectedOptionIndexRef = (0, react_1.useRef)(-1);
    var _b = (0, react_1.useState)(false), isModalVisible = _b[0], setIsModalVisible = _b[1];
    var buttonRef = (0, react_1.useRef)(null);
    var openMenu = function () { return setIsModalVisible(true); };
    var closeMenu = function () { return setIsModalVisible(false); };
    var handleOnModalHide = function () {
        var _a, _b;
        if (selectedOptionIndexRef.current === -1) {
            return;
        }
        (_b = (_a = options[selectedOptionIndexRef.current]) === null || _a === void 0 ? void 0 : _a.onSelected) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    var handleOnMenuItemPress = function (option, index) {
        var _a;
        if (option === null || option === void 0 ? void 0 : option.shouldCloseModalOnSelect) {
            selectedOptionIndexRef.current = index;
            closeMenu();
            return;
        }
        (_a = option === null || option === void 0 ? void 0 : option.onSelected) === null || _a === void 0 ? void 0 : _a.call(option);
    };
    var handleOnCloseMenu = function () {
        selectedOptionIndexRef.current = -1;
        closeMenu();
    };
    return (<react_native_1.View style={[styles.pb3]}>
            <Button_1.default onPress={openMenu} ref={buttonRef} style={[styles.w100, styles.ph5]} text={translate('workspace.common.selected', { count: itemsLength })} isContentCentered iconRight={Expensicons.DownArrow} isDisabled={options.length === 0} shouldShowRightIcon={options.length !== 0} success/>
            <Modal_1.default isVisible={isModalVisible} type={CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} onClose={handleOnCloseMenu} onModalHide={handleOnModalHide}>
                {options.map(function (option, index) { return (<MenuItem_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...option} title={option.text} titleStyle={option.titleStyle} icon={option.icon} onPress={function () { return handleOnMenuItemPress(option, index); }} key={option.value}/>); })}
            </Modal_1.default>
        </react_native_1.View>);
}
SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';
exports.default = SearchSelectedNarrow;
