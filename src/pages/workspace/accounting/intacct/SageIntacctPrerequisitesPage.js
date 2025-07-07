"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var computer_svg_1 = require("@assets/images/computer.svg");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var MenuItemList_1 = require("@components/MenuItemList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var fileDownload_1 = require("@libs/fileDownload");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctPrerequisitesPage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var popoverAnchor = (0, react_1.useRef)(null);
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var menuItems = (0, react_1.useMemo)(function () { return [
        {
            title: translate('workspace.intacct.downloadExpensifyPackage'),
            key: 'workspace.intacct.downloadExpensifyPackage',
            icon: Expensicons.Download,
            iconRight: Expensicons.NewWindow,
            shouldShowRightIcon: true,
            onPress: function () {
                (0, fileDownload_1.default)(CONST_1.default.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT, CONST_1.default.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT_FILE_NAME, '', true);
            },
            onSecondaryInteraction: function (event) {
                return (0, ReportActionContextMenu_1.showContextMenu)({
                    type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                    event: event,
                    selection: CONST_1.default.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT,
                    contextMenuAnchor: popoverAnchor.current,
                });
            },
            numberOfLinesTitle: 2,
        },
        {
            title: translate('workspace.intacct.followSteps'),
            key: 'workspace.intacct.followSteps',
            icon: Expensicons.Task,
            iconRight: Expensicons.NewWindow,
            shouldShowRightIcon: true,
            onPress: function () {
                (0, Link_1.openExternalLink)(CONST_1.default.HOW_TO_CONNECT_TO_SAGE_INTACCT);
            },
            onSecondaryInteraction: function (event) {
                return (0, ReportActionContextMenu_1.showContextMenu)({
                    type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                    event: event,
                    selection: CONST_1.default.HOW_TO_CONNECT_TO_SAGE_INTACCT,
                    contextMenuAnchor: popoverAnchor.current,
                });
            },
            numberOfLinesTitle: 3,
        },
    ]; }, [translate]);
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={SageIntacctPrerequisitesPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.intacct.sageIntacctSetup')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <react_native_1.View style={styles.flex1}>
                <react_native_1.View style={[styles.alignSelfCenter, styles.computerIllustrationContainer]}>
                    <ImageSVG_1.default src={computer_svg_1.default}/>
                </react_native_1.View>

                <Text_1.default style={[styles.textHeadlineH1, styles.p5, styles.p6]}>{translate('workspace.intacct.prerequisitesTitle')}</Text_1.default>
                <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>

                <FixedFooter_1.default style={[styles.mtAuto]} addBottomSafeAreaPadding>
                    <Button_1.default success text={translate('common.next')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID)); }} pressOnEnter large/>
                </FixedFooter_1.default>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SageIntacctPrerequisitesPage.displayName = 'SageIntacctPrerequisitesPage';
exports.default = SageIntacctPrerequisitesPage;
