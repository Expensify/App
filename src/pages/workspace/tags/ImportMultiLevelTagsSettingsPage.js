"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useCloseImportPage_1 = require("@hooks/useCloseImportPage");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Tag_1 = require("@libs/actions/Policy/Tag");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ImportMultiLevelTagsSettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var backTo = route.params.backTo;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _k = (0, react_1.useState)(false), isImportingTags = _k[0], setIsImportingTags = _k[1];
    var setIsClosing = (0, useCloseImportPage_1.default)().setIsClosing;
    var _l = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _l[0], spreadsheetMetadata = _l[1];
    (0, react_1.useEffect)(function () {
        (0, Tag_1.setImportedSpreadsheetIsFirstLineHeader)(true);
        (0, Tag_1.setImportedSpreadsheetIsImportingIndependentMultiLevelTags)(true);
        (0, Tag_1.setImportedSpreadsheetIsGLAdjacent)(false);
    }, []);
    if (hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    var closeImportPageAndModal = function () {
        setIsClosing(true);
        setIsImportingTags(false);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAGS.getRoute(policyID));
    };
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={ImportSpreadsheet_1.default.displayName} shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.tags.importTags')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <FullPageOfflineBlockingView_1.default>
                    <Text_1.default style={[styles.textSupporting, styles.textNormal, styles.ph5]}>{translate('workspace.tags.configureMultiLevelTags')}</Text_1.default>

                    <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text_1.default style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.firstRowTitle')}</Text_1.default>
                        <Switch_1.default isOn={(_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.containsHeader) !== null && _b !== void 0 ? _b : true} accessibilityLabel={translate('workspace.tags.importMultiLevelTags.firstRowTitle')} onToggle={function (value) {
            (0, Tag_1.setImportedSpreadsheetIsFirstLineHeader)(value);
        }}/>
                    </react_native_1.View>

                    <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text_1.default style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.independentTags')}</Text_1.default>
                        <Switch_1.default isOn={(_c = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isImportingIndependentMultiLevelTags) !== null && _c !== void 0 ? _c : true} accessibilityLabel={translate('workspace.tags.importMultiLevelTags.independentTags')} onToggle={function (value) {
            (0, Tag_1.setImportedSpreadsheetIsImportingIndependentMultiLevelTags)(value);
        }}/>
                    </react_native_1.View>

                    <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text_1.default style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.glAdjacentColumn')}</Text_1.default>
                        <Switch_1.default isOn={(_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isGLAdjacent) !== null && _d !== void 0 ? _d : false} accessibilityLabel={translate('workspace.tags.importMultiLevelTags.glAdjacentColumn')} onToggle={function (value) {
            (0, Tag_1.setImportedSpreadsheetIsGLAdjacent)(value);
        }}/>
                    </react_native_1.View>

                    <FixedFooter_1.default style={[styles.mtAuto]} addBottomSafeAreaPadding>
                        <Button_1.default text={(spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isImportingIndependentMultiLevelTags) ? translate('common.next') : translate('common.import')} onPress={function () {
            if (spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isImportingIndependentMultiLevelTags) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL.getRoute(policyID));
            }
            else {
                setIsImportingTags(true);
                (0, Tag_1.importMultiLevelTags)(policyID, spreadsheet);
            }
        }} isLoading={isImportingTags} success large/>
                    </FixedFooter_1.default>
                    <ConfirmModal_1.default isVisible={(_e = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.shouldFinalModalBeOpened) !== null && _e !== void 0 ? _e : false} title={(_g = (_f = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _f === void 0 ? void 0 : _f.title) !== null && _g !== void 0 ? _g : ''} prompt={(_j = (_h = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _h === void 0 ? void 0 : _h.prompt) !== null && _j !== void 0 ? _j : ''} onConfirm={closeImportPageAndModal} onCancel={closeImportPageAndModal} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} shouldHandleNavigationBack/>
                </FullPageOfflineBlockingView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ImportMultiLevelTagsSettingsPage.displayName = 'ImportMultiLevelTagsSettingsPage';
exports.default = ImportMultiLevelTagsSettingsPage;
