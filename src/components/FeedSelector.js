"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CaretWrapper_1 = require("./CaretWrapper");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PlaidCardFeedIcon_1 = require("./PlaidCardFeedIcon");
var Pressable_1 = require("./Pressable");
var Text_1 = require("./Text");
function FeedSelector(_a) {
    var onFeedSelect = _a.onFeedSelect, cardIcon = _a.cardIcon, shouldChangeLayout = _a.shouldChangeLayout, feedName = _a.feedName, supportingText = _a.supportingText, _b = _a.shouldShowRBR, shouldShowRBR = _b === void 0 ? false : _b, _c = _a.plaidUrl, plaidUrl = _c === void 0 ? null : _c;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<Pressable_1.PressableWithFeedback onPress={onFeedSelect} style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]} accessibilityLabel={feedName !== null && feedName !== void 0 ? feedName : ''}>
            {plaidUrl ? (<PlaidCardFeedIcon_1.default plaidUrl={plaidUrl}/>) : (<Icon_1.default src={cardIcon} height={variables_1.default.cardIconHeight} width={variables_1.default.cardIconWidth} additionalStyles={styles.cardIcon}/>)}
            <react_native_1.View style={styles.flex1}>
                <react_native_1.View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
                    <CaretWrapper_1.default style={styles.flex1}>
                        <Text_1.default style={[styles.textStrong, styles.flexShrink1]}>{feedName}</Text_1.default>
                    </CaretWrapper_1.default>
                    {shouldShowRBR && (<Icon_1.default src={Expensicons.DotIndicator} fill={theme.danger}/>)}
                </react_native_1.View>
                <Text_1.default style={styles.textLabelSupporting}>{supportingText}</Text_1.default>
            </react_native_1.View>
        </Pressable_1.PressableWithFeedback>);
}
exports.default = FeedSelector;
