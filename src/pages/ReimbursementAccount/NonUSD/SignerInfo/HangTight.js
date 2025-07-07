"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function HangTight(_a) {
    var tempSubmit = _a.tempSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var safeAreaInsetPaddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var handleSendReminder = function () {
        // TODO this should send a message to the email provided in the previous step
        tempSubmit();
    };
    return (<ScrollView_1.default style={styles.pt0} contentContainerStyle={[styles.flexGrow1, { paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom }]}>
            <react_native_1.View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View style={styles.mb5}>
                    <Icon_1.default width={144} height={132} src={Illustrations.Pillow}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3, styles.mt5]}>{translate('signerInfoStep.hangTight')}</Text_1.default>
                <Text_1.default style={[styles.mutedTextLabel, styles.mh5]}>{translate('signerInfoStep.weAreWaiting')}</Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={[styles.ph5, styles.flexGrow1, styles.justifyContentEnd]}>
                <Button_1.default success style={[styles.w100]} onPress={handleSendReminder} large icon={Expensicons.Bell} text={translate('signerInfoStep.sendReminder')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
HangTight.displayName = 'HangTight';
exports.default = HangTight;
