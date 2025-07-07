"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session = require("@userActions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AvatarWithDisplayName_1 = require("./AvatarWithDisplayName");
var Button_1 = require("./Button");
var ExpensifyWordmark_1 = require("./ExpensifyWordmark");
var Text_1 = require("./Text");
function AnonymousReportFooter(_a) {
    var _b = _a.isSmallSizeLayout, isSmallSizeLayout = _b === void 0 ? false : _b, report = _a.report, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={styles.anonymousRoomFooter(isSmallSizeLayout)}>
            <react_native_1.View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName_1.default report={report} isAnonymous shouldEnableDetailPageNavigation policy={policy}/>
            </react_native_1.View>
            <react_native_1.View style={styles.anonymousRoomFooterWordmarkAndLogoContainer(isSmallSizeLayout)}>
                <react_native_1.View style={[isSmallSizeLayout ? styles.mr1 : styles.mr4, styles.flexShrink1]}>
                    <react_native_1.View style={[isSmallSizeLayout ? styles.alignItemsStart : styles.alignItemsEnd]}>
                        <ExpensifyWordmark_1.default style={styles.anonymousRoomFooterLogo}/>
                    </react_native_1.View>
                    <Text_1.default style={styles.anonymousRoomFooterLogoTaglineText}>{translate('anonymousReportFooter.logoTagline')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.anonymousRoomFooterSignInButton]}>
                    <Button_1.default success text={translate('common.signIn')} onPress={function () { return Session.signOutAndRedirectToSignIn(); }}/>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
AnonymousReportFooter.displayName = 'AnonymousReportFooter';
exports.default = (0, react_native_onyx_1.withOnyx)({
    policy: {
        key: function (_a) {
            var report = _a.report;
            return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID);
        },
    },
})(AnonymousReportFooter);
