"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var FullPageOfflineBlockingView_1 = require("./BlockingViews/FullPageOfflineBlockingView");
var CurrencySelectionList_1 = require("./CurrencySelectionList");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
var Modal_1 = require("./Modal");
var ScreenWrapper_1 = require("./ScreenWrapper");
function CurrencyPicker(_a) {
    var label = _a.label, value = _a.value, errorText = _a.errorText, headerContent = _a.headerContent, excludeCurrencies = _a.excludeCurrencies, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.shouldShowFullPageOfflineView, shouldShowFullPageOfflineView = _c === void 0 ? false : _c, _d = _a.shouldSyncPickerVisibilityWithNavigation, shouldSyncPickerVisibilityWithNavigation = _d === void 0 ? false : _d, _e = _a.shouldSaveCurrencyInNavigation, shouldSaveCurrencyInNavigation = _e === void 0 ? false : _e, _f = _a.onInputChange, onInputChange = _f === void 0 ? function () { } : _f;
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var navigation = (0, native_1.useNavigation)();
    var isPickerVisibleParam = route.params && 'isPickerVisible' in route.params && route.params.isPickerVisible === 'true';
    var _g = (0, react_1.useState)(isPickerVisibleParam !== null && isPickerVisibleParam !== void 0 ? isPickerVisibleParam : false), isPickerVisible = _g[0], setIsPickerVisible = _g[1];
    var styles = (0, useThemeStyles_1.default)();
    var hidePickerModal = function () {
        setIsPickerVisible(false);
        if (shouldSaveCurrencyInNavigation) {
            Navigation_1.default.setParams({ currency: value });
        }
    };
    var updateInput = function (item) {
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(item.currencyCode);
        hidePickerModal();
    };
    var BlockingComponent = shouldShowFullPageOfflineView ? FullPageOfflineBlockingView_1.default : react_1.Fragment;
    (0, react_1.useEffect)(function () {
        if (!shouldSyncPickerVisibilityWithNavigation) {
            return;
        }
        Navigation_1.default.setParams({ isPickerVisible: String(isPickerVisible) });
    }, [isPickerVisible, navigation, shouldSyncPickerVisibilityWithNavigation]);
    return (<>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={value ? "".concat(value, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(value)) : undefined} description={label} onPress={function () { return setIsPickerVisible(true); }} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} disabled={disabled}/>
            <Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isPickerVisible} onClose={hidePickerModal} onModalHide={hidePickerModal} hideModalContentWhileAnimating shouldEnableNewFocusManagement useNativeDriver onBackdropPress={Navigation_1.default.dismissModal} shouldUseModalPaddingStyle={false} shouldHandleNavigationBack enableEdgeToEdgeBottomSafeAreaPadding>
                <ScreenWrapper_1.default style={[styles.pb0]} testID={CurrencyPicker.displayName} shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={hidePickerModal}/>
                    <BlockingComponent>
                        {!!headerContent && headerContent}
                        <CurrencySelectionList_1.default initiallySelectedCurrencyCode={value} onSelect={updateInput} searchInputLabel={translate('common.search')} excludedCurrencies={excludeCurrencies} addBottomSafeAreaPadding/>
                    </BlockingComponent>
                </ScreenWrapper_1.default>
            </Modal_1.default>
        </>);
}
CurrencyPicker.displayName = 'CurrencyPicker';
exports.default = CurrencyPicker;
