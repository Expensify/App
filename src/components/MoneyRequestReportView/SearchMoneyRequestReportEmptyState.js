"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var LottieAnimations_1 = require("@components/LottieAnimations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var minModalHeight = 380;
function SearchMoneyRequestReportEmptyState() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={styles.flex1}>
            <EmptyStateComponent_1.default cardStyles={[styles.appBG]} cardContentStyles={[styles.pt5, styles.pb0]} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ANIMATION} headerMedia={LottieAnimations_1.default.GenericEmptyState} title={translate('search.moneyRequestReport.emptyStateTitle')} subtitle={translate('search.moneyRequestReport.emptyStateSubtitle')} headerStyles={[styles.emptyStateMoneyRequestReport]} lottieWebViewStyles={styles.emptyStateFolderWebStyles} headerContentStyles={styles.emptyStateFolderWebStyles} minModalHeight={minModalHeight}/>
        </react_native_1.View>);
}
SearchMoneyRequestReportEmptyState.displayName = 'SearchMoneyRequestReportEmptyState';
exports.default = SearchMoneyRequestReportEmptyState;
