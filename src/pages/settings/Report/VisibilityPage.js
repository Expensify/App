"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var ReportUtils_1 = require("@libs/ReportUtils");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
function VisibilityPage(_a) {
    var _b;
    var report = _a.report;
    var route = (0, native_1.useRoute)();
    var _c = (0, react_1.useState)(false), showConfirmModal = _c[0], setShowConfirmModal = _c[1];
    var shouldGoBackToDetailsPage = (0, react_1.useRef)(false);
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var shouldDisableVisibility = (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived);
    var translate = (0, useLocalize_1.default)().translate;
    var visibilityOptions = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.REPORT.VISIBILITY)
            .filter(function (visibilityOption) { return visibilityOption !== CONST_1.default.REPORT.VISIBILITY.PUBLIC_ANNOUNCE; })
            .map(function (visibilityOption) { return ({
            text: translate("newRoomPage.visibilityOptions.".concat(visibilityOption)),
            value: visibilityOption,
            alternateText: translate("newRoomPage.".concat(visibilityOption, "Description")),
            keyForList: visibilityOption,
            isSelected: visibilityOption === (report === null || report === void 0 ? void 0 : report.visibility),
        }); });
    }, [translate, report === null || report === void 0 ? void 0 : report.visibility]);
    var goBack = (0, react_1.useCallback)(function () {
        (0, ReportUtils_1.goBackToDetailsPage)(report, route.params.backTo);
    }, [report, route.params.backTo]);
    var changeVisibility = (0, react_1.useCallback)(function (newVisibility) {
        if (!report) {
            return;
        }
        (0, Report_1.updateRoomVisibility)(report.reportID, report.visibility, newVisibility);
        if (showConfirmModal) {
            shouldGoBackToDetailsPage.current = true;
        }
        else {
            goBack();
        }
    }, [report, showConfirmModal, goBack]);
    var hideModal = (0, react_1.useCallback)(function () {
        setShowConfirmModal(false);
    }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={VisibilityPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldDisableVisibility}>
                <HeaderWithBackButton_1.default title={translate('newRoomPage.visibility')} onBackButtonPress={goBack}/>
                <SelectionList_1.default shouldPreventDefaultFocusOnSelectRow sections={[{ data: visibilityOptions }]} onSelectRow={function (option) {
            if (option.value === CONST_1.default.REPORT.VISIBILITY.PUBLIC) {
                setShowConfirmModal(true);
                return;
            }
            changeVisibility(option.value);
        }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_b = visibilityOptions.find(function (visibility) { return visibility.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList} ListItem={RadioListItem_1.default}/>
                <ConfirmModal_1.default isVisible={showConfirmModal} onConfirm={function () {
            changeVisibility(CONST_1.default.REPORT.VISIBILITY.PUBLIC);
            hideModal();
        }} onModalHide={function () {
            if (!shouldGoBackToDetailsPage.current) {
                return;
            }
            shouldGoBackToDetailsPage.current = false;
            goBack();
        }} onCancel={hideModal} title={translate('common.areYouSure')} prompt={translate('newRoomPage.publicDescription')} confirmText={translate('common.yes')} cancelText={translate('common.no')} danger/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
VisibilityPage.displayName = 'VisibilityPage';
exports.default = (0, withReportOrNotFound_1.default)()(VisibilityPage);
