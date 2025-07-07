"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var AttachmentContext_1 = require("@components/AttachmentContext");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var withReportAndPrivateNotesOrNotFound_1 = require("@pages/home/report/withReportAndPrivateNotesOrNotFound");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function PrivateNotesListPage(_a) {
    var report = _a.report, sessionAccountID = _a.accountID;
    var route = (0, native_1.useRoute)();
    var backTo = route.params.backTo;
    var personalDetailsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var getAttachmentValue = (0, react_1.useCallback)(function (item) { return ({ reportID: item.reportID, accountID: Number(item.accountID), type: CONST_1.default.ATTACHMENT_TYPE.NOTE }); }, []);
    /**
     * Gets the menu item for each workspace
     */
    function getMenuItem(item) {
        return (<AttachmentContext_1.AttachmentContext.Provider value={getAttachmentValue(item)}>
                <MenuItemWithTopDescription_1.default key={item.title} description={item.title} title={item.note} onPress={item.action} shouldShowRightIcon={!item.disabled} numberOfLinesTitle={0} shouldRenderAsHTML brickRoadIndicator={item.brickRoadIndicator} disabled={item.disabled} shouldGreyOutWhenDisabled={false}/>
            </AttachmentContext_1.AttachmentContext.Provider>);
    }
    /**
     * Returns a list of private notes on the given chat report
     */
    var privateNotes = (0, react_1.useMemo)(function () {
        var _a;
        var privateNoteBrickRoadIndicator = function (accountID) { var _a; return (((_a = report.privateNotes) === null || _a === void 0 ? void 0 : _a[accountID].errors) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined); };
        return Object.keys((_a = report.privateNotes) !== null && _a !== void 0 ? _a : {}).map(function (privateNoteAccountID) {
            var _a, _b, _c, _d;
            var accountID = Number(privateNoteAccountID);
            var privateNote = (_a = report.privateNotes) === null || _a === void 0 ? void 0 : _a[accountID];
            return {
                reportID: report.reportID,
                accountID: privateNoteAccountID,
                title: Number(sessionAccountID) === accountID ? translate('privateNotes.myNote') : ((_c = (_b = personalDetailsList === null || personalDetailsList === void 0 ? void 0 : personalDetailsList[privateNoteAccountID]) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : ''),
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.PRIVATE_NOTES_EDIT.getRoute(report.reportID, accountID, backTo)); },
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
                note: (_d = privateNote === null || privateNote === void 0 ? void 0 : privateNote.note) !== null && _d !== void 0 ? _d : '',
                disabled: Number(sessionAccountID) !== accountID,
            };
        });
    }, [report, personalDetailsList, sessionAccountID, translate, backTo]);
    return (<ScreenWrapper_1.default testID={PrivateNotesListPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('privateNotes.title')} shouldShowBackButton onBackButtonPress={function () { return (0, ReportUtils_1.goBackToDetailsPage)(report, route.params.backTo, true); }} onCloseButtonPress={function () { return Navigation_1.default.dismissModal(); }}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1} bounces={false}>
                <Text_1.default style={[styles.mb5, styles.ph5]}>{translate('privateNotes.personalNoteMessage')}</Text_1.default>
                {privateNotes.map(function (item) { return getMenuItem(item); })}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
PrivateNotesListPage.displayName = 'PrivateNotesListPage';
exports.default = (0, withReportAndPrivateNotesOrNotFound_1.default)('privateNotes.title')(PrivateNotesListPage);
