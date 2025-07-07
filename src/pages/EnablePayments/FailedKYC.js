"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function FailedKYC() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flex1]}>
            <react_native_1.View style={[styles.ph5]}>
                <Text_1.default style={styles.mb3}>
                    {translate('additionalDetailsStep.failedKYCTextBefore')}
                    <TextLink_1.default href={"mailto:".concat(CONST_1.default.EMAIL.CONCIERGE)} style={[styles.link]}>
                        {CONST_1.default.EMAIL.CONCIERGE}
                    </TextLink_1.default>
                    {translate('additionalDetailsStep.failedKYCTextAfter')}
                </Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
FailedKYC.displayName = 'FailedKYC';
exports.default = FailedKYC;
