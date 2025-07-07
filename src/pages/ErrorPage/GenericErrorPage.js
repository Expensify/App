"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_wordmark_svg_1 = require("@assets/images/expensify-wordmark.svg");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var SafeAreaConsumer_1 = require("@components/SafeAreaConsumer");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useIsAuthenticated_1 = require("@hooks/useIsAuthenticated");
var useLocalize_1 = require("@hooks/useLocalize");
var usePageRefresh_1 = require("@hooks/usePageRefresh");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ErrorBodyText_1 = require("./ErrorBodyText");
function GenericErrorPage(_a) {
    var _b;
    var error = _a.error;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isChunkLoadError = (error === null || error === void 0 ? void 0 : error.name) === CONST_1.default.CHUNK_LOAD_ERROR || /Loading chunk [\d]+ failed/.test((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : '');
    var refreshPage = (0, usePageRefresh_1.default)();
    return (<SafeAreaConsumer_1.default>
            {function (_a) {
            var paddingBottom = _a.paddingBottom;
            return (<react_native_1.View style={[styles.flex1, styles.pt10, styles.ph5, StyleUtils.getErrorPageContainerStyle(Number(paddingBottom))]}>
                    <react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <react_native_1.View>
                            <react_native_1.View style={styles.mb5}>
                                <Icon_1.default src={Expensicons.Bug} height={variables_1.default.componentSizeNormal} width={variables_1.default.componentSizeNormal} fill={theme.iconSuccessFill}/>
                            </react_native_1.View>
                            <react_native_1.View style={styles.mb5}>
                                <Text_1.default style={[styles.textHeadline]}>{translate('genericErrorPage.title')}</Text_1.default>
                            </react_native_1.View>
                            <react_native_1.View style={styles.mb5}>
                                <ErrorBodyText_1.default />
                                <Text_1.default>
                                    {"".concat(translate('genericErrorPage.body.helpTextConcierge'), " ")}
                                    <TextLink_1.default href={"mailto:".concat(CONST_1.default.EMAIL.CONCIERGE)} style={[styles.link]}>
                                        {CONST_1.default.EMAIL.CONCIERGE}
                                    </TextLink_1.default>
                                </Text_1.default>
                            </react_native_1.View>
                            <react_native_1.View style={[styles.flexRow]}>
                                <react_native_1.View style={[styles.flex1, styles.flexRow]}>
                                    <Button_1.default success text={translate('genericErrorPage.refresh')} style={styles.mr3} onPress={function () { return refreshPage(isChunkLoadError); }}/>
                                    {isAuthenticated && (<Button_1.default text={translate('initialSettingsPage.signOut')} onPress={function () {
                        (0, Session_1.signOutAndRedirectToSignIn)();
                        refreshPage();
                    }}/>)}
                                </react_native_1.View>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View>
                        <react_native_1.View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                            <ImageSVG_1.default contentFit="contain" src={expensify_wordmark_svg_1.default} height={30} width={80} fill={theme.text}/>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>);
        }}
        </SafeAreaConsumer_1.default>);
}
GenericErrorPage.displayName = 'ErrorPage';
exports.default = GenericErrorPage;
