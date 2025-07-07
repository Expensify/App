"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ExampleCheckImage() {
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var isSpanish = (preferredLocale !== null && preferredLocale !== void 0 ? preferredLocale : CONST_1.default.LOCALES.DEFAULT) === CONST_1.default.LOCALES.ES;
    return (<react_native_1.Image resizeMode="contain" style={[styles.exampleCheckImage, styles.mb5]} source={isSpanish ? illustrations.ExampleCheckES : illustrations.ExampleCheckEN}/>);
}
ExampleCheckImage.displayName = 'ExampleCheckImage';
exports.default = ExampleCheckImage;
