"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BookTravelButton_1 = require("@components/BookTravelButton");
var Button_1 = require("@components/Button");
var FeatureList_1 = require("@components/FeatureList");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
var tripsFeatures = [
    {
        icon: Illustrations.PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Illustrations.Alert,
        translationKey: 'travel.features.alerts',
    },
];
function ManageTrips() {
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, react_1.useState)(false), shouldScrollToBottom = _a[0], setShouldScrollToBottom = _a[1];
    var navigateToBookTravelDemo = function () {
        react_native_1.Linking.openURL(CONST_1.default.BOOK_TRAVEL_DEMO_URL);
    };
    var scrollViewRef = (0, react_1.useRef)(null);
    var scrollToBottom = function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            var _a;
            (_a = scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true });
        });
    };
    (0, react_1.useEffect)(function () {
        if (!shouldScrollToBottom) {
            return;
        }
        scrollToBottom();
        setShouldScrollToBottom(false);
    }, [shouldScrollToBottom]);
    return (<ScrollView_1.default contentContainerStyle={styles.pt3} ref={scrollViewRef}>
            <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList_1.default menuItems={tripsFeatures} title={translate('travel.title')} subtitle={translate('travel.subtitle')} illustration={LottieAnimations_1.default.TripsEmptyState} illustrationStyle={[styles.mv4]} illustrationBackgroundColor={colors_1.default.blue600} titleStyles={styles.textHeadlineH1} contentPaddingOnLargeScreens={styles.p5} footer={<>
                            <Button_1.default text={translate('travel.bookDemo')} onPress={navigateToBookTravelDemo} accessibilityLabel={translate('travel.bookDemo')} style={[styles.w100, styles.mb3]} large/>
                            <BookTravelButton_1.default text={translate('travel.bookTravel')} shouldRenderErrorMessageBelowButton setShouldScrollToBottom={setShouldScrollToBottom}/>
                        </>}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
ManageTrips.displayName = 'ManageTrips';
exports.default = ManageTrips;
