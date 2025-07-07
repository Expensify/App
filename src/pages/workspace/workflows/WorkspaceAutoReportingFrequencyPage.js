"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoReportingFrequencyDisplayNames = void 0;
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var getAutoReportingFrequencyDisplayNames = function (translate) {
    var _a;
    return (_a = {},
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY] = translate('workflowsPage.frequencies.monthly'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE] = translate('workflowsPage.frequencies.daily'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY] = translate('workflowsPage.frequencies.weekly'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY] = translate('workflowsPage.frequencies.twiceAMonth'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP] = translate('workflowsPage.frequencies.byTrip'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL] = translate('workflowsPage.frequencies.manually'),
        _a);
};
exports.getAutoReportingFrequencyDisplayNames = getAutoReportingFrequencyDisplayNames;
function WorkspaceAutoReportingFrequencyPage(_a) {
    var _b;
    var policy = _a.policy, route = _a.route;
    var autoReportingFrequency = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy);
    var _c = (0, useLocalize_1.default)(), translate = _c.translate, toLocaleOrdinal = _c.toLocaleOrdinal;
    var styles = (0, useThemeStyles_1.default)();
    var onSelectAutoReportingFrequency = function (item) {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        (0, Policy_1.setWorkspaceAutoReportingFrequency)(policy.id, item.keyForList);
        if (item.keyForList === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY) {
            return;
        }
        Navigation_1.default.goBack();
    };
    var getDescriptionText = function () {
        if ((policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset) === undefined) {
            return toLocaleOrdinal(1);
        }
        if (typeof (policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset) === 'number') {
            return toLocaleOrdinal(policy.autoReportingOffset);
        }
        if (typeof (policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset) === 'string' && parseInt(policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset, 10)) {
            return toLocaleOrdinal(parseInt(policy.autoReportingOffset, 10));
        }
        return translate("workflowsPage.frequencies.".concat(policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset));
    };
    var monthlyFrequencyDetails = function () {
        var _a;
        return (<OfflineWithFeedback_1.default pendingAction={(_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.autoReportingOffset} errors={(0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)} onClose={function () { return (0, Policy_1.clearPolicyErrorField)(policy === null || policy === void 0 ? void 0 : policy.id, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET); }} errorRowStyles={[styles.ml7]}>
            <MenuItem_1.default title={translate('workflowsPage.submissionFrequencyDateOfMonth')} titleStyle={styles.textLabelSupportingNormal} description={getDescriptionText()} descriptionTextStyle={styles.textNormalThemeText} wrapperStyle={styles.pr3} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.getRoute(policy === null || policy === void 0 ? void 0 : policy.id)); }} shouldShowRightIcon/>
        </OfflineWithFeedback_1.default>);
    };
    var autoReportingFrequencyItems = Object.keys(getAutoReportingFrequencyDisplayNames(translate)).map(function (frequencyKey) { return ({
        text: getAutoReportingFrequencyDisplayNames(translate)[frequencyKey] || '',
        keyForList: frequencyKey,
        isSelected: frequencyKey === autoReportingFrequency,
        footerContent: frequencyKey === autoReportingFrequency && frequencyKey === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY ? monthlyFrequencyDetails() : null,
    }); });
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceAutoReportingFrequencyPage.displayName}>
                <FullPageNotFoundView_1.default onBackButtonPress={PolicyUtils_1.goBackFromInvalidPolicy} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy} shouldShow={(0, EmptyObject_1.isEmptyObject)(policy) || !(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPendingDeletePolicy)(policy) || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsPage.submissionFrequency')} onBackButtonPress={Navigation_1.default.goBack}/>
                    <OfflineWithFeedback_1.default pendingAction={(_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b.autoReportingFrequency} errors={(0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)} onClose={function () { return (0, Policy_1.clearPolicyErrorField)(policy === null || policy === void 0 ? void 0 : policy.id, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY); }} style={styles.flex1} contentContainerStyle={styles.flex1}>
                        <SelectionList_1.default ListItem={RadioListItem_1.default} sections={[{ data: autoReportingFrequencyItems }]} onSelectRow={onSelectAutoReportingFrequency} initiallyFocusedOptionKey={autoReportingFrequency} shouldUpdateFocusedIndex addBottomSafeAreaPadding/>
                    </OfflineWithFeedback_1.default>
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceAutoReportingFrequencyPage.displayName = 'WorkspaceAutoReportingFrequencyPage';
exports.default = (0, withPolicy_1.default)(WorkspaceAutoReportingFrequencyPage);
