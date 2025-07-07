"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseOnboardingEmployees(_a) {
    var _b;
    var shouldUseNativeStyles = _a.shouldUseNativeStyles, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingCompanySize = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_COMPANY_SIZE, { canBeMissing: true })[0];
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var _c = (0, react_1.useState)(onboardingCompanySize), selectedCompanySize = _c[0], setSelectedCompanySize = _c[1];
    var _d = (0, react_1.useState)(''), error = _d[0], setError = _d[1];
    var onboardingValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var companySizeOptions = (0, react_1.useMemo)(function () {
        var isSmb = (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
        return Object.values(CONST_1.default.ONBOARDING_COMPANY_SIZE)
            .filter(function (size) { return !isSmb || size !== CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO; })
            .map(function (companySize) {
            return {
                text: translate("onboarding.employees.".concat(companySize)),
                keyForList: companySize,
                isSelected: companySize === selectedCompanySize,
            };
        });
    }, [translate, selectedCompanySize, onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.signupQualifier]);
    var footerContent = (<>
            {!!error && (<FormHelpMessage_1.default style={[styles.ph1, styles.mb2]} isError message={error}/>)}
            <Button_1.default success large text={translate('common.continue')} onPress={function () {
            var _a;
            if (!selectedCompanySize) {
                setError(translate('onboarding.errorSelection'));
                return;
            }
            (0, Welcome_1.setOnboardingCompanySize)(selectedCompanySize);
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_ACCOUNTING.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo));
        }} pressOnEnter/>
        </>);
    return (<ScreenWrapper_1.default testID="BaseOnboardingEmployees" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default shouldShowBackButton progressBarPercentage={onboardingPurposeSelected === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM ? 80 : 90} onBackButtonPress={Navigation_1.default.goBack}/>
            <Text_1.default style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                {translate('onboarding.employees.title')}
            </Text_1.default>
            <SelectionList_1.default sections={[{ data: companySizeOptions }]} onSelectRow={function (item) {
            setSelectedCompanySize(item.keyForList);
            setError('');
        }} initiallyFocusedOptionKey={(_b = companySizeOptions.find(function (item) { return item.keyForList === selectedCompanySize; })) === null || _b === void 0 ? void 0 : _b.keyForList} shouldUpdateFocusedIndex ListItem={RadioListItem_1.default} footerContent={footerContent} listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []} includeSafeAreaPaddingBottom={false}/>
        </ScreenWrapper_1.default>);
}
BaseOnboardingEmployees.displayName = 'BaseOnboardingEmployees';
exports.default = BaseOnboardingEmployees;
