"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Illustrations = require("./Icon/Illustrations");
var Image_1 = require("./Image");
function PlaidCardFeedIcon(_a) {
    var plaidUrl = _a.plaidUrl, style = _a.style, isLarge = _a.isLarge;
    var _b = (0, react_1.useState)(false), isBrokenImage = _b[0], setIsBrokenImage = _b[1];
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var theme = (0, useTheme_1.default)();
    var width = isLarge ? variables_1.default.cardPreviewWidth : variables_1.default.cardIconWidth;
    var height = isLarge ? variables_1.default.cardPreviewHeight : variables_1.default.cardIconHeight;
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        if (!plaidUrl) {
            return;
        }
        setIsBrokenImage(false);
        setLoading(true);
    }, [plaidUrl]);
    return (<react_native_1.View style={[style]}>
            {isBrokenImage ? (<Icon_1.default src={illustrations.GenericCompanyCardLarge} height={height} width={width} additionalStyles={styles.cardIcon}/>) : (<>
                    <Image_1.default source={{ uri: plaidUrl }} style={isLarge ? styles.plaidIcon : styles.plaidIconSmall} cachePolicy="memory-disk" onError={function () { return setIsBrokenImage(true); }} onLoadEnd={function () { return setLoading(false); }}/>
                    {loading ? (<react_native_1.View style={[styles.justifyContentCenter, { width: width, height: height }]}>
                            <react_native_1.ActivityIndicator color={theme.spinner} size={20}/>
                        </react_native_1.View>) : (<Icon_1.default src={isLarge ? Illustrations.PlaidCompanyCardDetailLarge : Illustrations.PlaidCompanyCardDetail} height={height} width={width}/>)}
                </>)}
        </react_native_1.View>);
}
exports.default = PlaidCardFeedIcon;
