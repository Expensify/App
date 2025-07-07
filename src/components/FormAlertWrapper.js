"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormHelpMessage_1 = require("./FormHelpMessage");
var RenderHTML_1 = require("./RenderHTML");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
// The FormAlertWrapper offers a standardized way of showing error messages and offline functionality.
//
// This component takes other components as a child prop. It will then render any wrapped components as a function using "render props",
// and passes it a (bool) isOffline parameter. Child components can then use the isOffline variable to determine offline behavior.
function FormAlertWrapper(_a) {
    var children = _a.children, containerStyles = _a.containerStyles, errorMessageStyle = _a.errorMessageStyle, _b = _a.isAlertVisible, isAlertVisible = _b === void 0 ? false : _b, _c = _a.isMessageHtml, isMessageHtml = _c === void 0 ? false : _c, _d = _a.message, message = _d === void 0 ? '' : _d, _e = _a.onFixTheErrorsLinkPressed, onFixTheErrorsLinkPressed = _e === void 0 ? function () { } : _e;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var content;
    if (!(message === null || message === void 0 ? void 0 : message.length)) {
        content = (<Text_1.default style={[styles.formError, styles.mb0]}>
                {"".concat(translate('common.please'), " ")}
                <TextLink_1.default style={styles.label} onPress={onFixTheErrorsLinkPressed}>
                    {translate('common.fixTheErrors')}
                </TextLink_1.default>
                {" ".concat(translate('common.inTheFormBeforeContinuing'), ".")}
            </Text_1.default>);
    }
    else if (isMessageHtml && typeof message === 'string') {
        content = <RenderHTML_1.default html={"<alert-text>".concat(message, "</alert-text>")}/>;
    }
    return (<react_native_1.View style={containerStyles}>
            {isAlertVisible && (<FormHelpMessage_1.default message={message} style={[styles.mb3, errorMessageStyle]}>
                    {content}
                </FormHelpMessage_1.default>)}
            {children(isOffline)}
        </react_native_1.View>);
}
FormAlertWrapper.displayName = 'FormAlertWrapper';
exports.default = FormAlertWrapper;
