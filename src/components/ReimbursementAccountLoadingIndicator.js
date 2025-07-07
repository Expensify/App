"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FullPageOfflineBlockingView_1 = require("./BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var Lottie_1 = require("./Lottie");
var LottieAnimations_1 = require("./LottieAnimations");
var ScreenWrapper_1 = require("./ScreenWrapper");
var Text_1 = require("./Text");
function ReimbursementAccountLoadingIndicator(_a) {
    var onBackButtonPress = _a.onBackButtonPress;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator={false} style={[react_native_1.StyleSheet.absoluteFillObject, styles.reimbursementAccountFullScreenLoading]} testID={ReimbursementAccountLoadingIndicator.displayName}>
            <HeaderWithBackButton_1.default title={translate('reimbursementAccountLoadingAnimation.oneMoment')} onBackButtonPress={onBackButtonPress}/>
            <FullPageOfflineBlockingView_1.default>
                <react_native_1.View style={styles.pageWrapper}>
                    <Lottie_1.default source={LottieAnimations_1.default.ReviewingBankInfo} autoPlay loop style={styles.loadingVBAAnimation} webStyle={styles.loadingVBAAnimationWeb}/>
                    <react_native_1.View style={styles.ph6}>
                        <Text_1.default style={styles.textAlignCenter}>{translate('reimbursementAccountLoadingAnimation.explanationLine')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
ReimbursementAccountLoadingIndicator.displayName = 'ReimbursementAccountLoadingIndicator';
exports.default = ReimbursementAccountLoadingIndicator;
