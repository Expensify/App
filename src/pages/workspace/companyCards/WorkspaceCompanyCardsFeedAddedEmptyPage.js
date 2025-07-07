"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ScrollView_1 = require("@components/ScrollView");
var CardRowSkeleton_1 = require("@components/Skeletons/CardRowSkeleton");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
function WorkspaceCompanyCardsFeedAddedEmptyPage(_a) {
    var handleAssignCard = _a.handleAssignCard, isDisabledAssignCardButton = _a.isDisabledAssignCardButton, shouldShowGBDisclaimer = _a.shouldShowGBDisclaimer;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]} addBottomSafeAreaPadding>
            <EmptyStateComponent_1.default SkeletonComponent={CardRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION} headerMedia={Illustrations.CompanyCardsEmptyState} containerStyles={styles.mt5} headerStyles={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart, { backgroundColor: colors_1.default.blue700 }]} headerContentStyles={styles.emptyStateCardIllustration} title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')} subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')} buttons={[
            {
                buttonText: translate('workspace.companyCards.assignCard'),
                buttonAction: handleAssignCard,
                icon: Expensicons.Plus,
                success: true,
                isDisabled: isDisabledAssignCardButton,
            },
        ]}/>
            {!!shouldShowGBDisclaimer && <Text_1.default style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text_1.default>}
        </ScrollView_1.default>);
}
WorkspaceCompanyCardsFeedAddedEmptyPage.displayName = 'WorkspaceCompanyCardsFeedAddedEmptyPage';
exports.default = WorkspaceCompanyCardsFeedAddedEmptyPage;
