"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var blurActiveElement_1 = require("@libs/Accessibility/blurActiveElement");
var Task_1 = require("@libs/actions/Task");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function NewTaskPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var task = (0, useOnyx_1.default)(ONYXKEYS_1.default.TASK, { canBeMissing: true })[0];
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var assignee = (0, react_1.useMemo)(function () { var _a; return (0, Task_1.getAssignee)((_a = task === null || task === void 0 ? void 0 : task.assigneeAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID, personalDetails); }, [task === null || task === void 0 ? void 0 : task.assigneeAccountID, personalDetails]);
    var assigneeTooltipDetails = (0, ReportUtils_1.getDisplayNamesWithTooltips)((0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)((task === null || task === void 0 ? void 0 : task.assigneeAccountID) ? [task.assigneeAccountID] : [], personalDetails), false);
    var shareDestination = (0, react_1.useMemo)(function () { return ((task === null || task === void 0 ? void 0 : task.shareDestination) ? (0, Task_1.getShareDestination)(task.shareDestination, reports, personalDetails) : undefined); }, [task === null || task === void 0 ? void 0 : task.shareDestination, reports, personalDetails]);
    var parentReport = (0, react_1.useMemo)(function () { return ((task === null || task === void 0 ? void 0 : task.shareDestination) ? reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(task.shareDestination)] : undefined); }, [reports, task === null || task === void 0 ? void 0 : task.shareDestination]);
    var _e = (0, react_1.useState)(''), errorMessage = _e[0], setErrorMessage = _e[1];
    var hasDestinationError = (task === null || task === void 0 ? void 0 : task.skipConfirmation) && !(task === null || task === void 0 ? void 0 : task.parentReportID);
    var isAllowedToCreateTask = (0, react_1.useMemo)(function () { return (0, EmptyObject_1.isEmptyObject)(parentReport) || (0, ReportUtils_1.isAllowedToComment)(parentReport); }, [parentReport]);
    var paddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var backTo = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var confirmButtonRef = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                (0, blurActiveElement_1.default)();
            });
        }, CONST_1.default.ANIMATED_TRANSITION);
        return function () { return focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current); };
    }, []));
    (0, react_1.useEffect)(function () {
        setErrorMessage('');
        // We only set the parentReportID if we are creating a task from a report
        // this allows us to go ahead and set that report as the share destination
        // and disable the share destination selector
        if (task === null || task === void 0 ? void 0 : task.parentReportID) {
            (0, Task_1.setShareDestinationValue)(task.parentReportID);
        }
    }, [task === null || task === void 0 ? void 0 : task.assignee, task === null || task === void 0 ? void 0 : task.assigneeAccountID, task === null || task === void 0 ? void 0 : task.description, task === null || task === void 0 ? void 0 : task.parentReportID, task === null || task === void 0 ? void 0 : task.shareDestination, task === null || task === void 0 ? void 0 : task.title]);
    // On submit, we want to call the createTask function and wait to validate
    // the response
    var onSubmit = function () {
        var _a, _b;
        if (!(task === null || task === void 0 ? void 0 : task.title) && !(task === null || task === void 0 ? void 0 : task.shareDestination)) {
            setErrorMessage(translate('newTaskPage.confirmError'));
            return;
        }
        if (!task.title) {
            setErrorMessage(translate('newTaskPage.pleaseEnterTaskName'));
            return;
        }
        if (!task.shareDestination) {
            setErrorMessage(translate('newTaskPage.pleaseEnterTaskDestination'));
            return;
        }
        (0, Task_1.createTaskAndNavigate)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID, task.title, (_a = task === null || task === void 0 ? void 0 : task.description) !== null && _a !== void 0 ? _a : '', (_b = task === null || task === void 0 ? void 0 : task.assignee) !== null && _b !== void 0 ? _b : '', task.assigneeAccountID, task.assigneeChatReport, parentReport === null || parentReport === void 0 ? void 0 : parentReport.policyID);
    };
    return (<ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={NewTaskPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!isAllowedToCreateTask} onBackButtonPress={function () { return (0, Task_1.dismissModalAndClearOutTaskInfo)(); }} shouldShowLink={false}>
                <HeaderWithBackButton_1.default title={translate('newTaskPage.confirmTask')} shouldShowBackButton onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.NEW_TASK_DETAILS.getRoute(backTo));
        }}/>
                {!!hasDestinationError && (<FormHelpMessage_1.default style={[styles.ph4, styles.mb4]} isError={false} shouldShowRedDotIndicator={false} message={translate('quickAction.noLongerHaveReportAccess')}/>)}
                <ScrollView_1.default contentContainerStyle={styles.flexGrow1} 
    // on iOS, navigation animation sometimes cause the scrollbar to appear
    // on middle/left side of ScrollView. scrollIndicatorInsets with right
    // to closest value to 0 fixes this issue, 0 (default) doesn't work
    // See: https://github.com/Expensify/App/issues/31441
    scrollIndicatorInsets={{ right: Number.MIN_VALUE }}>
                    <react_native_1.View style={styles.flex1}>
                        <react_native_1.View style={styles.mb5}>
                            <MenuItemWithTopDescription_1.default description={translate('task.title')} title={task === null || task === void 0 ? void 0 : task.title} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK_TITLE.getRoute(backTo)); }} shouldShowRightIcon rightLabel={translate('common.required')} shouldParseTitle excludedMarkdownRules={__spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true)}/>
                            <MenuItemWithTopDescription_1.default description={translate('task.description')} title={task === null || task === void 0 ? void 0 : task.description} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK_DESCRIPTION.getRoute(backTo)); }} shouldShowRightIcon shouldParseTitle numberOfLinesTitle={2} titleStyle={styles.flex1}/>
                            <MenuItem_1.default label={(assignee === null || assignee === void 0 ? void 0 : assignee.displayName) ? translate('task.assignee') : ''} title={(_c = assignee === null || assignee === void 0 ? void 0 : assignee.displayName) !== null && _c !== void 0 ? _c : ''} description={(assignee === null || assignee === void 0 ? void 0 : assignee.displayName) ? (0, LocalePhoneNumber_1.formatPhoneNumber)(assignee === null || assignee === void 0 ? void 0 : assignee.subtitle) : translate('task.assignee')} icon={assignee === null || assignee === void 0 ? void 0 : assignee.icons} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK_ASSIGNEE.getRoute(backTo)); }} shouldShowRightIcon titleWithTooltips={assigneeTooltipDetails}/>
                            <MenuItem_1.default label={(shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.displayName) ? translate('common.share') : ''} title={(_d = shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.displayName) !== null && _d !== void 0 ? _d : ''} description={(shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.displayName) ? shareDestination.subtitle : translate('common.share')} icon={shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.icons} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK_SHARE_DESTINATION); }} interactive={!(task === null || task === void 0 ? void 0 : task.parentReportID)} shouldShowRightIcon={!(task === null || task === void 0 ? void 0 : task.parentReportID)} titleWithTooltips={(shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.shouldUseFullTitleToDisplay) ? undefined : shareDestination === null || shareDestination === void 0 ? void 0 : shareDestination.displayNamesWithTooltips} rightLabel={translate('common.required')}/>
                        </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View style={styles.flexShrink0}>
                        <FormAlertWithSubmitButton_1.default isAlertVisible={!!errorMessage} message={errorMessage} onSubmit={onSubmit} enabledWhenOffline buttonRef={confirmButtonRef} buttonText={translate('newTaskPage.confirmTask')} containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5, !paddingBottom ? styles.mb5 : null]}/>
                    </react_native_1.View>
                </ScrollView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
NewTaskPage.displayName = 'NewTaskPage';
exports.default = NewTaskPage;
