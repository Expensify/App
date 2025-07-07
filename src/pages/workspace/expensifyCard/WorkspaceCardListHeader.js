"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
function WorkspaceCardListHeader(_a) {
    var _b;
    var cardSettings = _a.cardSettings;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isMediumScreenWidth = _c.isMediumScreenWidth, isSmallScreenWidth = _c.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    var errorMessage = (_b = (0, ErrorUtils_1.getLatestErrorMessage)(cardSettings)) !== null && _b !== void 0 ? _b : '';
    return (<react_native_1.View style={styles.appBG}>
            {!!errorMessage && (<react_native_1.View style={[styles.mh5, styles.pr4, styles.mt2]}>
                    <FormHelpMessage_1.default isError message={errorMessage}/>
                </react_native_1.View>)}
            <react_native_1.View style={[styles.flexRow, styles.mh5, styles.gap2, styles.p4, isLessThanMediumScreen ? styles.mt3 : styles.mt5]}>
                <react_native_1.View style={[styles.flexRow, styles.flex4, styles.gap2, styles.alignItemsCenter]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                        {translate('workspace.expensifyCard.name')}
                    </Text_1.default>
                </react_native_1.View>
                {!shouldUseNarrowLayout && (<react_native_1.View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentStart]}>
                        <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                            {translate('common.type')}
                        </Text_1.default>
                    </react_native_1.View>)}
                <react_native_1.View style={[
            styles.flexRow,
            styles.gap2,
            shouldUseNarrowLayout ? styles.flex2 : styles.flex1,
            styles.alignItemsCenter,
            shouldUseNarrowLayout ? styles.justifyContentCenter : styles.justifyContentStart,
        ]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                        {translate('workspace.expensifyCard.lastFour')}
                    </Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.flexRow, shouldUseNarrowLayout ? styles.flex3 : styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                        {translate('workspace.expensifyCard.limit')}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
WorkspaceCardListHeader.displayName = 'WorkspaceCardListHeader';
exports.default = WorkspaceCardListHeader;
