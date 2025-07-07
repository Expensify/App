"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EnvironmentBadge_1 = require("./EnvironmentBadge");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
function Header(_a) {
    var _b = _a.title, title = _b === void 0 ? '' : _b, _c = _a.subtitle, subtitle = _c === void 0 ? '' : _c, _d = _a.textStyles, textStyles = _d === void 0 ? [] : _d, style = _a.style, _e = _a.containerStyles, containerStyles = _e === void 0 ? [] : _e, _f = _a.shouldShowEnvironmentBadge, shouldShowEnvironmentBadge = _f === void 0 ? false : _f, _g = _a.subTitleLink, subTitleLink = _g === void 0 ? '' : _g, _h = _a.numberOfTitleLines, numberOfTitleLines = _h === void 0 ? 2 : _h;
    var styles = (0, useThemeStyles_1.default)();
    var renderedSubtitle = (0, react_1.useMemo)(function () { return (<>
                {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
                {typeof subtitle === 'string'
            ? !!subtitle && (<Text_1.default style={[styles.mutedTextLabel, styles.pre]} numberOfLines={1}>
                              {subtitle}
                          </Text_1.default>)
            : subtitle}
            </>); }, [subtitle, styles]);
    var renderedSubTitleLink = (0, react_1.useMemo)(function () { return (<TextLink_1.default onPress={function () {
            react_native_1.Linking.openURL(subTitleLink);
        }} numberOfLines={1} style={styles.label}>
                {subTitleLink}
            </TextLink_1.default>); }, [styles.label, subTitleLink]);
    return (<react_native_1.View style={[styles.flex1, styles.flexRow, containerStyles]}>
            <react_native_1.View style={[styles.mw100, style]}>
                {typeof title === 'string'
            ? !!title && (<Text_1.default numberOfLines={numberOfTitleLines} style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, textStyles]}>
                              {title}
                          </Text_1.default>)
            : title}
                {renderedSubtitle}
                {!!subTitleLink && renderedSubTitleLink}
            </react_native_1.View>
            {shouldShowEnvironmentBadge && <EnvironmentBadge_1.default />}
        </react_native_1.View>);
}
Header.displayName = 'Header';
exports.default = Header;
