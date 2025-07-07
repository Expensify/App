"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var Illustrations = require("@components/Icon/Illustrations");
var ScrollView_1 = require("@components/ScrollView");
var CardRowSkeleton_1 = require("@components/Skeletons/CardRowSkeleton");
var Text_1 = require("@components/Text");
var useEmptyViewHeaderHeight_1 = require("@hooks/useEmptyViewHeaderHeight");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
function EmptyCardView(_a) {
    var isBankAccountVerified = _a.isBankAccountVerified;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var headerHeight = (0, useEmptyViewHeaderHeight_1.default)(shouldUseNarrowLayout, isBankAccountVerified);
    return (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]} addBottomSafeAreaPadding>
            <react_native_1.View style={[{ height: windowHeight - headerHeight }, styles.pt5]}>
                <EmptyStateComponent_1.default SkeletonComponent={CardRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION} headerMedia={isBankAccountVerified ? Illustrations.EmptyCardState : Illustrations.CompanyCardsPendingState} headerStyles={isBankAccountVerified
            ? [
                {
                    overflow: 'hidden',
                    backgroundColor: colors_1.default.green700,
                },
                shouldUseNarrowLayout && { maxHeight: 250 },
            ]
            : [styles.emptyStateCardIllustrationContainer, { backgroundColor: colors_1.default.ice800 }]} title={translate("workspace.expensifyCard.".concat(isBankAccountVerified ? 'issueAndManageCards' : 'verificationInProgress'))} subtitle={translate("workspace.expensifyCard.".concat(isBankAccountVerified ? 'getStartedIssuing' : 'verifyingTheDetails'))} headerContentStyles={isBankAccountVerified ? null : styles.pendingStateCardIllustration} minModalHeight={isBankAccountVerified ? 500 : 400}/>
            </react_native_1.View>
            <Text_1.default style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text_1.default>
        </ScrollView_1.default>);
}
EmptyCardView.displayName = 'EmptyCardView';
exports.default = EmptyCardView;
