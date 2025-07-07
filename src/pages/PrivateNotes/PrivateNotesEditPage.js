"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var withReportAndPrivateNotesOrNotFound_1 = require("@pages/home/report/withReportAndPrivateNotesOrNotFound");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var PrivateNotesForm_1 = require("@src/types/form/PrivateNotesForm");
function PrivateNotesEditPage(_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route, report = _a.report, accountID = _a.accountID;
    var backTo = route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetailsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
    // We need to edit the note in markdown format, but display it in HTML format
    var _g = (0, react_1.useState)(function () { var _a, _b, _c; return (0, Report_1.getDraftPrivateNote)(report.reportID).trim() || Parser_1.default.htmlToMarkdown((_c = (_b = (_a = report === null || report === void 0 ? void 0 : report.privateNotes) === null || _a === void 0 ? void 0 : _a[Number(route.params.accountID)]) === null || _b === void 0 ? void 0 : _b.note) !== null && _c !== void 0 ? _c : '').trim(); }), privateNote = _g[0], setPrivateNote = _g[1];
    /**
     * Save the draft of the private note. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the private note and still have it in edit mode.
     */
    var debouncedSavePrivateNote = (0, react_1.useMemo)(function () {
        return (0, debounce_1.default)(function (text) {
            (0, Report_1.savePrivateNotesDraft)(report.reportID, text);
        }, 1000);
    }, [report.reportID]);
    // To focus on the input field when the page loads
    var privateNotesInput = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            if (privateNotesInput.current) {
                privateNotesInput.current.focus();
            }
            return function () {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, []));
    var savePrivateNote = function () {
        var _a;
        var _b, _c, _d;
        var originalNote = (_d = (_c = (_b = report === null || report === void 0 ? void 0 : report.privateNotes) === null || _b === void 0 ? void 0 : _b[Number(route.params.accountID)]) === null || _c === void 0 ? void 0 : _c.note) !== null && _d !== void 0 ? _d : '';
        var editedNote = '';
        if (privateNote.trim() !== originalNote.trim()) {
            editedNote = (0, Report_1.handleUserDeletedLinksInHtml)(privateNote.trim(), Parser_1.default.htmlToMarkdown(originalNote).trim());
            (0, Report_1.updatePrivateNotes)(report.reportID, Number(route.params.accountID), editedNote);
        }
        // We want to delete saved private note draft after saving the note
        debouncedSavePrivateNote('');
        react_native_1.Keyboard.dismiss();
        var hasNewNoteBeenAdded = !originalNote && editedNote;
        if (!Object.values(__assign(__assign({}, report.privateNotes), (_a = {}, _a[route.params.accountID] = { note: editedNote }, _a))).some(function (item) { return item.note; }) || hasNewNoteBeenAdded) {
            (0, ReportUtils_1.goBackToDetailsPage)(report, backTo, true);
        }
        else {
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo)); });
        }
    };
    var validate = (0, react_1.useCallback)(function () {
        var errors = {};
        var privateNoteLength = privateNote.trim().length;
        if (privateNoteLength > CONST_1.default.MAX_COMMENT_LENGTH) {
            errors.privateNotes = translate('common.error.characterLimitExceedCounter', {
                length: privateNoteLength,
                limit: CONST_1.default.MAX_COMMENT_LENGTH,
            });
        }
        return errors;
    }, [privateNote, translate]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID={PrivateNotesEditPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('privateNotes.title')} onBackButtonPress={function () { return (0, ReportUtils_1.goBackFromPrivateNotes)(report, accountID, backTo); }} shouldShowBackButton onCloseButtonPress={function () { return Navigation_1.default.dismissModal(); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.PRIVATE_NOTES_FORM} onSubmit={savePrivateNote} validate={validate} style={[styles.flexGrow1, styles.ph5]} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                <Text_1.default style={[styles.mb5]}>
                    {translate(expensify_common_1.Str.extractEmailDomain((_c = (_b = personalDetailsList === null || personalDetailsList === void 0 ? void 0 : personalDetailsList[route.params.accountID]) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : '') === CONST_1.default.EMAIL.GUIDES_DOMAIN
            ? 'privateNotes.sharedNoteMessage'
            : 'privateNotes.personalNoteMessage')}
                </Text_1.default>
                <OfflineWithFeedback_1.default errors={__assign({}, ((_f = (_e = (_d = report === null || report === void 0 ? void 0 : report.privateNotes) === null || _d === void 0 ? void 0 : _d[Number(route.params.accountID)]) === null || _e === void 0 ? void 0 : _e.errors) !== null && _f !== void 0 ? _f : ''))} onClose={function () { return (0, Report_1.clearPrivateNotesError)(report.reportID, Number(route.params.accountID)); }} style={[styles.mb3]}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={PrivateNotesForm_1.default.PRIVATE_NOTES} label={translate('privateNotes.composerLabel')} accessibilityLabel={translate('privateNotes.title')} autoCompleteType="off" autoCorrect={false} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} defaultValue={privateNote} value={privateNote} onChangeText={function (text) {
            debouncedSavePrivateNote(text);
            setPrivateNote(text);
        }} ref={function (el) {
            if (!el) {
                return;
            }
            if (!privateNotesInput.current) {
                (0, updateMultilineInputRange_1.default)(el);
            }
            privateNotesInput.current = el;
        }} type="markdown"/>
                </OfflineWithFeedback_1.default>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
PrivateNotesEditPage.displayName = 'PrivateNotesEditPage';
exports.default = (0, withReportAndPrivateNotesOrNotFound_1.default)('privateNotes.title')(PrivateNotesEditPage);
