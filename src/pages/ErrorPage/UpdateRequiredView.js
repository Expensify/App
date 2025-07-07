"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Header_1 = require("@components/Header");
var HeaderGap_1 = require("@components/HeaderGap");
var Lottie_1 = require("@components/Lottie");
var LottieAnimations_1 = require("@components/LottieAnimations");
var Text_1 = require("@components/Text");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AppUpdate_1 = require("@userActions/AppUpdate");
var CONFIG_1 = require("@src/CONFIG");
function UpdateRequiredView() {
    var insets = (0, useSafeAreaInsets_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isProduction = (0, useEnvironment_1.default)().isProduction;
    var isStandaloneNewAppProduction = isProduction && !CONFIG_1.default.IS_HYBRID_APP;
    return (<react_native_1.View style={[styles.appBG, styles.h100, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
            <HeaderGap_1.default />
            <react_native_1.View style={[styles.pt5, styles.ph5, styles.updateRequiredViewHeader]}>
                <Header_1.default title={translate('updateRequiredView.updateRequired')}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flex1, StyleUtils.getUpdateRequiredViewStyles(shouldUseNarrowLayout)]}>
                <Lottie_1.default source={LottieAnimations_1.default.Update} 
    // For small screens it looks better to have the arms from the animation come in from the edges of the screen.
    style={shouldUseNarrowLayout ? styles.w100 : styles.updateAnimation} webStyle={shouldUseNarrowLayout ? styles.w100 : styles.updateAnimation} autoPlay loop/>
                <react_native_1.View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                    <react_native_1.View style={styles.updateRequiredViewTextContainer}>
                        <react_native_1.View style={[styles.mb3]}>
                            <Text_1.default style={[styles.newKansasLarge, styles.textAlignCenter]}>
                                {isStandaloneNewAppProduction ? translate('updateRequiredView.pleaseInstallExpensifyClassic') : translate('updateRequiredView.pleaseInstall')}
                            </Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.mb5}>
                            <Text_1.default style={[styles.textAlignCenter, styles.textSupporting]}>
                                {isStandaloneNewAppProduction ? translate('updateRequiredView.newAppNotAvailable') : translate('updateRequiredView.toGetLatestChanges')}
                            </Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>
                <Button_1.default success large onPress={function () { return (0, AppUpdate_1.updateApp)(isProduction); }} text={translate('common.update')} style={styles.updateRequiredViewTextContainer}/>
            </react_native_1.View>
        </react_native_1.View>);
}
UpdateRequiredView.displayName = 'UpdateRequiredView';
exports.default = UpdateRequiredView;
