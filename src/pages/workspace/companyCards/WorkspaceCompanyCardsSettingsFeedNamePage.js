"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceTaxCustomName_1 = require("@src/types/form/WorkspaceTaxCustomName");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function WorkspaceCompanyCardsSettingsFeedNamePage(_a) {
    var _b, _c;
    var policyID = _a.route.params.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var _d = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true }), lastSelectedFeed = _d[0], lastSelectedFeedResult = _d[1];
    var _e = (0, useCardFeeds_1.default)(policyID), cardFeeds = _e[0], cardFeedsResult = _e[1];
    var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeeds);
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var feedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(selectedFeed, (_c = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _c === void 0 ? void 0 : _c.companyCardNicknames);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, selectedFeed ? companyFeeds[selectedFeed] : undefined);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var value = values[WorkspaceTaxCustomName_1.default.NAME];
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(value)) {
            errors.name = translate('workspace.moreFeatures.companyCards.error.feedNameRequired');
        }
        else if (value.length > CONST_1.default.DISPLAY_NAME.MAX_LENGTH) {
            errors.name = translate('common.error.characterLimitExceedCounter', {
                length: value.length,
                limit: CONST_1.default.DISPLAY_NAME.MAX_LENGTH,
            });
        }
        return errors;
    }, [translate]);
    var submit = function (_a) {
        var name = _a.name;
        if (selectedFeed) {
            (0, CompanyCards_1.setWorkspaceCompanyCardFeedName)(policyID, domainOrWorkspaceAccountID, selectedFeed, name);
        }
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
    };
    if ((0, isLoadingOnyxValue_1.default)(cardFeedsResult) || (0, isLoadingOnyxValue_1.default)(lastSelectedFeedResult)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceCompanyCardsSettingsFeedNamePage.displayName} style={styles.defaultModalContainer}>
                <HeaderWithBackButton_1.default title={translate('workspace.moreFeatures.companyCards.cardFeedName')}/>
                <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.moreFeatures.companyCards.setFeedNameDescription')}</Text_1.default>
                </Text_1.default>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} scrollContextEnabled enabledWhenOffline validate={validate} onSubmit={submit} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceTaxCustomName_1.default.NAME} label={translate('workspace.editor.nameInputLabel')} accessibilityLabel={translate('workspace.editor.nameInputLabel')} defaultValue={feedName} multiline={false} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardsSettingsFeedNamePage.displayName = 'WorkspaceCompanyCardsSettingsFeedNamePage';
exports.default = WorkspaceCompanyCardsSettingsFeedNamePage;
