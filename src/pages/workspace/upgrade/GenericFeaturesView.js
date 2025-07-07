"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function GenericFeaturesView(_a) {
    var onUpgrade = _a.onUpgrade, buttonDisabled = _a.buttonDisabled, loading = _a.loading, formattedPrice = _a.formattedPrice, backTo = _a.backTo, policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isExtraSmallScreenWidth = (0, useResponsiveLayout_1.default)().isExtraSmallScreenWidth;
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var benefits = [
        translate('workspace.upgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit4'),
    ];
    return (<react_native_1.View style={[styles.m5, styles.workspaceUpgradeIntroBox({ isExtraSmallScreenWidth: isExtraSmallScreenWidth })]}>
            <react_native_1.View style={[styles.mb3]}>
                <Icon_1.default src={Illustrations.ShieldYellow} width={48} height={48}/>
            </react_native_1.View>
            <react_native_1.View style={policyID ? styles.mb5 : styles.mb4}>
                <Text_1.default style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.title')}</Text_1.default>
                <Text_1.default style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.note')}</Text_1.default>
                {benefits.map(function (benefit) { return (<react_native_1.View key={benefit} style={[styles.pl2, styles.flexRow]}>
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>• </Text_1.default>
                        <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{benefit}</Text_1.default>
                    </react_native_1.View>); })}
                <Text_1.default style={[styles.textNormal, styles.textSupporting, styles.mt4]}>
                    {translate('workspace.upgrade.commonFeatures.benefits.startsAt')}
                    <Text_1.default style={[styles.textSupporting, styles.textBold]}>{formattedPrice}</Text_1.default>
                    {hasTeam2025Pricing ? translate('workspace.upgrade.pricing.perMember') : translate('workspace.upgrade.pricing.perActiveMember')}{' '}
                    <TextLink_1.default style={[styles.link]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.getRoute(Navigation_1.default.getActiveRoute())); }}>
                        {translate('workspace.upgrade.commonFeatures.benefits.learnMore')}
                    </TextLink_1.default>{' '}
                    {translate('workspace.upgrade.commonFeatures.benefits.pricing')}
                </Text_1.default>
            </react_native_1.View>
            {!policyID && (<Text_1.default style={[styles.mb5, styles.textNormal, styles.textSupporting]}>
                    <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.upgrade.commonFeatures.benefits.toUpgrade')}</Text_1.default>{' '}
                    <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.common.goToWorkspaces')}</Text_1.default>,{' '}
                    <Text_1.default style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.upgrade.commonFeatures.benefits.selectWorkspace')}</Text_1.default>{' '}
                    <Text_1.default style={[styles.textBold, styles.textSupporting]}>{translate('workspace.type.control')}</Text_1.default>.
                </Text_1.default>)}
            {policyID ? (<Button_1.default isLoading={loading} text={translate('common.upgrade')} success onPress={onUpgrade} isDisabled={buttonDisabled} large/>) : (<Button_1.default text={translate('workspace.common.goToWorkspaces')} success onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACES_LIST.getRoute(backTo !== null && backTo !== void 0 ? backTo : Navigation_1.default.getActiveRoute()), { forceReplace: true }); }} large/>)}
        </react_native_1.View>);
}
exports.default = GenericFeaturesView;
