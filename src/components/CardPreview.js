"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ImageSVG_1 = require("./ImageSVG");
var Text_1 = require("./Text");
function CardPreview(_a) {
    var _b;
    var privatePersonalDetails = _a.privatePersonalDetails, session = _a.session;
    var styles = (0, useThemeStyles_1.default)();
    var _c = privatePersonalDetails !== null && privatePersonalDetails !== void 0 ? privatePersonalDetails : {}, legalFirstName = _c.legalFirstName, legalLastName = _c.legalLastName;
    var cardHolder = legalFirstName && legalLastName ? "".concat(legalFirstName, " ").concat(legalLastName) : ((_b = session === null || session === void 0 ? void 0 : session.email) !== null && _b !== void 0 ? _b : '');
    return (<react_native_1.View style={styles.walletCard}>
            <ImageSVG_1.default contentFit="contain" src={expensify_card_svg_1.default} pointerEvents="none" height={variables_1.default.cardPreviewHeight} width={variables_1.default.cardPreviewWidth}/>
            <Text_1.default style={styles.walletCardHolder} numberOfLines={1} ellipsizeMode="tail">
                {cardHolder}
            </Text_1.default>
        </react_native_1.View>);
}
CardPreview.displayName = 'CardPreview';
exports.default = (0, react_native_onyx_1.withOnyx)({
    privatePersonalDetails: {
        key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS_1.default.SESSION,
    },
})(CardPreview);
