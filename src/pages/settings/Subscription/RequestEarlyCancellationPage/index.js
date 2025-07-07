"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FeedbackSurvey_1 = require("@components/FeedbackSurvey");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCancellationType_1 = require("@hooks/useCancellationType");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Subscription_1 = require("@libs/actions/Subscription");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function RequestEarlyCancellationPage() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var cancellationType = (0, useCancellationType_1.default)();
    var handleSubmit = function (cancellationReason, cancellationNote) {
        if (cancellationNote === void 0) { cancellationNote = ''; }
        setIsLoading(true);
        (0, Subscription_1.cancelBillingSubscription)(cancellationReason, cancellationNote);
    };
    var acknowledgementText = (0, react_1.useMemo)(function () { return <RenderHTML_1.default html={translate('subscription.requestEarlyCancellation.acknowledgement')}/>; }, [translate]);
    var manualCancellationContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <react_native_1.View>
                    <Text_1.default style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.requestSubmitted.title')}</Text_1.default>
                    <Text_1.default style={[styles.mt1, styles.textNormalThemeText]}>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part1')}
                        <TextLink_1.default onPress={function () { return (0, Report_1.navigateToConciergeChat)(); }}>{translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.link')}</TextLink_1.default>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part2')}
                    </Text_1.default>
                </react_native_1.View>
                <FixedFooter_1.default style={styles.ph0}>
                    <Button_1.default success text={translate('common.done')} onPress={function () { return Navigation_1.default.goBack(); }} large/>
                </FixedFooter_1.default>
            </react_native_1.View>); }, [styles, translate]);
    var automaticCancellationContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <react_native_1.View>
                    <Text_1.default style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.title')}</Text_1.default>
                    <Text_1.default style={[styles.mt1, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.subtitle')}</Text_1.default>
                    <Text_1.default style={[styles.mv4, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.info')}</Text_1.default>
                    <Text_1.default>
                        {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.part1')}
                        <TextLink_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACES_LIST.route); }}>
                            {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.link')}
                        </TextLink_1.default>
                        {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.part2')}
                    </Text_1.default>
                </react_native_1.View>
                <FixedFooter_1.default style={styles.ph0}>
                    <Button_1.default success text={translate('common.done')} onPress={function () { return Navigation_1.default.goBack(); }} large/>
                </FixedFooter_1.default>
            </react_native_1.View>); }, [styles, translate]);
    var surveyContent = (0, react_1.useMemo)(function () { return (<FeedbackSurvey_1.default formID={ONYXKEYS_1.default.FORMS.REQUEST_EARLY_CANCELLATION_FORM} title={translate('subscription.subscriptionSettings.helpUsImprove')} description={translate('subscription.requestEarlyCancellation.subtitle')} onSubmit={handleSubmit} optionRowStyles={styles.flex1} footerText={<Text_1.default style={[styles.mb2, styles.mt4]}>{acknowledgementText}</Text_1.default>} isNoteRequired isLoading={isLoading} enabledWhenOffline={false}/>); }, [acknowledgementText, isLoading, styles.flex1, styles.mb2, styles.mt4, translate]);
    var contentMap = (_a = {},
        _a[CONST_1.default.CANCELLATION_TYPE.MANUAL] = manualCancellationContent,
        _a[CONST_1.default.CANCELLATION_TYPE.AUTOMATIC] = automaticCancellationContent,
        _a);
    var screenContent = cancellationType ? contentMap[cancellationType] : surveyContent;
    return (<ScreenWrapper_1.default testID={RequestEarlyCancellationPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('subscription.requestEarlyCancellation.title')} onBackButtonPress={Navigation_1.default.goBack}/>
                <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.pt3]}>{screenContent}</ScrollView_1.default>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';
exports.default = RequestEarlyCancellationPage;
