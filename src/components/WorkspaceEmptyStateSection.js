"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Icon_1 = require("./Icon");
var Text_1 = require("./Text");
function WorkspaceEmptyStateSection(_a) {
    var icon = _a.icon, subtitle = _a.subtitle, title = _a.title, containerStyle = _a.containerStyle, _b = _a.shouldStyleAsCard, shouldStyleAsCard = _b === void 0 ? true : _b, subtitleComponent = _a.subtitleComponent;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<react_native_1.View style={[
            styles.pageWrapper,
            shouldStyleAsCard && styles.cardSectionContainer,
            styles.workspaceSection,
            styles.ph8,
            shouldUseNarrowLayout ? styles.pv10 : styles.pv12,
            containerStyle,
        ]}>
            <Icon_1.default src={icon} width={184} height={116}/>

            <react_native_1.View style={[styles.w100, styles.pt5]}>
                <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, styles.w100, styles.mh1, styles.flexShrink1]}>
                    <Text_1.default style={[styles.textHeadline, styles.emptyCardSectionTitle]}>{title}</Text_1.default>
                </react_native_1.View>

                {(!!subtitle || !!subtitleComponent) && (<react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, styles.w100, styles.mt1, styles.mh1]}>
                        {subtitleComponent !== null && subtitleComponent !== void 0 ? subtitleComponent : <Text_1.default style={[styles.textNormal, styles.emptyCardSectionSubtitle]}>{subtitle}</Text_1.default>}
                    </react_native_1.View>)}
            </react_native_1.View>
        </react_native_1.View>);
}
WorkspaceEmptyStateSection.displayName = 'WorkspaceEmptyStateSection';
exports.default = WorkspaceEmptyStateSection;
