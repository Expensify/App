"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LongTermsForm_1 = require("@pages/EnablePayments/TermsPage/LongTermsForm");
var ShortTermsForm_1 = require("@pages/EnablePayments/TermsPage/ShortTermsForm");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function FeesStep(_a) {
    var onNext = _a.onNext;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    return (<ScrollView_1.default style={styles.flex1}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('termsStep.reviewTheFees')}</Text_1.default>
            <react_native_1.View style={[styles.ph5]}>
                <ShortTermsForm_1.default userWallet={userWallet}/>
                <LongTermsForm_1.default />
                <Button_1.default success large style={[styles.w100, styles.mv5]} onPress={onNext} text={translate('common.next')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
exports.default = FeesStep;
