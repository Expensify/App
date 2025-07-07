"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Parser_1 = require("@libs/Parser");
var CONST_1 = require("@src/CONST");
function NetSuiteTokenSetupContent(_a) {
    var onNext = _a.onNext, screenIndex = _a.screenIndex;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var stepKeys = CONST_1.default.NETSUITE_CONFIG.TOKEN_INPUT_STEP_KEYS;
    var currentStepKey = stepKeys[(screenIndex !== null && screenIndex !== void 0 ? screenIndex : 0)];
    var titleKey = "workspace.netsuite.tokenInput.formSteps.".concat(currentStepKey, ".title");
    var description = "workspace.netsuite.tokenInput.formSteps.".concat(currentStepKey, ".description");
    return (<react_native_1.View style={styles.flex1}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate(titleKey)}</Text_1.default>
            <react_native_1.View style={[styles.flex1, styles.mb3, styles.ph5]}>
                <RenderHTML_1.default html={"<comment><muted-text>".concat(Parser_1.default.replace(translate(description)), "</muted-text></comment>")}/>
            </react_native_1.View>
            <FixedFooter_1.default style={[styles.mtAuto]}>
                <Button_1.default success large style={[styles.w100]} onPress={onNext} text={translate('common.next')}/>
            </FixedFooter_1.default>
        </react_native_1.View>);
}
NetSuiteTokenSetupContent.displayName = 'NetSuiteTokenSetupContent';
exports.default = NetSuiteTokenSetupContent;
