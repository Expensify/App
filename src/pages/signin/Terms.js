"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function Terms() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, react_1.useMemo)(function () { return [
        [styles.textExtraSmallSupporting, styles.link],
        [styles.textExtraSmallSupporting, styles.mb4],
    ]; }, [styles]), linkStyles = _a[0], containerStyles = _a[1];
    return (<Text_1.default style={containerStyles}>
            {translate('termsOfUse.phrase1')}
            <TextLink_1.default style={linkStyles} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>
                {' '}
                {translate('termsOfUse.phrase2')}{' '}
            </TextLink_1.default>
            {translate('termsOfUse.phrase3')}
            <TextLink_1.default style={linkStyles} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>
                {' '}
                {translate('termsOfUse.phrase4')}
            </TextLink_1.default>
            {'. '}
        </Text_1.default>);
}
Terms.displayName = 'Terms';
exports.default = Terms;
