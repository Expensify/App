"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_wallet_1 = require("@expensify/react-native-wallet");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var index_1 = require("@libs/Wallet/index");
var CONST_1 = require("@src/CONST");
function AddToWalletButton(_a) {
    var card = _a.card, cardHolderName = _a.cardHolderName, cardDescription = _a.cardDescription, buttonStyle = _a.buttonStyle;
    var _b = react_1.default.useState(false), isWalletAvailable = _b[0], setIsWalletAvailable = _b[1];
    var _c = react_1.default.useState(null), isInWallet = _c[0], setIsInWallet = _c[1];
    var translate = (0, useLocalize_1.default)().translate;
    var isCardAvailable = card.state === CONST_1.default.EXPENSIFY_CARD.STATE.OPEN;
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var theme = (0, useTheme_1.default)();
    var platform = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS ? 'Apple' : 'Google';
    var styles = (0, useThemeStyles_1.default)();
    var checkIfCardIsInWallet = (0, react_1.useCallback)(function () {
        (0, index_1.isCardInWallet)(card)
            .then(function (result) {
            setIsInWallet(result);
        })
            .catch(function () {
            setIsInWallet(false);
        })
            .finally(function () {
            setIsLoading(false);
        });
    }, [card]);
    var handleOnPress = (0, react_1.useCallback)(function () {
        setIsLoading(true);
        (0, index_1.handleAddCardToWallet)(card, cardHolderName, cardDescription, function () { return setIsLoading(false); })
            .then(function (status) {
            if (status === 'success') {
                Log_1.default.info('Card added to wallet');
                (0, PaymentMethods_1.openWalletPage)();
            }
            else {
                setIsLoading(false);
            }
        })
            .catch(function (error) {
            setIsLoading(false);
            Log_1.default.warn("Error while adding card to wallet: ".concat(error));
            react_native_1.Alert.alert('Failed to add card to wallet', 'Please try again later.');
        });
    }, [card, cardDescription, cardHolderName]);
    (0, react_1.useEffect)(function () {
        if (!isCardAvailable) {
            return;
        }
        checkIfCardIsInWallet();
    }, [checkIfCardIsInWallet, isCardAvailable, card]);
    (0, react_1.useEffect)(function () {
        if (!isCardAvailable) {
            return;
        }
        (0, index_1.checkIfWalletIsAvailable)()
            .then(function (result) {
            setIsWalletAvailable(result);
        })
            .catch(function () {
            setIsWalletAvailable(false);
        });
    }, [isCardAvailable]);
    if (!isWalletAvailable || isInWallet == null || !isCardAvailable) {
        return null;
    }
    if (isLoading) {
        return (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} color={theme.spinner}/>);
    }
    if (isInWallet) {
        return (<react_native_1.View style={buttonStyle}>
                <Text_1.default style={[styles.textLabelSupporting, styles.mt6]}>{translate('cardPage.cardAddedToWallet', { platform: platform })}</Text_1.default>
            </react_native_1.View>);
    }
    return (<react_native_wallet_1.AddToWalletButton buttonStyle={buttonStyle} locale="en" onPress={handleOnPress}/>);
}
AddToWalletButton.displayName = 'AddToWalletButton';
exports.default = AddToWalletButton;
