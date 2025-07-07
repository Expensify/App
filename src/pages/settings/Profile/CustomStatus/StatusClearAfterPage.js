"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
/**
 * @param data - either a value from CONST.CUSTOM_STATUS_TYPES or a dateTime string in the format YYYY-MM-DD HH:mm
 */
function getSelectedStatusType(data) {
    switch (data) {
        case DateUtils_1.default.getEndOfToday():
            return CONST_1.default.CUSTOM_STATUS_TYPES.AFTER_TODAY;
        case CONST_1.default.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return CONST_1.default.CUSTOM_STATUS_TYPES.NEVER;
        default:
            return CONST_1.default.CUSTOM_STATUS_TYPES.CUSTOM;
    }
}
var useValidateCustomDate = function (data) {
    var _a = (0, react_1.useState)(''), customDateError = _a[0], setCustomDateError = _a[1];
    var _b = (0, react_1.useState)(''), customTimeError = _b[0], setCustomTimeError = _b[1];
    var validate = function () {
        var _a = (0, ValidationUtils_1.validateDateTimeIsAtLeastOneMinuteInFuture)(data), dateValidationErrorKey = _a.dateValidationErrorKey, timeValidationErrorKey = _a.timeValidationErrorKey;
        setCustomDateError(dateValidationErrorKey);
        setCustomTimeError(timeValidationErrorKey);
        return {
            dateError: dateValidationErrorKey,
            timeError: timeValidationErrorKey,
        };
    };
    (0, react_1.useEffect)(function () {
        if (!data) {
            return;
        }
        validate();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [data]);
    var validateCustomDate = function () { return validate(); };
    return { customDateError: customDateError, customTimeError: customTimeError, validateCustomDate: validateCustomDate };
};
function StatusClearAfterPage() {
    var _a, _b, _c;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var clearAfter = (_b = (_a = currentUserPersonalDetails.status) === null || _a === void 0 ? void 0 : _a.clearAfter) !== null && _b !== void 0 ? _b : '';
    var customStatus = (0, useOnyx_1.default)(ONYXKEYS_1.default.CUSTOM_STATUS_DRAFT, { canBeMissing: true })[0];
    var draftClearAfter = (_c = customStatus === null || customStatus === void 0 ? void 0 : customStatus.clearAfter) !== null && _c !== void 0 ? _c : '';
    var _d = (0, react_1.useState)(function () { return getSelectedStatusType(draftClearAfter || clearAfter); }), draftPeriod = _d[0], setDraftPeriod = _d[1];
    var statusType = (0, react_1.useMemo)(function () {
        return Object.entries(CONST_1.default.CUSTOM_STATUS_TYPES).map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                value: value,
                text: translate("statusPage.timePeriods.".concat(value)),
                keyForList: key,
                isSelected: draftPeriod === value,
            });
        });
    }, [draftPeriod, translate]);
    var _e = useValidateCustomDate(draftClearAfter), customDateError = _e.customDateError, customTimeError = _e.customTimeError;
    var _f = (0, react_1.useMemo)(function () { return ({
        redBrickDateIndicator: customDateError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        redBrickTimeIndicator: customTimeError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
    }); }, [customTimeError, customDateError]), redBrickDateIndicator = _f.redBrickDateIndicator, redBrickTimeIndicator = _f.redBrickTimeIndicator;
    var updateMode = (0, react_1.useCallback)(function (mode) {
        var _a;
        if (mode.value === draftPeriod) {
            return;
        }
        setDraftPeriod(mode.value);
        if (mode.value === CONST_1.default.CUSTOM_STATUS_TYPES.CUSTOM) {
            (0, User_1.updateDraftCustomStatus)({ clearAfter: DateUtils_1.default.getOneHourFromNow() });
        }
        else {
            var selectedRange = statusType.find(function (item) { return item.value === mode.value; });
            var calculatedDraftDate = DateUtils_1.default.getDateFromStatusType((_a = selectedRange === null || selectedRange === void 0 ? void 0 : selectedRange.value) !== null && _a !== void 0 ? _a : CONST_1.default.CUSTOM_STATUS_TYPES.NEVER);
            (0, User_1.updateDraftCustomStatus)({ clearAfter: calculatedDraftDate });
            Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS);
        }
    }, [draftPeriod, statusType]);
    (0, react_1.useEffect)(function () {
        (0, User_1.updateDraftCustomStatus)({
            clearAfter: draftClearAfter || clearAfter,
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var customStatusDate = DateUtils_1.default.extractDate(draftClearAfter);
    var customStatusTime = DateUtils_1.default.extractTime12Hour(draftClearAfter);
    var listFooterContent = (0, react_1.useMemo)(function () {
        if (draftPeriod !== CONST_1.default.CUSTOM_STATUS_TYPES.CUSTOM) {
            return;
        }
        return (<>
                <MenuItemWithTopDescription_1.default title={customStatusDate} description={translate('statusPage.date')} shouldShowRightIcon containerStyle={styles.pr2} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER_DATE); }} errorText={customDateError} titleStyle={styles.flex1} brickRoadIndicator={redBrickDateIndicator}/>
                <MenuItemWithTopDescription_1.default title={customStatusTime} description={translate('statusPage.time')} shouldShowRightIcon containerStyle={styles.pr2} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER_TIME); }} errorText={customTimeError} titleStyle={styles.flex1} brickRoadIndicator={redBrickTimeIndicator}/>
            </>);
    }, [translate, styles.pr2, styles.flex1, customStatusDate, customStatusTime, draftPeriod, redBrickDateIndicator, redBrickTimeIndicator, customDateError, customTimeError]);
    var timePeriodOptions = (0, react_1.useCallback)(function () {
        var _a;
        return (<SelectionList_1.default sections={[{ data: statusType }]} ListItem={RadioListItem_1.default} onSelectRow={updateMode} initiallyFocusedOptionKey={(_a = statusType.find(function (status) { return status.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList} listFooterContent={listFooterContent}/>);
    }, [statusType, updateMode, listFooterContent]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={StatusClearAfterPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('statusPage.clearAfter')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS); }}/>
            <Text_1.default style={[styles.textNormal, styles.mh5, styles.mv4]}>{translate('statusPage.whenClearStatus')}</Text_1.default>
            {timePeriodOptions()}
        </ScreenWrapper_1.default>);
}
StatusClearAfterPage.displayName = 'StatusClearAfterPage';
exports.default = StatusClearAfterPage;
