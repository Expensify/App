"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Button_1 = require("./Button");
var MenuItem_1 = require("./MenuItem");
var Section_1 = require("./Section");
function FeatureList(_a) {
    var title = _a.title, _b = _a.subtitle, subtitle = _b === void 0 ? '' : _b, ctaText = _a.ctaText, ctaAccessibilityLabel = _a.ctaAccessibilityLabel, onCtaPress = _a.onCtaPress, menuItems = _a.menuItems, illustration = _a.illustration, illustrationStyle = _a.illustrationStyle, illustrationBackgroundColor = _a.illustrationBackgroundColor, illustrationContainerStyle = _a.illustrationContainerStyle, titleStyles = _a.titleStyles, contentPaddingOnLargeScreens = _a.contentPaddingOnLargeScreens, footer = _a.footer, _c = _a.isButtonDisabled, isButtonDisabled = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Section_1.default title={title} subtitle={subtitle} isCentralPane subtitleMuted illustration={illustration} illustrationBackgroundColor={illustrationBackgroundColor} illustrationStyle={illustrationStyle} titleStyles={titleStyles} illustrationContainerStyle={illustrationContainerStyle} contentPaddingOnLargeScreens={contentPaddingOnLargeScreens}>
            <react_native_1.View style={styles.flex1}>
                <react_native_1.View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pv4, styles.pl1]}>
                    {menuItems.map(function (_a) {
            var translationKey = _a.translationKey, icon = _a.icon;
            return (<react_native_1.View key={translationKey} style={styles.w100}>
                            <MenuItem_1.default title={translate(translationKey)} icon={icon} iconWidth={variables_1.default.menuIconSize} iconHeight={variables_1.default.menuIconSize} interactive={false} displayInDefaultIconColor wrapperStyle={[styles.p0, styles.cursorAuto]} containerStyle={[styles.m0, styles.wAuto]} numberOfLinesTitle={0}/>
                        </react_native_1.View>);
        })}
                </react_native_1.View>
                {!!ctaText && (<Button_1.default text={ctaText} onPress={onCtaPress} accessibilityLabel={ctaAccessibilityLabel} style={styles.w100} success isDisabled={isButtonDisabled} large/>)}
                {!!footer && footer}
            </react_native_1.View>
        </Section_1.default>);
}
FeatureList.displayName = 'FeatureList';
exports.default = FeatureList;
