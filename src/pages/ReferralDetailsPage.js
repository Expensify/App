"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ContextMenuItem_1 = require("@components/ContextMenuItem");
var HeaderPageLayout_1 = require("@components/HeaderPageLayout");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Clipboard_1 = require("@libs/Clipboard");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var ReportActionContextMenu_1 = require("./home/report/ContextMenu/ReportActionContextMenu");
function ReferralDetailsPage(_a) {
    var route = _a.route;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var popoverAnchor = (0, react_1.useRef)(null);
    var _b = (0, useSingleExecution_1.default)(), isExecuting = _b.isExecuting, singleExecution = _b.singleExecution;
    var contentType = route.params.contentType;
    var backTo = route.params.backTo;
    if (!Object.values(CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES).includes(contentType)) {
        contentType = CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
    }
    var contentHeader = translate("referralProgram.".concat(contentType, ".header"));
    var contentBody = translate("referralProgram.".concat(contentType, ".body"));
    var isShareCode = contentType === CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE;
    var shouldShowClipboard = contentType === CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND || isShareCode;
    var referralLink = "".concat(CONST_1.default.REFERRAL_PROGRAM.LINK).concat((account === null || account === void 0 ? void 0 : account.primaryLogin) ? "/?thanks=".concat(account.primaryLogin) : '');
    return (<HeaderPageLayout_1.default title={translate('common.referral')} headerContent={<Icon_1.default src={Illustrations_1.PaymentHands} width={589} height={232}/>} headerContainerStyles={[styles.staticHeaderImage, styles.justifyContentEnd]} backgroundColor={theme.PAGE_THEMES[SCREENS_1.default.REFERRAL_DETAILS].backgroundColor} testID={ReferralDetailsPage.displayName} onBackButtonPress={function () {
            if (backTo) {
                Navigation_1.default.goBack(backTo);
                return;
            }
            Navigation_1.default.goBack();
        }}>
            <Text_1.default style={[styles.textHeadline, styles.mb2, styles.ph5]}>{contentHeader}</Text_1.default>
            <Text_1.default style={[styles.webViewStyles.baseFontStyle, styles.ml0, styles.mb5, styles.ph5]}>{contentBody}</Text_1.default>

            {shouldShowClipboard && (<ContextMenuItem_1.default isAnonymousAction text={translate('referralProgram.copyReferralLink')} icon={Expensicons.Copy} successIcon={Expensicons.Checkmark} successText={translate('qrCodes.copied')} onPress={function () { return Clipboard_1.default.setString(referralLink); }}/>)}

            <MenuItem_1.default wrapperStyle={styles.mb4} ref={popoverAnchor} title={translate('requestorStep.learnMore')} icon={Expensicons.QuestionMark} shouldShowRightIcon iconRight={Expensicons.NewWindow} disabled={isExecuting} shouldBlockSelection onPress={singleExecution(function () { return (0, Link_1.openExternalLink)(CONST_1.default.REFERRAL_PROGRAM.LEARN_MORE_LINK); })} onSecondaryInteraction={function (e) {
            return (0, ReportActionContextMenu_1.showContextMenu)({
                type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                event: e,
                selection: CONST_1.default.REFERRAL_PROGRAM.LEARN_MORE_LINK,
                contextMenuAnchor: popoverAnchor.current,
            });
        }}/>
        </HeaderPageLayout_1.default>);
}
ReferralDetailsPage.displayName = 'ReferralDetailsPage';
exports.default = ReferralDetailsPage;
