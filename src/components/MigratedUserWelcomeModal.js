"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Welcome_1 = require("@libs/actions/Welcome");
var convertToLTR_1 = require("@libs/convertToLTR");
var Fullstory_1 = require("@libs/Fullstory");
var Navigation_1 = require("@libs/Navigation/Navigation");
var onboardingSelectors_1 = require("@libs/onboardingSelectors");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var FeatureTrainingModal_1 = require("./FeatureTrainingModal");
var Icon_1 = require("./Icon");
var Illustrations = require("./Icon/Illustrations");
var LottieAnimations_1 = require("./LottieAnimations");
var RenderHTML_1 = require("./RenderHTML");
var ExpensifyFeatures = [
    {
        icon: Illustrations.ChatBubbles,
        translationKey: 'migratedUserWelcomeModal.features.chat',
    },
    {
        icon: Illustrations.Flash,
        translationKey: 'migratedUserWelcomeModal.features.scanReceipt',
    },
    {
        icon: Illustrations.ExpensifyMobileApp,
        translationKey: 'migratedUserWelcomeModal.features.crossPlatform',
    },
];
function OnboardingWelcomeVideo() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _b = (0, react_1.useState)(true), isModalDisabled = _b[0], setIsModalDisabled = _b[1];
    var route = (0, native_1.useRoute)();
    var shouldOpenSearch = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.shouldOpenSearch) === 'true';
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, {
        selector: onboardingSelectors_1.tryNewDotOnyxSelector,
        canBeMissing: true,
    }), tryNewDot = _c[0], tryNewDotMetadata = _c[1];
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, { canBeMissing: true }), dismissedProductTraining = _d[0], dismissedProductTrainingMetadata = _d[1];
    (0, react_1.useEffect)(function () {
        if ((0, isLoadingOnyxValue_1.default)(tryNewDotMetadata, dismissedProductTrainingMetadata)) {
            return;
        }
        var hasBeenAddedToNudgeMigration = (tryNewDot !== null && tryNewDot !== void 0 ? tryNewDot : {}).hasBeenAddedToNudgeMigration;
        if (!!(hasBeenAddedToNudgeMigration && !(dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining.migratedUserWelcomeModal)) || !shouldOpenSearch) {
            return;
        }
        setIsModalDisabled(false);
        var defaultCannedQuery = (0, SearchQueryUtils_1.buildCannedSearchQuery)();
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: defaultCannedQuery }));
    }, [dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining.migratedUserWelcomeModal, setIsModalDisabled, tryNewDotMetadata, dismissedProductTrainingMetadata, tryNewDot, shouldOpenSearch]);
    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    (0, react_1.useLayoutEffect)(Fullstory_1.parseFSAttributes, []);
    return (<FeatureTrainingModal_1.default 
    // We would like to show the Lottie animation instead of a video
    videoURL="" title={translate('migratedUserWelcomeModal.title')} description={translate('migratedUserWelcomeModal.subtitle')} confirmText={translate('migratedUserWelcomeModal.confirmText')} animation={LottieAnimations_1.default.WorkspacePlanet} onClose={function () {
            (0, Welcome_1.dismissProductTraining)(CONST_1.default.MIGRATED_USER_WELCOME_MODAL);
        }} animationStyle={[styles.emptyWorkspaceIllustrationStyle]} illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations_1.default.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]} illustrationOuterContainerStyle={styles.p0} contentInnerContainerStyles={[styles.mb5, styles.gap2]} contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]} modalInnerContainerStyle={__assign(__assign({}, styles.pt0), (shouldUseNarrowLayout ? {} : styles.pb8))} isModalDisabled={isModalDisabled}>
            <react_native_1.View style={[styles.gap3, styles.pt1, styles.pl1]} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                {ExpensifyFeatures.map(function (_a) {
            var translationKey = _a.translationKey, icon = _a.icon;
            return (<react_native_1.View key={translationKey} style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto]}>
                        <Icon_1.default src={icon} height={variables_1.default.menuIconSize} width={variables_1.default.menuIconSize}/>
                        <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto, styles.flex1, styles.ml6]}>
                            <RenderHTML_1.default html={"<comment>".concat((0, convertToLTR_1.default)(translate(translationKey)), "</comment>")}/>
                        </react_native_1.View>
                    </react_native_1.View>);
        })}
            </react_native_1.View>
        </FeatureTrainingModal_1.default>);
}
OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
exports.default = OnboardingWelcomeVideo;
