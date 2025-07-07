"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
function DomainPermissionInfoPage(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={DomainPermissionInfoPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('travel.domainPermissionInfo.title')}/>
            <react_native_1.View style={[styles.flex1]}>
                <Text_1.default style={[styles.mt3, styles.mr5, styles.ml5]}>
                    {"".concat(translate('travel.domainPermissionInfo.restrictionPrefix'))} <Text_1.default style={styles.textStrong}>{route.params.domain}</Text_1.default>
                    {'. '}
                    {"".concat(translate('travel.domainPermissionInfo.restrictionSuffix'))}
                </Text_1.default>
                <Text_1.default style={[styles.mt3, styles.mr5, styles.ml5]}>
                    {"".concat(translate('travel.domainPermissionInfo.accountantInvitationPrefix'))}{' '}
                    <TextLink_1.default onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL); }}>
                        {"".concat(translate('travel.domainPermissionInfo.accountantInvitationLink'))}
                    </TextLink_1.default>{' '}
                    {"".concat(translate('travel.domainPermissionInfo.accountantInvitationSuffix'))}
                </Text_1.default>
            </react_native_1.View>
            <FixedFooter_1.default>
                <Button_1.default success large style={[styles.w100]} onPress={function () { return Navigation_1.default.closeRHPFlow(); }} text={translate('common.buttonConfirm')}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
DomainPermissionInfoPage.displayName = 'DomainPermissionInfoPage';
exports.default = DomainPermissionInfoPage;
