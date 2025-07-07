"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function DowngradeIntro(_a) {
    var onDowngrade = _a.onDowngrade, buttonDisabled = _a.buttonDisabled, loading = _a.loading, policyID = _a.policyID, backTo = _a.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var isExtraSmallScreenWidth = (0, useResponsiveLayout_1.default)().isExtraSmallScreenWidth;
    var benefits = [
        translate('workspace.downgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit4'),
    ];
    return (<react_native_1.View style={[styles.m5, styles.workspaceUpgradeIntroBox({ isExtraSmallScreenWidth: isExtraSmallScreenWidth })]}>
            <react_native_1.View style={[styles.mb3]}>
                <Icon_1.default src={Illustrations.Mailbox} width={48} height={48}/>
            </react_native_1.View>
            <react_native_1.View style={styles.mb5}>
                <Text_1.default style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.downgrade.commonFeatures.title')}</Text_1.default>
                <Text_1.default style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('workspace.downgrade.commonFeatures.note')}</Text_1.default>
                {benefits.map(function (benefit) { return (<react_native_1.View key={benefit} style={[styles.pl2, styles.flexRow]}>
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>• </Text_1.default>
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{benefit}</Text_1.default>
                    </react_native_1.View>); })}
                <Text_1.default style={[styles.textNormal, styles.textSupporting, styles.mt4]}>
                    {translate('workspace.downgrade.commonFeatures.benefits.note')}{' '}
                    <TextLink_1.default style={[styles.link]} onPress={function () { return (0, Link_1.openLink)(CONST_1.default.PLAN_TYPES_AND_PRICING_HELP_URL, environmentURL); }}>
                        {translate('workspace.downgrade.commonFeatures.benefits.pricingPage')}
                    </TextLink_1.default>
                    .
                </Text_1.default>
                {policyID ? (<Text_1.default style={[styles.mv4]}>
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.confirm')}</Text_1.default>{' '}
                        <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.warning')}</Text_1.default>
                    </Text_1.default>) : (<Text_1.default style={[styles.mv4]}>
                        <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.headsUp')}</Text_1.default>{' '}
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.multiWorkspaceNote')}</Text_1.default>{' '}
                        <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.common.goToWorkspaces')}</Text_1.default>{' '}
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.selectStep')}</Text_1.default>{' '}
                        <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.type.collect')}</Text_1.default>.
                    </Text_1.default>)}
            </react_native_1.View>
            {policyID ? (<Button_1.default isLoading={loading} text={translate('common.downgradeWorkspace')} success onPress={onDowngrade} isDisabled={buttonDisabled} large/>) : (<Button_1.default text={translate('workspace.common.goToWorkspaces')} success onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACES_LIST.getRoute(backTo !== null && backTo !== void 0 ? backTo : Navigation_1.default.getActiveRoute()), { forceReplace: true }); }} large/>)}
        </react_native_1.View>);
}
exports.default = DowngradeIntro;
