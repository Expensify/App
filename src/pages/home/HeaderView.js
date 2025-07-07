"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CaretWrapper_1 = require("@components/CaretWrapper");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DisplayNames_1 = require("@components/DisplayNames");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var LoadingBar_1 = require("@components/LoadingBar");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var OnboardingHelpDropdownButton_1 = require("@components/OnboardingHelpDropdownButton");
var ParentNavigationSubtitle_1 = require("@components/ParentNavigationSubtitle");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ReportHeaderSkeletonView_1 = require("@components/ReportHeaderSkeletonView");
var SearchButton_1 = require("@components/Search/SearchRouter/SearchButton");
var HelpButton_1 = require("@components/SidePanel/HelpComponents/HelpButton");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var TaskHeaderActionButton_1 = require("@components/TaskHeaderActionButton");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLoadingBarVisibility_1 = require("@hooks/useLoadingBarVisibility");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var EarlyDiscountBanner_1 = require("@pages/settings/Subscription/CardSection/BillingBanner/EarlyDiscountBanner");
var FreeTrial_1 = require("@pages/settings/Subscription/FreeTrial");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var fallbackIcon = {
    source: Expensicons_1.FallbackAvatar,
    type: CONST_1.default.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};
function HeaderView(_a) {
    var _b, _c, _d, _e, _f, _g;
    var report = _a.report, parentReportAction = _a.parentReportAction, onNavigationMenuButtonClicked = _a.onNavigationMenuButtonClicked, _h = _a.shouldUseNarrowLayout, shouldUseNarrowLayout = _h === void 0 ? false : _h;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var route = (0, native_1.useRoute)();
    var _j = react_1.default.useState(false), isDeleteTaskConfirmModalVisible = _j[0], setIsDeleteTaskConfirmModalVisible = _j[1];
    var invoiceReceiverPolicyID = (report === null || report === void 0 ? void 0 : report.invoiceReceiver) && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
    var invoiceReceiverPolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(invoiceReceiverPolicyID), { canBeMissing: true })[0];
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_b = (0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID)) !== null && _b !== void 0 ? _b : (0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.reportID)), { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var shouldShowLoadingBar = (0, useLoadingBarVisibility_1.default)();
    var firstDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var lastDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isSelfDM = (0, ReportUtils_1.isSelfDM)(report);
    var isGroupChat = (0, ReportUtils_1.isGroupChat)(report) || (0, ReportUtils_1.isDeprecatedGroupDM)(report);
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: true })[0];
    var allParticipants = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, false, true, undefined, reportMetadata);
    var shouldAddEllipsis = (allParticipants === null || allParticipants === void 0 ? void 0 : allParticipants.length) > CONST_1.default.DISPLAY_PARTICIPANTS_LIMIT;
    var participants = allParticipants.slice(0, CONST_1.default.DISPLAY_PARTICIPANTS_LIMIT);
    var isMultipleParticipant = participants.length > 1;
    var participantPersonalDetails = (0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)(participants, personalDetails);
    var displayNamesWithTooltips = (0, ReportUtils_1.getDisplayNamesWithTooltips)(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);
    var isChatThread = (0, ReportUtils_1.isChatThread)(report);
    var isChatRoom = (0, ReportUtils_1.isChatRoom)(report);
    var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(report);
    var isTaskReport = (0, ReportUtils_1.isTaskReport)(report);
    var parentOfParentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportID), { canBeMissing: true })[0];
    var reportHeaderData = ((!isTaskReport && !isChatThread) || (parentOfParentReport && ((0, ReportUtils_1.isIOUReport)(parentOfParentReport) || (0, ReportUtils_1.isExpenseReport)(parentOfParentReport)))) && (report === null || report === void 0 ? void 0 : report.parentReportID)
        ? parentReport
        : report;
    // Use sorted display names for the title for group chats on native small screen widths
    var title = (0, ReportUtils_1.getReportName)(reportHeaderData, policy, parentReportAction, personalDetails, invoiceReceiverPolicy);
    var subtitle = (0, ReportUtils_1.getChatRoomSubtitle)(reportHeaderData);
    var parentNavigationSubtitleData = (0, ReportUtils_1.getParentNavigationSubtitle)(reportHeaderData);
    var reportDescription = Parser_1.default.htmlToText((0, ReportUtils_1.getReportDescription)(report));
    var policyName = (0, ReportUtils_1.getPolicyName)({ report: report, returnEmptyIfNotFound: true });
    var policyDescription = (0, ReportUtils_1.getPolicyDescriptionText)(policy);
    var isPersonalExpenseChat = isPolicyExpenseChat && (0, ReportUtils_1.isCurrentUserSubmitter)(report === null || report === void 0 ? void 0 : report.reportID);
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var shouldShowSubtitle = function () {
        if (!subtitle) {
            return false;
        }
        if (isChatRoom) {
            return !reportDescription;
        }
        if (isPolicyExpenseChat) {
            return !policyDescription;
        }
        return true;
    };
    var shouldShowGuideBooking = !!account &&
        ((_c = account === null || account === void 0 ? void 0 : account.guideDetails) === null || _c === void 0 ? void 0 : _c.email) !== CONST_1.default.EMAIL.CONCIERGE &&
        !!((_d = account === null || account === void 0 ? void 0 : account.guideDetails) === null || _d === void 0 ? void 0 : _d.calendarLink) &&
        (0, ReportUtils_1.isAdminRoom)(report) &&
        !!(0, ReportUtils_1.canUserPerformWriteAction)(report) &&
        !isChatThread &&
        (introSelected === null || introSelected === void 0 ? void 0 : introSelected.companySize) !== CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO;
    var join = (0, Session_1.callFunctionIfActionIsAllowed)(function () { return (0, Report_1.joinRoom)(report); });
    var canJoin = (0, ReportUtils_1.canJoinChat)(report, parentReportAction, policy, reportNameValuePairs);
    var joinButton = (<Button_1.default success text={translate('common.join')} onPress={join}/>);
    var renderAdditionalText = function () {
        if (shouldShowSubtitle() || isPersonalExpenseChat || !policyName || !(0, EmptyObject_1.isEmptyObject)(parentNavigationSubtitleData) || isSelfDM) {
            return null;
        }
        return (<>
                <Text_1.default style={[styles.sidebarLinkText, styles.textLabelSupporting]}> {translate('threads.in')} </Text_1.default>
                <Text_1.default style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.textStrong]}>{policyName}</Text_1.default>
            </>);
    };
    // If the onboarding report is directly loaded, shouldShowDiscountBanner can return wrong value as it is not
    // linked to the react lifecycle directly. Wait for trial dates to load, before calculating.
    var shouldShowDiscount = (0, react_1.useMemo)(function () { return (0, SubscriptionUtils_1.shouldShowDiscountBanner)(hasTeam2025Pricing, subscriptionPlan) && !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs); }, 
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstDayFreeTrial, lastDayFreeTrial, hasTeam2025Pricing, reportNameValuePairs, subscriptionPlan]);
    var isArchived = (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs);
    var shouldShowSubscript = (0, ReportUtils_1.shouldReportShowSubscript)(report, isArchived);
    var defaultSubscriptSize = (0, ReportUtils_1.isExpenseRequest)(report) ? CONST_1.default.AVATAR_SIZE.SMALL_NORMAL : CONST_1.default.AVATAR_SIZE.DEFAULT;
    var icons = (0, ReportUtils_1.getIcons)(reportHeaderData, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    var brickRoadIndicator = (0, ReportUtils_1.hasReportNameError)(report) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    var shouldDisableDetailPage = (0, ReportUtils_1.shouldDisableDetailPage)(report);
    var shouldUseGroupTitle = isGroupChat && (!!(report === null || report === void 0 ? void 0 : report.reportName) || !isMultipleParticipant);
    var isLoading = !(report === null || report === void 0 ? void 0 : report.reportID) || !title;
    var isParentReportLoading = !!(report === null || report === void 0 ? void 0 : report.parentReportID) && !parentReport;
    var isReportInRHP = route.name === SCREENS_1.default.SEARCH.REPORT_RHP;
    var shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var isChatUsedForOnboarding = (0, ReportUtils_1.isChatUsedForOnboarding)(report, onboardingPurposeSelected);
    var shouldShowRegisterForWebinar = (introSelected === null || introSelected === void 0 ? void 0 : introSelected.companySize) === CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO && (isChatUsedForOnboarding || (0, ReportUtils_1.isAdminRoom)(report));
    var shouldShowOnBoardingHelpDropdownButton = (shouldShowRegisterForWebinar || shouldShowGuideBooking) && !isArchived;
    var shouldShowEarlyDiscountBanner = shouldShowDiscount && isChatUsedForOnboarding;
    var latestScheduledCall = (_e = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.calendlyCalls) === null || _e === void 0 ? void 0 : _e.at(-1);
    var hasActiveScheduledCall = latestScheduledCall && !(0, date_fns_1.isPast)(latestScheduledCall.eventTime) && latestScheduledCall.status !== CONST_1.default.SCHEDULE_CALL_STATUS.CANCELLED;
    var onboardingHelpDropdownButton = (<OnboardingHelpDropdownButton_1.default reportID={report === null || report === void 0 ? void 0 : report.reportID} shouldUseNarrowLayout={shouldUseNarrowLayout} shouldShowRegisterForWebinar={shouldShowRegisterForWebinar} shouldShowGuideBooking={shouldShowGuideBooking} hasActiveScheduledCall={hasActiveScheduledCall}/>);
    return (<>
            <react_native_1.View style={[styles.borderBottom]} dataSet={{ dragArea: true }}>
                <react_native_1.View style={[styles.appContentHeader, styles.pr3]}>
                    {isLoading ? (<ReportHeaderSkeletonView_1.default onBackButtonPress={onNavigationMenuButtonClicked}/>) : (<react_native_1.View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && !isLoading && styles.pl5]}>
                            {shouldUseNarrowLayout && (<PressableWithoutFeedback_1.default onPress={onNavigationMenuButtonClicked} style={styles.LHNToggle} accessibilityHint={translate('accessibilityHints.navigateToChatsList')} accessibilityLabel={translate('common.back')} role={CONST_1.default.ROLE.BUTTON}>
                                    <Tooltip_1.default text={translate('common.back')} shiftVertical={4}>
                                        <react_native_1.View>
                                            <Icon_1.default src={Expensicons_1.BackArrow} fill={theme.icon}/>
                                        </react_native_1.View>
                                    </Tooltip_1.default>
                                </PressableWithoutFeedback_1.default>)}
                            <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <PressableWithoutFeedback_1.default onPress={function () { return (0, ReportUtils_1.navigateToDetailsPage)(report, Navigation_1.default.getReportRHPActiveRoute(), true); }} style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]} disabled={shouldDisableDetailPage} accessibilityLabel={title} role={CONST_1.default.ROLE.BUTTON}>
                                    {shouldShowSubscript ? (<SubscriptAvatar_1.default mainAvatar={(_f = icons.at(0)) !== null && _f !== void 0 ? _f : fallbackIcon} secondaryAvatar={icons.at(1)} size={defaultSubscriptSize}/>) : (<OfflineWithFeedback_1.default pendingAction={(_g = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _g === void 0 ? void 0 : _g.avatar}>
                                            <MultipleAvatars_1.default icons={icons}/>
                                        </OfflineWithFeedback_1.default>)}
                                    <react_native_1.View fsClass="fs-unmask" style={[styles.flex1, styles.flexColumn]}>
                                        <CaretWrapper_1.default>
                                            <DisplayNames_1.default fullTitle={title} displayNamesWithTooltips={displayNamesWithTooltips} tooltipEnabled numberOfLines={1} textStyles={[styles.headerText, styles.pre]} shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport || shouldUseGroupTitle || isArchived} renderAdditionalText={renderAdditionalText} shouldAddEllipsis={shouldAddEllipsis}/>
                                        </CaretWrapper_1.default>
                                        {!(0, EmptyObject_1.isEmptyObject)(parentNavigationSubtitleData) && (<ParentNavigationSubtitle_1.default parentNavigationSubtitleData={parentNavigationSubtitleData} parentReportID={reportHeaderData === null || reportHeaderData === void 0 ? void 0 : reportHeaderData.parentReportID} parentReportActionID={reportHeaderData === null || reportHeaderData === void 0 ? void 0 : reportHeaderData.parentReportActionID} pressableStyles={[styles.alignSelfStart, styles.mw100]}/>)}
                                        {shouldShowSubtitle() && (<Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]} numberOfLines={1}>
                                                {subtitle}
                                            </Text_1.default>)}
                                        {isChatRoom && !!reportDescription && (0, EmptyObject_1.isEmptyObject)(parentNavigationSubtitleData) && (<react_native_1.View style={[styles.alignSelfStart, styles.mw100]}>
                                                <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]} numberOfLines={1}>
                                                    {reportDescription}
                                                </Text_1.default>
                                            </react_native_1.View>)}
                                        {isPolicyExpenseChat && !!policyDescription && (0, EmptyObject_1.isEmptyObject)(parentNavigationSubtitleData) && (<react_native_1.View style={[styles.alignSelfStart, styles.mw100]}>
                                                <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]} numberOfLines={1}>
                                                    {policyDescription}
                                                </Text_1.default>
                                            </react_native_1.View>)}
                                    </react_native_1.View>
                                    {brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                            <Icon_1.default src={Expensicons_1.DotIndicator} fill={theme.danger}/>
                                        </react_native_1.View>)}
                                </PressableWithoutFeedback_1.default>
                                <react_native_1.View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                    {shouldShowOnBoardingHelpDropdownButton && !shouldUseNarrowLayout && onboardingHelpDropdownButton}
                                    {!shouldUseNarrowLayout && !shouldShowDiscount && isChatUsedForOnboarding && (<FreeTrial_1.default pressable success={!hasActiveScheduledCall}/>)}
                                    {!shouldUseNarrowLayout && (0, ReportUtils_1.isOpenTaskReport)(report, parentReportAction) && <TaskHeaderActionButton_1.default report={report}/>}
                                    {!isParentReportLoading && canJoin && !shouldUseNarrowLayout && joinButton}
                                </react_native_1.View>
                                <HelpButton_1.default style={styles.ml2}/>
                                {shouldDisplaySearchRouter && <SearchButton_1.default />}
                            </react_native_1.View>
                            <ConfirmModal_1.default isVisible={isDeleteTaskConfirmModalVisible} onConfirm={function () {
                setIsDeleteTaskConfirmModalVisible(false);
                (0, Task_1.deleteTask)(report);
            }} onCancel={function () { return setIsDeleteTaskConfirmModalVisible(false); }} title={translate('task.deleteTask')} prompt={translate('task.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
                        </react_native_1.View>)}
                </react_native_1.View>
                {!isParentReportLoading && !isLoading && canJoin && shouldUseNarrowLayout && <react_native_1.View style={[styles.ph5, styles.pb2]}>{joinButton}</react_native_1.View>}
                <react_native_1.View style={shouldShowOnBoardingHelpDropdownButton && [styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.ph5]}>
                    {!shouldShowEarlyDiscountBanner && shouldShowOnBoardingHelpDropdownButton && shouldUseNarrowLayout && (<react_native_1.View style={[styles.flex1, styles.pb3]}>{onboardingHelpDropdownButton}</react_native_1.View>)}
                    {!isLoading && !shouldShowDiscount && isChatUsedForOnboarding && shouldUseNarrowLayout && (<FreeTrial_1.default pressable addSpacing success={!hasActiveScheduledCall} inARow={shouldShowOnBoardingHelpDropdownButton}/>)}
                </react_native_1.View>
                {!!report && shouldUseNarrowLayout && (0, ReportUtils_1.isOpenTaskReport)(report, parentReportAction) && (<react_native_1.View style={[styles.appBG, styles.pl0]}>
                        <react_native_1.View style={[styles.ph5, styles.pb3]}>
                            <TaskHeaderActionButton_1.default report={report}/>
                        </react_native_1.View>
                    </react_native_1.View>)}
                <LoadingBar_1.default shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout}/>
            </react_native_1.View>
            {shouldShowEarlyDiscountBanner && (<EarlyDiscountBanner_1.default onboardingHelpDropdownButton={shouldUseNarrowLayout && shouldShowOnBoardingHelpDropdownButton ? onboardingHelpDropdownButton : undefined} isSubscriptionPage={false} hasActiveScheduledCall={hasActiveScheduledCall}/>)}
        </>);
}
HeaderView.displayName = 'HeaderView';
exports.default = (0, react_1.memo)(HeaderView);
