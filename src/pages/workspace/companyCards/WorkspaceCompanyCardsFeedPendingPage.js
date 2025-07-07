"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var Illustrations_1 = require("@components/Icon/Illustrations");
var ScrollView_1 = require("@components/ScrollView");
var CardRowSkeleton_1 = require("@components/Skeletons/CardRowSkeleton");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
function WorkspaceCompanyCardsFeedPendingPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <EmptyStateComponent_1.default SkeletonComponent={CardRowSkeleton_1.default} containerStyles={styles.mt5} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION} headerMedia={Illustrations_1.CompanyCardsPendingState} headerStyles={[styles.emptyStateCardIllustrationContainer, { backgroundColor: colors_1.default.ice800 }]} headerContentStyles={styles.pendingStateCardIllustration} title={translate('workspace.moreFeatures.companyCards.pendingFeedTitle')}>
                <Text_1.default>
                    {translate('workspace.moreFeatures.companyCards.pendingFeedDescription')}
                    <TextLink_1.default onPress={function () { return (0, Report_1.navigateToConciergeChat)(); }}> {CONST_1.default.CONCIERGE_CHAT_NAME}</TextLink_1.default>.
                </Text_1.default>
            </EmptyStateComponent_1.default>
        </ScrollView_1.default>);
}
WorkspaceCompanyCardsFeedPendingPage.displayName = 'WorkspaceCompanyCardsFeedPendingPage';
exports.default = WorkspaceCompanyCardsFeedPendingPage;
