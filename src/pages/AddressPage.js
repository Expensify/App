"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressForm_1 = require("@components/AddressForm");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var HomeAddressForm_1 = require("@src/types/form/HomeAddressForm");
function AddressPage(_a) {
    var _b;
    var title = _a.title, address = _a.address, updateAddress = _a.updateAddress, _c = _a.isLoadingApp, isLoadingApp = _c === void 0 ? true : _c, backTo = _a.backTo, defaultCountry = _a.defaultCountry;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // Check if country is valid
    var street = (address !== null && address !== void 0 ? address : {}).street;
    var _d = street ? street.split('\n') : [undefined, undefined], street1 = _d[0], street2 = _d[1];
    var _e = (0, react_1.useState)((_b = address === null || address === void 0 ? void 0 : address.country) !== null && _b !== void 0 ? _b : defaultCountry), currentCountry = _e[0], setCurrentCountry = _e[1];
    var _f = (0, react_1.useState)(address === null || address === void 0 ? void 0 : address.state), state = _f[0], setState = _f[1];
    var _g = (0, react_1.useState)(address === null || address === void 0 ? void 0 : address.city), city = _g[0], setCity = _g[1];
    var _h = (0, react_1.useState)(address === null || address === void 0 ? void 0 : address.zip), zipcode = _h[0], setZipcode = _h[1];
    (0, react_1.useEffect)(function () {
        if (!address) {
            return;
        }
        setState(address.state);
        setCurrentCountry(address.country);
        setCity(address.city);
        setZipcode(address.zip);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [address === null || address === void 0 ? void 0 : address.state, address === null || address === void 0 ? void 0 : address.country, address === null || address === void 0 ? void 0 : address.city, address === null || address === void 0 ? void 0 : address.zip]);
    var handleAddressChange = (0, react_1.useCallback)(function (value, key) {
        var addressPart = value;
        var addressPartKey = key;
        if (addressPartKey !== HomeAddressForm_1.default.COUNTRY && addressPartKey !== HomeAddressForm_1.default.STATE && addressPartKey !== HomeAddressForm_1.default.CITY && addressPartKey !== HomeAddressForm_1.default.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === HomeAddressForm_1.default.COUNTRY && addressPart !== currentCountry) {
            setCurrentCountry(addressPart);
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === HomeAddressForm_1.default.STATE) {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === HomeAddressForm_1.default.CITY) {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    }, [currentCountry]);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={AddressPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={title} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<AddressForm_1.default formID={ONYXKEYS_1.default.FORMS.HOME_ADDRESS_FORM} onSubmit={updateAddress} submitButtonText={translate('common.save')} city={city} country={currentCountry} onAddressChanged={handleAddressChange} state={state} street1={street1} street2={street2} zip={zipcode}/>)}
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
AddressPage.displayName = 'AddressPage';
exports.default = AddressPage;
